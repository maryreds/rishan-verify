import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { analyzeProfile } from "@/lib/ai/services/profile-coach";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { count: experienceCount } = await supabase
      .from("work_experience")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);

    const { count: educationCount } = await supabase
      .from("education")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);

    const { data: skills } = await supabase
      .from("skills")
      .select("name")
      .eq("profile_id", user.id);

    const allSkills = [
      ...(profile.skills || []),
      ...(skills?.map((s: { name: string }) => s.name) || []),
    ];

    const result = await analyzeProfile({
      name: profile.full_name,
      headline: profile.headline,
      summary: profile.summary || profile.summary_ai,
      skills: allSkills,
      experience_count: experienceCount ?? 0,
      education_count: educationCount ?? 0,
      verification_status: profile.verification_status,
      photo_url: profile.photo_original_url,
      vouch_score: profile.vouch_score,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Profile coach error:", error);
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    );
  }
}
