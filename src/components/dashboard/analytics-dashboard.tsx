"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Bookmark,
  Users,
  Loader2,
  AlertCircle,
  Search,
  Building2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Period = "7d" | "30d" | "90d";

interface AnalyticsData {
  total_views: number;
  total_saves: number;
  unique_viewers: number;
  views_by_day: { date: string; count: number }[];
  top_skills_clicked: { skill: string; count: number }[];
  top_search_terms: { term: string; count: number }[];
  top_industries: { industry: string; count: number }[];
}

const industryColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

export function AnalyticsDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  const fetchAnalytics = useCallback(async (p: Period) => {
    setLoading(true);

    try {
      const res = await fetch("/api/profile/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: p }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch analytics");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Failed to load analytics.</p>
          <Button variant="outline" size="sm" onClick={() => fetchAnalytics(period)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const maxDayCount = Math.max(...data.views_by_day.map((d) => d.count), 1);
  const maxSkillCount = Math.max(
    ...data.top_skills_clicked.map((s) => s.count),
    1
  );

  const isEmpty =
    data.total_views === 0 &&
    data.total_saves === 0 &&
    data.unique_viewers === 0;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-1">
        {(["7d", "30d", "90d"] as Period[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
          </Button>
        ))}
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <Eye className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              No profile views yet for this period. Share your Vouch profile to
              start getting insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.total_views}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Bookmark className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.total_saves}</p>
                  <p className="text-xs text-muted-foreground">Total Saves</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.unique_viewers}</p>
                  <p className="text-xs text-muted-foreground">Unique Viewers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Views over time */}
          {data.views_by_day.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Views Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-40">
                  {data.views_by_day.map((day) => {
                    const heightPct = (day.count / maxDayCount) * 100;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center justify-end gap-1 group"
                      >
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.count}
                        </span>
                        <div
                          className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary min-h-[2px]"
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {data.views_by_day[0]?.date.slice(5)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {data.views_by_day[data.views_by_day.length - 1]?.date.slice(5)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top skills */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Top Skills Viewed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.top_skills_clicked.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No skill data yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.top_skills_clicked.map((item) => {
                      const widthPct = (item.count / maxSkillCount) * 100;
                      return (
                        <div key={item.skill} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium truncate">
                              {item.skill}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {item.count}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/70 rounded-full transition-all"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top search terms */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  Top Search Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.top_search_terms.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No search data yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.top_search_terms.map((item, i) => (
                      <div
                        key={item.term}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground mr-2 text-xs w-4">
                          {i + 1}.
                        </span>
                        <span className="flex-1 truncate text-xs font-medium">
                          {item.term}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums ml-2">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top industries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Top Industries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.top_industries.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No industry data yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.top_industries.map((item, i) => (
                      <div
                        key={item.industry}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={cn(
                            "w-2.5 h-2.5 rounded-full flex-shrink-0",
                            industryColors[i % industryColors.length]
                          )}
                        />
                        <span className="flex-1 truncate text-xs font-medium">
                          {item.industry}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
