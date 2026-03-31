"use client";

import { useState } from "react";
import {
  Target,
  Loader2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MissingSkill {
  name: string;
  importance: "critical" | "nice_to_have";
  description: string;
}

interface SkillGapResult {
  target_role: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: MissingSkill[];
  market_insight: string;
}

export function SkillGapSection() {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapResult | null>(null);

  async function handleAnalyze() {
    if (!targetRole.trim()) {
      toast.error("Please enter a target role");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: targetRole.trim() }),
      });

      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Failed to analyze skill gap");
    } finally {
      setLoading(false);
    }
  }

  function getMatchColor(pct: number) {
    if (pct >= 80) return "text-green-500";
    if (pct >= 60) return "text-teal-500";
    if (pct >= 40) return "text-amber-500";
    return "text-red-500";
  }

  function getMatchBg(pct: number) {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 60) return "bg-teal-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Skill Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter your target role (e.g., Senior Frontend Engineer)"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Analyze
          </Button>
        </div>

        {result && (
          <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {/* Match Percentage */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Match for{" "}
                    <span className="text-primary">{result.target_role}</span>
                  </span>
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      getMatchColor(result.match_percentage)
                    )}
                  >
                    {result.match_percentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={cn(
                      "h-3 rounded-full transition-all duration-700",
                      getMatchBg(result.match_percentage)
                    )}
                    style={{ width: `${result.match_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Matching Skills */}
            {result.matching_skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Matching Skills ({result.matching_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matching_skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missing_skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Skills to Develop ({result.missing_skills.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.missing_skills.map((skill) => (
                    <div
                      key={skill.name}
                      className={cn(
                        "rounded-lg border p-3",
                        skill.importance === "critical"
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-border bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            skill.importance === "critical"
                              ? "border-red-500/50 text-red-600"
                              : "border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {skill.importance === "critical" ? "Critical" : "Nice to have"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insight */}
            {result.market_insight && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-medium flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Market Insight
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.market_insight}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
