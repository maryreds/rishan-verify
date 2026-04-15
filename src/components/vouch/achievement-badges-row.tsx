"use client";

import { cn } from "@/lib/utils";
import { AchievementBadge } from "./achievement-badge";

interface AchievementBadgesRowProps {
  identity: boolean;
  workAuth: boolean;
  background: boolean;
  education: boolean;
  references: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AchievementBadgesRow({
  identity,
  workAuth,
  background,
  education,
  references,
  size = "md",
  className,
}: AchievementBadgesRowProps) {
  return (
    <div className={cn("flex items-start justify-center gap-4", className)}>
      <AchievementBadge pillar="identity" verified={identity} size={size} />
      <AchievementBadge pillar="work-auth" verified={workAuth} size={size} />
      <AchievementBadge pillar="background" verified={background} size={size} />
      <AchievementBadge pillar="education" verified={education} size={size} />
      <AchievementBadge pillar="references" verified={references} size={size} />
    </div>
  );
}
