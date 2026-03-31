"use client";

import { useState } from "react";
import {
  Target,
  Search,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RankingResult {
  rank: number;
  total: number;
  query: string;
  top_skills: string[];
  boost_tips: Array<{ action: string; estimated_jump: number }>;
}

export default function RankingClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankingResult | null>(null);

  async function handleSearch() {
    if (!query.trim()) {
      toast.error("Enter a search query");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        toast.error("Failed to get ranking", { description: data.error });
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Search Ranking Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          See how you rank when employers search for candidates like you.
        </p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "React Developer Austin" or "Product Manager Remote"'
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              {loading ? "Checking..." : "Check Ranking"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && !result && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && !result && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Check your search ranking
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter a search query that an employer might use to find someone
              like you. We will show your rank and tips to improve it.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* Rank display */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Your ranking for &ldquo;{result.query}&rdquo;
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    #{result.rank}
                  </span>
                  <span className="text-xl text-muted-foreground">
                    of {result.total}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.rank <= 3
                    ? "Excellent! You are a top candidate for this search."
                    : result.rank <= 10
                      ? "Great position! You are in the top tier for this search."
                      : result.rank <= Math.ceil(result.total * 0.25)
                        ? "Good standing. A few improvements could push you higher."
                        : "There is room to improve. Check the tips below to climb the ranks."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top skills in this search */}
          {result.top_skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Top Skills in This Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.top_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boost tips */}
          {result.boost_tips.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  Boost Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.boost_tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            tip.estimated_jump >= 5
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          )}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tip.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Estimated jump: ~{tip.estimated_jump} spot
                            {tip.estimated_jump !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs flex-shrink-0",
                          tip.estimated_jump >= 5
                            ? "border-green-500 text-green-600 dark:text-green-400"
                            : "border-blue-500 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        +{tip.estimated_jump}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
