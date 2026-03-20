"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: { value: string; positive: boolean };
  iconColor?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  iconColor = "text-primary",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex items-center gap-3",
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {trend && (
          <p
            className={cn(
              "text-[10px] font-medium mt-0.5",
              trend.positive ? "text-primary" : "text-destructive"
            )}
          >
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
