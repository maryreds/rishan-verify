"use client";

import { useState } from "react";
import {
  Briefcase,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  created_at: string;
}

interface JobMatch {
  job: Job;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string;
}

type SortBy = "score" | "date";

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-yellow-500";
  if (score >= 40) return "stroke-orange-500";
  return "stroke-red-400";
}

function MatchScoreRing({ score }: { score: number }) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn("transition-all duration-700 ease-out", getScoreRingColor(score))}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-sm font-bold", getScoreColor(score))}>{score}</span>
      </div>
    </div>
  );
}

export function JobFeedClient() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("score");

  async function findMatches() {
    setLoading(true);

    try {
      const res = await fetch("/api/jobs/match", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to find job matches");
      }
      const result = await res.json();
      setMatches(result.matches || []);
      setHasSearched(true);

      if (result.matches?.length > 0) {
        toast.success(`Found ${result.matches.length} job matches!`);
      } else {
        toast.info(result.message || "No matches found");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === "score") return b.match_score - a.match_score;
    return (
      new Date(b.job.created_at).getTime() - new Date(a.job.created_at).getTime()
    );
  });

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <Button onClick={findMatches} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Jobs...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Find Matches
            </>
          )}
        </Button>

        {matches.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={sortBy === "score" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("score")}
              >
                Match Score
              </Button>
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("date")}
              >
                Date
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Matching your profile against available jobs...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && hasSearched && matches.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              No job matches yet. There may not be any active jobs in the system,
              or try updating your skills to get better results.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !hasSearched && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Click "Find Matches" to discover jobs that fit your skills and experience.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Job cards */}
      {!loading && sortedMatches.length > 0 && (
        <div className="space-y-4">
          {sortedMatches.map((match) => {
            const salary = formatSalary(match.job.salary_min, match.job.salary_max);

            return (
              <Card key={match.job.id}>
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Score ring */}
                    <MatchScoreRing score={match.match_score} />

                    {/* Job info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base leading-tight">
                              {match.job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {match.job.company}
                            </p>
                          </div>
                          {match.job.job_type && (
                            <Badge variant="outline" className="flex-shrink-0 text-xs">
                              {match.job.job_type}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          {match.job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.job.location}
                            </span>
                          )}
                          {salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {salary}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recommendation */}
                      {match.recommendation && (
                        <p className="text-sm text-muted-foreground">
                          {match.recommendation}
                        </p>
                      )}

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {match.matching_skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs bg-green-500/10 text-green-700 border-green-500/20"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {match.missing_skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs text-red-600 border-red-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
