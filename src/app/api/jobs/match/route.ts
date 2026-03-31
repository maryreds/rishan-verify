import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { matchJobToProfile } from "@/lib/ai/services/job-matcher";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch candidate profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("skills, headline")
      .eq("id", user.id)
      .single();

    // Also fetch skills from skills table
    const { data: dbSkills } = await supabase
      .from("skills")
      .select("name")
      .eq("profile_id", user.id);

    const candidateSkills = [
      ...(profile?.skills || []),
      ...(dbSkills?.map((s: { name: string }) => s.name) || []),
    ];
    const candidateHeadline = profile?.headline || "";

    // Fetch active jobs (limit 20)
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .limit(20);

    if (jobsError) {
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ matches: [], message: "No active jobs found" });
    }

    // Match each job
    const matchResults = await Promise.all(
      jobs.map(async (job) => {
        try {
          const result = await matchJobToProfile({
            candidateSkills,
            candidateHeadline,
            jobTitle: job.title,
            jobDescription: job.description || "",
            requiredSkills: job.required_skills || [],
          });

          return {
            job,
            ...result,
          };
        } catch {
          return {
            job,
            match_score: 0,
            matching_skills: [],
            missing_skills: [],
            recommendation: "Unable to analyze this match.",
          };
        }
      })
    );

    // Upsert job matches
    const upsertData = matchResults.map((m) => ({
      profile_id: user.id,
      job_id: m.job.id,
      match_score: m.match_score,
      matching_skills: m.matching_skills,
      missing_skills: m.missing_skills,
    }));

    await supabase.from("job_matches").upsert(upsertData, {
      onConflict: "profile_id,job_id",
    });

    // Sort by score desc, return top 10
    const sorted = matchResults
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10);

    return NextResponse.json({
      matches: sorted.map((m) => ({
        job: m.job,
        match_score: m.match_score,
        matching_skills: m.matching_skills,
        missing_skills: m.missing_skills,
        recommendation: m.recommendation,
      })),
    });
  } catch (error) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
