import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Split query into search terms
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    // Build an OR text search across full_name, headline, location, and skills
    const orFilters = terms
      .map(
        (term) =>
          `full_name.ilike.%${term}%,headline.ilike.%${term}%,location.ilike.%${term}%,skills.cs.{${term}}`
      )
      .join(",");

    const { data: matchingProfiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, headline, skills, location, vouch_score, verification_status, photo_original_url")
      .or(orFilters)
      .order("vouch_score", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profiles = matchingProfiles || [];
    const total = profiles.length;

    // Find current user's rank
    const userIndex = profiles.findIndex((p) => p.id === user.id);
    const rank = userIndex >= 0 ? userIndex + 1 : total + 1;

    // Get the current user's profile for comparison
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("*, verification_status")
      .eq("id", user.id)
      .single();

    // Aggregate top skills from top-ranked profiles
    const topProfiles = profiles.slice(0, Math.min(10, profiles.length));
    const skillCounts: Record<string, number> = {};
    for (const p of topProfiles) {
      if (p.skills && Array.isArray(p.skills)) {
        for (const skill of p.skills) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      }
    }

    const top_skills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill]) => skill);

    // Generate boost tips
    const boost_tips: Array<{ action: string; estimated_jump: number }> = [];

    if (myProfile) {
      const isVerified = myProfile.verification_status === "verified";
      const mySkills = myProfile.skills || [];
      const hasPhoto = !!myProfile.photo_original_url;
      const hasSummary = !!(myProfile.summary || myProfile.summary_ai);
      const hasHeadline = !!myProfile.headline;
      const hasLocation = !!myProfile.location;

      if (!isVerified) {
        boost_tips.push({
          action: "Verify your identity",
          estimated_jump: Math.max(1, Math.round(total * 0.08)),
        });
      }

      // Check how many top skills the user is missing
      const missingSkills = top_skills.filter(
        (s) => !mySkills.map((ms: string) => ms.toLowerCase()).includes(s.toLowerCase())
      );
      if (missingSkills.length > 0) {
        const count = Math.min(missingSkills.length, 5);
        boost_tips.push({
          action: `Add ${count} in-demand skill${count > 1 ? "s" : ""}: ${missingSkills.slice(0, count).join(", ")}`,
          estimated_jump: Math.max(1, Math.round(count * 1.5)),
        });
      }

      if (!hasPhoto) {
        boost_tips.push({
          action: "Upload a professional photo",
          estimated_jump: Math.max(1, Math.round(total * 0.04)),
        });
      }

      if (!hasSummary) {
        boost_tips.push({
          action: "Write a professional summary",
          estimated_jump: Math.max(1, Math.round(total * 0.03)),
        });
      }

      if (!hasHeadline) {
        boost_tips.push({
          action: "Add a compelling headline",
          estimated_jump: Math.max(1, Math.round(total * 0.03)),
        });
      }

      if (!hasLocation) {
        boost_tips.push({
          action: "Add your location",
          estimated_jump: Math.max(1, Math.round(total * 0.02)),
        });
      }

      // Check portfolio
      const { count: portfolioCount } = await supabase
        .from("portfolio_items")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id);

      if ((portfolioCount || 0) < 3) {
        boost_tips.push({
          action: "Add portfolio projects to showcase your work",
          estimated_jump: Math.max(1, Math.round(total * 0.05)),
        });
      }
    }

    // Sort tips by estimated jump descending
    boost_tips.sort((a, b) => b.estimated_jump - a.estimated_jump);

    return NextResponse.json({
      rank,
      total,
      query,
      top_skills,
      boost_tips,
    });
  } catch (error) {
    console.error("Ranking error:", error);
    return NextResponse.json(
      { error: "Failed to calculate ranking" },
      { status: 500 }
    );
  }
}
