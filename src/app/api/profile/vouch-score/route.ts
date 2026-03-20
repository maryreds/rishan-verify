import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { calculateVouchScore } from "@/lib/ai/services/vouch-score";

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

    const { data: experience } = await supabase
      .from("work_experience")
      .select("description")
      .eq("profile_id", user.id);

    const { data: education } = await supabase
      .from("education")
      .select("id")
      .eq("profile_id", user.id);

    const { data: skills } = await supabase
      .from("skills")
      .select("id")
      .eq("profile_id", user.id);

    const { data: portfolio } = await supabase
      .from("portfolio_items")
      .select("id")
      .eq("profile_id", user.id);

    const { data: assessments } = await supabase
      .from("assessments")
      .select("id")
      .eq("profile_id", user.id);

    const { data: latestVerification } = await supabase
      .from("verification_requests")
      .select("immigration_status, status")
      .eq("profile_id", user.id)
      .eq("status", "completed")
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .single();

    const isVerified = profile.verification_status === "verified";

    const score = calculateVouchScore({
      full_name: profile.full_name,
      headline: profile.headline,
      summary: profile.summary || profile.summary_ai,
      location: profile.location,
      skills_count: (skills?.length || 0) + (profile.skills?.length || 0),
      photo_url: profile.photo_original_url,
      experience_count: experience?.length || 0,
      experience_with_descriptions: experience?.filter((e: { description: string | null }) => e.description)?.length || 0,
      education_count: education?.length || 0,
      verification_identity: isVerified,
      verification_work_auth: !!latestVerification?.immigration_status,
      verification_background: false,
      portfolio_count: portfolio?.length || 0,
      assessments_count: assessments?.length || 0,
    });

    await supabase
      .from("profiles")
      .update({ vouch_score: score.total })
      .eq("id", user.id);

    return NextResponse.json(score);
  } catch (error) {
    console.error("Vouch score error:", error);
    return NextResponse.json(
      { error: "Failed to calculate score" },
      { status: 500 }
    );
  }
}
