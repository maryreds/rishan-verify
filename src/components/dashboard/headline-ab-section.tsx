"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

interface HeadlineVariant {
  id: string;
  headline: string;
  rationale?: string;
  tone?: "professional" | "creative" | "technical";
  is_active: boolean;
  views_count?: number;
}

export function HeadlineABSection() {
  const [variants, setVariants] = useState<HeadlineVariant[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [loadingVariants, setLoadingVariants] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadVariants();
  }, []);

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
        // Reload from DB to get IDs
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
            Headline A/B Testing
          </CardTitle>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="sm"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate New Variants
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadingVariants ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              No headline variants yet
            </p>
            <p className="text-xs text-muted-foreground">
              Generate AI-powered headline variants to test which performs best
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  variant.is_active
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {variant.is_active && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                          <CheckCircle className="w-3 h-3 mr-0.5" />
                          Active
                        </Badge>
                      )}
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
                      {typeof variant.views_count === "number" && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
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
                  </div>
                  {!variant.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivate(variant.id)}
                      disabled={activating === variant.id}
                      className="flex-shrink-0"
                    >
                      {activating === variant.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
