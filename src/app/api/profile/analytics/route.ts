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

    const { period = "30d" } = await request.json();

    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    const days = daysMap[period] || 30;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    // Fetch all views for period
    const { data: views } = await supabase
      .from("profile_views")
      .select("*")
      .eq("profile_id", user.id)
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: true });

    const allViews = views || [];

    // Total views
    const total_views = allViews.length;

    // Total saves (where action = 'save')
    const total_saves = allViews.filter(
      (v: Record<string, unknown>) => v.action === "save"
    ).length;

    // Unique viewers
    const uniqueViewerIds = new Set(
      allViews
        .filter((v: Record<string, unknown>) => v.viewer_id)
        .map((v: Record<string, unknown>) => v.viewer_id as string)
    );
    const unique_viewers = uniqueViewerIds.size;

    // Views by day
    const viewsByDayMap: Record<string, number> = {};
    for (const view of allViews) {
      const day = (view.created_at as string).slice(0, 10);
      viewsByDayMap[day] = (viewsByDayMap[day] || 0) + 1;
    }
    const views_by_day = Object.entries(viewsByDayMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Top skills clicked (from skills_matched array column)
    const skillCounts: Record<string, number> = {};
    for (const view of allViews) {
      const matched = view.skills_matched as string[] | null;
      if (Array.isArray(matched)) {
        for (const skill of matched) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      }
    }
    const top_skills_clicked = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    // Top search terms
    const searchCounts: Record<string, number> = {};
    for (const view of allViews) {
      const query = view.search_query as string | null;
      if (query) {
        searchCounts[query] = (searchCounts[query] || 0) + 1;
      }
    }
    const top_search_terms = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));

    // Top industries
    const industryCounts: Record<string, number> = {};
    for (const view of allViews) {
      const industry = view.viewer_industry as string | null;
      if (industry) {
        industryCounts[industry] = (industryCounts[industry] || 0) + 1;
      }
    }
    const top_industries = Object.entries(industryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([industry, count]) => ({ industry, count }));

    return NextResponse.json({
      total_views,
      total_saves,
      unique_viewers,
      views_by_day,
      top_skills_clicked,
      top_search_terms,
      top_industries,
    });
  } catch (error) {
    console.error("Profile analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
