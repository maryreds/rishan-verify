"use client";

import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignalIndicatorProps {
  count: number;
  label?: string;
  className?: string;
}

export function SignalIndicator({
  count,
  label = "employer views",
  className,
}: SignalIndicatorProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-[var(--color-vouch-signal)]/10 text-[var(--color-vouch-signal)] border border-[var(--color-vouch-signal)]/20",
        className
      )}
    >
      <Eye className="w-3.5 h-3.5" />
      {count} {label}
    </div>
  );
}
