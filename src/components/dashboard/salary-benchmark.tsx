"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SalaryData {
  low: number;
  median: number;
  high: number;
  currency: string;
  factors: string[];
  confidence: "high" | "medium" | "low";
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

const confidenceConfig = {
  high: { label: "High Confidence", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  medium: { label: "Medium Confidence", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  low: { label: "Low Confidence", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export function SalaryBenchmark() {
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchEstimate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/salary-benchmark", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch salary estimate");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEstimate();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing market data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchEstimate}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const conf = confidenceConfig[data.confidence];
  const range = data.high - data.low;
  // Position of median within the range as a percentage
  const medianPos = range > 0 ? ((data.median - data.low) / range) * 100 : 50;

  return (
    <div className="space-y-6">
      {/* Main salary card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-5 h-5 text-primary" />
              Salary Benchmark
            </CardTitle>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                conf.color
              )}
            >
              {conf.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Median highlight */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Estimated Market Median
            </p>
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {formatCurrency(data.median, data.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">per year</p>
          </div>

          {/* Range visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(data.low, data.currency)}</span>
              <span>{formatCurrency(data.high, data.currency)}</span>
            </div>

            <div className="relative h-4 rounded-full bg-muted overflow-hidden">
              {/* Gradient bar */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

              {/* Median marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full shadow-sm"
                style={{ left: `${medianPos}%`, transform: "translateX(-50%)" }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground/60 uppercase tracking-wide">
              <span>Low end</span>
              <span>High end</span>
            </div>
          </div>

          {/* Range cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Low", value: data.low, style: "text-muted-foreground" },
              { label: "Median", value: data.median, style: "text-primary font-bold" },
              { label: "High", value: data.high, style: "text-muted-foreground" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-3 rounded-lg bg-muted/50 border border-border"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  {item.label}
                </p>
                <p className={cn("text-sm font-semibold", item.style)}>
                  {formatCurrency(item.value, data.currency)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factors card */}
      {data.factors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              Key Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.factors.map((factor, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary/5 text-foreground text-xs rounded-full border border-primary/10"
                >
                  {factor}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh button */}
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={fetchEstimate}>
          Refresh Estimate
        </Button>
      </div>
    </div>
  );
}
