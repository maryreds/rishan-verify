"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { VerificationBadge } from "./verification-badge";
import { ScoreRing } from "./score-ring";

interface CandidateCardProps {
  name: string;
  headline?: string | null;
  location?: string | null;
  photoUrl?: string | null;
  slug?: string | null;
  vouchScore?: number;
  verificationStatus?: "verified" | "pending" | "unverified";
  skills?: string[];
  className?: string;
}

export function CandidateCard({
  name,
  headline,
  location,
  photoUrl,
  slug,
  vouchScore = 0,
  verificationStatus = "unverified",
  skills = [],
  className,
}: CandidateCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-14 h-14 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <VerificationBadge status={verificationStatus} size="sm" />
          </div>
          {headline && (
            <p className="text-sm text-muted-foreground truncate">{headline}</p>
          )}
          {location && (
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {location}
            </p>
          )}
        </div>
        <ScoreRing score={vouchScore} size={56} strokeWidth={4} label="" />
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (slug) {
    return <Link href={`/v/${slug}`}>{content}</Link>;
  }

  return content;
}
