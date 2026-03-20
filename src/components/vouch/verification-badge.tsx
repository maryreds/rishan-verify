"use client";

import { ShieldCheck, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: "verified" | "pending" | "unverified";
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const config = {
  verified: {
    icon: ShieldCheck,
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary",
    defaultLabel: "Verified",
  },
  pending: {
    icon: Clock,
    bg: "bg-accent/10",
    border: "border-accent/20",
    text: "text-accent",
    defaultLabel: "Pending",
  },
  unverified: {
    icon: Shield,
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    defaultLabel: "Not Verified",
  },
};

const sizes = {
  sm: { icon: "w-3.5 h-3.5", text: "text-[10px]", padding: "px-2 py-0.5" },
  md: { icon: "w-4 h-4", text: "text-xs", padding: "px-2.5 py-1" },
  lg: { icon: "w-5 h-5", text: "text-sm", padding: "px-3 py-1.5" },
};

export function VerificationBadge({
  status,
  label,
  size = "md",
  className,
}: VerificationBadgeProps) {
  const c = config[status];
  const s = sizes[size];
  const Icon = c.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        c.bg,
        c.border,
        c.text,
        s.padding,
        s.text,
        className
      )}
    >
      <Icon className={s.icon} />
      {label || c.defaultLabel}
    </span>
  );
}
