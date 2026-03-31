"use client";

import { useState, useEffect } from "react";
import { Eye, Bookmark, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SignalData {
  views_this_week: number;
  saves_count: number;
  top_industries: string[];
}

export function InterestSignals({ className }: { className?: string }) {
  const [data, setData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile/signals", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((d) => setData(d))
      .catch(() => {
        toast.error("Could not load interest signals");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Employer Interest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-6 bg-muted rounded-lg w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const stats = [
    {
      icon: Eye,
      value: data.views_this_week,
      label: "views this week",
      color: "text-[var(--color-vouch-signal,#8b5cf6)]",
      bg: "bg-[var(--color-vouch-signal,#8b5cf6)]/10",
    },
    {
      icon: Bookmark,
      value: data.saves_count,
      label: "employers saved your profile",
      color: "text-[var(--color-vouch-signal,#8b5cf6)]",
      bg: "bg-[var(--color-vouch-signal,#8b5cf6)]/10",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-vouch-signal,#8b5cf6)]" />
          Employer Interest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              stat.bg
            )}
          >
            <stat.icon className={cn("w-5 h-5 flex-shrink-0", stat.color)} />
            <div>
              <span className="text-lg font-bold text-foreground">{stat.value}</span>{" "}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          </div>
        ))}

        {data.top_industries.length > 0 && (
          <div className="pt-1">
            <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">
              Top Industries Viewing
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.top_industries.map((industry) => (
                <span
                  key={industry}
                  className="px-2 py-0.5 bg-[var(--color-vouch-signal,#8b5cf6)]/10 text-[var(--color-vouch-signal,#8b5cf6)] text-[11px] font-medium rounded-full"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.views_this_week === 0 && data.saves_count === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Complete your profile to start attracting employer attention.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
