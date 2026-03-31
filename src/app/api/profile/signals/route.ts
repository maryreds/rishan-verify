import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Views this week
    let viewsThisWeek = 0;
    try {
      const { count } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .gte("created_at", oneWeekAgo);
      viewsThisWeek = count ?? 0;
    } catch {
      // Column or table may not exist yet
    }

    // Saves count
    let savesCount = 0;
    try {
      const { count } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("action", "save");
      savesCount = count ?? 0;
    } catch {
      // Column may not exist yet
    }

    // Top industries
    let topIndustries: string[] = [];
    try {
      const { data: industryRows } = await supabase
        .from("profile_views")
        .select("viewer_industry")
        .eq("profile_id", user.id)
        .not("viewer_industry", "is", null);

      if (industryRows && industryRows.length > 0) {
        const counts: Record<string, number> = {};
        for (const row of industryRows) {
          const ind = (row as { viewer_industry: string }).viewer_industry;
          if (ind) counts[ind] = (counts[ind] || 0) + 1;
        }
        topIndustries = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);
      }
    } catch {
      // Column may not exist yet
    }

    return NextResponse.json({
      views_this_week: viewsThisWeek,
      saves_count: savesCount,
      top_industries: topIndustries,
    });
  } catch (error) {
    console.error("Interest signals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}
