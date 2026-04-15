"use client";

import { Shield, FileCheck, ShieldCheck, GraduationCap, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  pillar: "identity" | "work-auth" | "background" | "education" | "references";
  verified: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const pillarConfig = {
  identity: {
    icon: Shield,
    gradient: "from-emerald-500 to-emerald-800",
    defaultLabel: "Identity",
  },
  "work-auth": {
    icon: FileCheck,
    gradient: "from-blue-500 to-blue-800",
    defaultLabel: "Work Auth",
  },
  background: {
    icon: ShieldCheck,
    gradient: "from-violet-500 to-violet-800",
    defaultLabel: "Background",
  },
  education: {
    icon: GraduationCap,
    gradient: "from-amber-500 to-amber-700",
    defaultLabel: "Education",
  },
  references: {
    icon: Users,
    gradient: "from-rose-500 to-rose-700",
    defaultLabel: "References",
  },
};

const sizes = {
  sm: { outer: 64, inner: 48, icon: 22, lock: 14, label: "text-[10px]" },
  md: { outer: 96, inner: 72, icon: 32, lock: 18, label: "text-xs" },
  lg: { outer: 120, inner: 90, icon: 40, lock: 22, label: "text-sm" },
};

const chromeGradient =
  "conic-gradient(from 0deg, #d4d4d8, #fafafa, #a1a1aa, #e4e4e7, #d4d4d8)";

const mutedChromeGradient =
  "conic-gradient(from 0deg, #52525b, #71717a, #3f3f46, #52525b, #52525b)";

export function AchievementBadge({
  pillar,
  verified,
  size = "md",
  label,
  className,
}: AchievementBadgeProps) {
  const config = pillarConfig[pillar];
  const s = sizes[size];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {/* Metallic outer frame */}
      <div
        className={cn("relative rounded-full p-0", verified ? "opacity-100" : "opacity-70")}
        style={{
          width: s.outer,
          height: s.outer,
          background: verified ? chromeGradient : mutedChromeGradient,
          boxShadow: verified
            ? "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner colored circle */}
        <div
          className={cn(
            "absolute rounded-full bg-gradient-to-b",
            verified ? config.gradient : "from-zinc-600 to-zinc-800"
          )}
          style={{
            width: s.inner,
            height: s.inner,
            top: (s.outer - s.inner) / 2,
            left: (s.outer - s.inner) / 2,
          }}
        >
          {/* Gloss / shine overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 50%)",
            }}
          />

          {/* Icon centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              size={s.icon}
              className={cn(
                "drop-shadow-sm",
                verified ? "text-white" : "text-zinc-400"
              )}
              strokeWidth={1.75}
            />
          </div>
        </div>

        {/* Lock overlay for unverified */}
        {!verified && (
          <div
            className="absolute flex items-center justify-center rounded-full bg-zinc-700 border-2 border-zinc-500"
            style={{
              width: s.lock + 6,
              height: s.lock + 6,
              bottom: 0,
              right: 0,
            }}
          >
            <Lock size={s.lock} className="text-zinc-300" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "font-semibold",
          s.label,
          verified ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label || config.defaultLabel}
      </span>
    </div>
  );
}
