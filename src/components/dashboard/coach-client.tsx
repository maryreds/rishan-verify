"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Star,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

/* ─── Types ───────────────────────────────────────────────────────── */

interface Suggestion {
  category: string;
  title: string;
  message: string;
  action_type:
    | "generate_summary"
    | "add_skills"
    | "add_experience"
    | "upload_photo"
    | "verify_identity"
    | "improve_headline"
    | "add_portfolio";
  impact: "high" | "medium" | "low";
}

interface CoachResult {
  overall_grade: "A" | "B" | "C" | "D" | "F";
  suggestions: Suggestion[];
}

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

interface HeadlineVariant {
  id: string;
  headline: string;
  rationale?: string;
  tone?: "professional" | "creative" | "technical";
  is_active: boolean;
  views_count?: number;
}

/* ─── Config ──────────────────────────────────────────────────────── */

const gradeConfig: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  A: {
    color: "text-green-700",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Excellent",
  },
  B: {
    color: "text-teal-700",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    label: "Strong",
  },
  C: {
    color: "text-amber-700",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "Average",
  },
  D: {
    color: "text-orange-700",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "Needs Work",
  },
  F: {
    color: "text-red-700",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Incomplete",
  },
};

const impactConfig: Record<string, { color: string; bg: string }> = {
  high: { color: "text-red-700", bg: "bg-red-500/10 border-red-500/20" },
  medium: {
    color: "text-amber-700",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  low: {
    color: "text-muted-foreground",
    bg: "bg-muted border-muted-foreground/20",
  },
};

/* ─── Component ───────────────────────────────────────────────────── */

export function CoachClient() {
  const router = useRouter();
  const supabase = createClient();

  /* Coach analysis state */
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [applyingAction, setApplyingAction] = useState<string | null>(null);

  /* Skill gap state */
  const [targetRole, setTargetRole] = useState("");
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillResult, setSkillResult] = useState<SkillGapResult | null>(null);

  /* Headline A/B state */
  const [variants, setVariants] = useState<HeadlineVariant[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [loadingVariants, setLoadingVariants] = useState(true);

  useEffect(() => {
    fetchCoachAnalysis();
    loadVariants();
  }, []);

  /* ── Coach analysis ─────────────────────────────────────────────── */

  async function fetchCoachAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/profile-coach", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Failed to load AI coaching analysis");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(suggestion: Suggestion) {
    setApplyingAction(suggestion.action_type);

    try {
      switch (suggestion.action_type) {
        case "generate_summary": {
          const res = await fetch("/api/ai/generate-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (res.ok) {
            toast.success("Summary generated! Check your profile.");
            router.push("/dashboard/profile");
          } else {
            toast.error("Failed to generate summary");
          }
          break;
        }
        case "improve_headline":
          router.push("/dashboard/profile");
          break;
        case "add_skills":
          router.push("/dashboard/profile");
          break;
        case "add_experience":
          router.push("/dashboard/profile");
          break;
        case "upload_photo":
          router.push("/dashboard");
          break;
        case "verify_identity":
          router.push("/dashboard/verify");
          break;
        case "add_portfolio":
          router.push("/dashboard/portfolio");
          break;
        default:
          router.push("/dashboard/profile");
      }
    } catch {
      toast.error("Failed to apply suggestion");
    } finally {
      setApplyingAction(null);
    }
  }

  /* ── Skill gap analysis ─────────────────────────────────────────── */

  async function handleSkillAnalyze() {
    if (!targetRole.trim()) {
      toast.error("Please enter a target role");
      return;
    }

    setSkillLoading(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: targetRole.trim() }),
      });

      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      setSkillResult(data);
    } catch {
      toast.error("Failed to analyze skill gap");
    } finally {
      setSkillLoading(false);
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

  /* ── Headline A/B ───────────────────────────────────────────────── */

  async function loadVariants() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("headline_variants")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setVariants(data);
    } catch {
      // silently fail
    } finally {
      setLoadingVariants(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/headline-variants", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();

      if (data.variants) {
        await loadVariants();
        toast.success("Generated 3 new headline variants!");
      }
    } catch {
      toast.error("Failed to generate headline variants");
    } finally {
      setGenerating(false);
    }
  }

  async function handleActivate(variantId: string) {
    setActivating(variantId);
    try {
      const res = await fetch("/api/headline-variants/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });

      if (!res.ok) throw new Error("Failed to activate");

      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          is_active: v.id === variantId,
        }))
      );
      toast.success("Headline activated and updated on your profile!");
    } catch {
      toast.error("Failed to activate headline");
    } finally {
      setActivating(null);
    }
  }

  function getToneBadgeStyle(tone?: string) {
    switch (tone) {
      case "professional":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "creative":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "technical":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      default:
        return "";
    }
  }

  /* ── Loading state ──────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-[var(--font-headline)] font-extrabold tracking-tight">
            AI Career Coach
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Refine your professional narrative with Vera...
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            AI is reviewing your profile...
          </p>
          <Loader2 className="w-5 h-5 animate-spin text-primary mt-2" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-[var(--font-headline)] font-extrabold tracking-tight">
            AI Career Coach
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Refine your professional narrative with Vera...
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Unable to load coaching analysis. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchCoachAnalysis}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grade = gradeConfig[result.overall_grade] || gradeConfig.C;

  /* ── Salary chart bars ──────────────────────────────────────────── */
  const salaryBars = [
    { label: "$90k", height: 32 },
    { label: "$100k", height: 48 },
    { label: "$110k", height: 64 },
    { label: "$120k", height: 88 },
    { label: "$130k", height: 100, isYou: true },
    { label: "$140k", height: 72 },
    { label: "$150k", height: 40 },
  ];

  const keywords = ["STAKEHOLDERS", "EFFICIENCY", "SCALABLE", "CROSS-FUNCTIONAL", "ROI"];

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-[var(--font-headline)] font-extrabold tracking-tight">
          AI Career Coach
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Refine your professional narrative with Vera, your AI-powered career
          strategist
        </p>
      </div>

      {/* Overall Grade (preserved) */}
      <Card className={cn("border-2", grade.border)}>
        <CardContent className="py-6 flex items-center gap-6">
          <div
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0",
              grade.bg
            )}
          >
            <span className={cn("text-4xl font-bold", grade.color)}>
              {result.overall_grade}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold">
              Profile Grade:{" "}
              <span className={grade.color}>{grade.label}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.suggestions.length === 0
                ? "Your profile is fully optimized! Keep it updated."
                : `We found ${result.suggestions.length} suggestion${result.suggestions.length !== 1 ? "s" : ""} to improve your profile.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions (preserved) */}
      {result.suggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-[var(--font-headline)] font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Improvement Suggestions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.suggestions.map((suggestion, i) => {
              const impact = impactConfig[suggestion.impact] || impactConfig.low;

              return (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="py-4 px-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {suggestion.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 capitalize",
                          impact.bg,
                          impact.color
                        )}
                      >
                        {suggestion.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3 flex-1">
                      {suggestion.message}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="self-start"
                      disabled={applyingAction === suggestion.action_type}
                      onClick={() => handleApply(suggestion)}
                    >
                      {applyingAction === suggestion.action_type ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : suggestion.action_type === "generate_summary" ? (
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {suggestion.action_type === "generate_summary"
                        ? "Generate with AI"
                        : "Apply"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Bento Grid ═══ */}
      <div className="grid grid-cols-12 gap-8">
        {/* ── Mock Interview Simulator (col-span-8) ── */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-card border border-border rounded-[2rem] overflow-hidden h-[600px] flex flex-col">
            {/* Card header */}
            <div className="flex items-center justify-between px-8 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  videocam
                </span>
                <div>
                  <h3 className="text-lg font-[var(--font-headline)] font-extrabold tracking-tight">
                    Mock Interview Simulator
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Live Session with Vera
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-500/10 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Two-column inner grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 px-8 pb-8 min-h-0">
              {/* Left: Video feed area */}
              <div className="relative rounded-2xl overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4jEecapBcAyBlRDwEijan85FiA-9pzV6O0VYRkRT6w2Bx5NCVbXh5lTJm5n04cD27MPOZDvq9xXTrjkAV3cxBD2ofW7eZV0LBZUk0dlEyDPSGiURyLKZajmvMy-D1r3NeZT8N9VtAOAsep2RzqESvEMTs_5n0Q-yTHrv24lxK9PjyeP-vJHaHquSVVoLRuvNj3grsX7kpowDHa6Gg0uo4ZN6u7S3bWx0AwdG9ZJHSenxY7jCBSJCZHYY580y_-KsU8XEUQrUxASw"
                  alt="Vera AI Interview Coach"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Question overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                    Current Question
                  </p>
                  <p className="text-white text-sm font-medium leading-snug">
                    &ldquo;Tell me about a time you led a cross-functional
                    initiative that improved operational efficiency.&rdquo;
                  </p>
                </div>
              </div>

              {/* Right: Real-time feedback panel */}
              <div className="flex flex-col gap-4 md:pl-6 pt-4 md:pt-0 min-h-0 overflow-y-auto">
                <div>
                  <h4 className="text-sm font-[var(--font-headline)] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">
                      insights
                    </span>
                    Vera&apos;s Live Analysis
                  </h4>
                </div>

                {/* Confidence Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Confidence Level
                    </span>
                    <span className="text-sm font-extrabold text-primary">
                      88%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-primary transition-all duration-700"
                      style={{ width: "88%" }}
                    />
                  </div>
                </div>

                {/* Clarity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Clarity of Response
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      74%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-foreground/60 transition-all duration-700"
                      style={{ width: "74%" }}
                    />
                  </div>
                </div>

                {/* Target Keyword Density */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Target Keyword Density
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="bg-primary/10 text-primary text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* End Session button */}
                <Button className="w-full" variant="outline">
                  <span className="material-symbols-outlined text-base mr-2">
                    stop_circle
                  </span>
                  End Session &amp; Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Salary Benchmarking (col-span-4) ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-card border border-border rounded-[2rem] p-8 h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">
                payments
              </span>
              <h3 className="text-lg font-[var(--font-headline)] font-extrabold tracking-tight">
                Salary Benchmarking
              </h3>
            </div>

            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">
                Estimated Range
              </p>
              <p className="text-3xl font-extrabold text-foreground">
                $115k &ndash; $140k
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your skills, experience &amp; location
              </p>
            </div>

            {/* Bar chart */}
            <div className="flex-1 flex items-end gap-2 pt-4">
              {salaryBars.map((bar) => (
                <div
                  key={bar.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {bar.isYou && (
                    <span className="text-[9px] font-bold text-primary whitespace-nowrap">
                      YOU (840)
                    </span>
                  )}
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      bar.isYou ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                    style={{ height: `${bar.height}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Vouch Score Impact */}
            <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-xs font-semibold flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">
                  verified
                </span>
                Vouch Score Impact
              </p>
              <p className="text-xs text-muted-foreground">
                Your 840 Vouch Score places you in the{" "}
                <span className="text-primary font-semibold">top 12%</span> of
                candidates, unlocking premium salary tiers.
              </p>
            </div>
          </div>
        </div>

        {/* ── Profile Headline A/B Test (col-span-4) ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-card border border-border rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  science
                </span>
                <h3 className="text-lg font-[var(--font-headline)] font-extrabold tracking-tight">
                  Headline A/B Test
                </h3>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                size="sm"
                variant="outline"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1.5" />
                )}
                Generate
              </Button>
            </div>

            {loadingVariants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : variants.length === 0 ? (
              /* Static demo variants when none exist */
              <div className="space-y-4">
                {/* Variant A */}
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      Variant A
                    </Badge>
                    <span className="text-sm font-bold text-muted-foreground">
                      3.2% CTR
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    &ldquo;Experienced Product Manager | SaaS &amp; B2B&rdquo;
                  </p>
                </div>

                {/* Variant B (winner) */}
                <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                        <Star className="w-3 h-3 mr-0.5" />
                        Winner
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        Variant B
                      </Badge>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      8.7% CTR
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    &ldquo;I turn user pain into product gains | PM @ Scale-Ups
                    | 3x Revenue Growth&rdquo;
                  </p>
                </div>

                {/* Vera suggestion */}
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Vera&apos;s take:
                    </span>{" "}
                    Variant B outperforms by 172%. Action-oriented headlines with
                    quantified results drive significantly higher engagement from
                    recruiters.
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full"
                  size="sm"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1.5" />
                  )}
                  Generate Your Own Variants
                </Button>
              </div>
            ) : (
              /* Real variants from DB */
              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div
                    key={variant.id}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      variant.is_active
                        ? "border-2 border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {variant.is_active && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                            <Star className="w-3 h-3 mr-0.5" />
                            Active
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                          Variant {String.fromCharCode(65 + idx)}
                        </Badge>
                        {variant.tone && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0 capitalize",
                              getToneBadgeStyle(variant.tone)
                            )}
                          >
                            {variant.tone}
                          </Badge>
                        )}
                      </div>
                      {typeof variant.views_count === "number" && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {variant.views_count} views
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{variant.headline}</p>
                    {variant.rationale && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {variant.rationale}
                      </p>
                    )}
                    {!variant.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => handleActivate(variant.id)}
                        disabled={activating === variant.id}
                      >
                        {activating === variant.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Activate"
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Skill Gap Analysis (col-span-8) ── */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-card border border-border rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">
                target
              </span>
              <div>
                <h3 className="text-lg font-[var(--font-headline)] font-extrabold tracking-tight">
                  Skill Gap Analysis
                </h3>
                <p className="text-xs text-muted-foreground">
                  See how your skills match your target role
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                  search
                </span>
                <Input
                  placeholder="Enter your target role (e.g., Senior Frontend Engineer)"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSkillAnalyze()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSkillAnalyze} disabled={skillLoading}>
                {skillLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <span className="material-symbols-outlined text-base mr-2">
                    target
                  </span>
                )}
                Analyze
              </Button>
            </div>

            {skillResult && (
              <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {/* Match Percentage */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Match for{" "}
                        <span className="text-primary">
                          {skillResult.target_role}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          getMatchColor(skillResult.match_percentage)
                        )}
                      >
                        {skillResult.match_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={cn(
                          "h-3 rounded-full transition-all duration-700",
                          getMatchBg(skillResult.match_percentage)
                        )}
                        style={{ width: `${skillResult.match_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Matching Skills */}
                {skillResult.matching_skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Matching Skills ({skillResult.matching_skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillResult.matching_skills.map((skill) => (
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
                {skillResult.missing_skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Skills to Develop ({skillResult.missing_skills.length})
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {skillResult.missing_skills.map((skill) => (
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
                            <span className="text-sm font-medium">
                              {skill.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                skill.importance === "critical"
                                  ? "border-red-500/50 text-red-600"
                                  : "border-muted-foreground/30 text-muted-foreground"
                              )}
                            >
                              {skill.importance === "critical"
                                ? "Critical"
                                : "Nice to have"}
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
                {skillResult.market_insight && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                    <p className="text-sm font-medium flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-primary text-base">
                        trending_up
                      </span>
                      Market Insight
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {skillResult.market_insight}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
