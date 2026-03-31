"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkExperience, Education } from "@/lib/types";

interface TimelineEntry {
  id: string;
  type: "work" | "education";
  title: string;
  subtitle: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description?: string | null;
}

interface CareerTimelineProps {
  workExperience: WorkExperience[];
  education: Education[];
  className?: string;
}

function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function dateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const s = formatDate(start);
  const e = isCurrent ? "Present" : formatDate(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} — ${e}`;
}

function buildEntries(work: WorkExperience[], edu: Education[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...work.map((w) => ({
      id: w.id,
      type: "work" as const,
      title: w.title,
      subtitle: w.company,
      startDate: w.start_date,
      endDate: w.end_date,
      isCurrent: w.is_current,
      description: w.description,
    })),
    ...edu.map((e) => ({
      id: e.id,
      type: "education" as const,
      title: e.degree ? `${e.degree}${e.field_of_study ? ` in ${e.field_of_study}` : ""}` : e.field_of_study || "Education",
      subtitle: e.institution,
      startDate: e.start_date,
      endDate: e.end_date,
      isCurrent: false,
      description: null,
    })),
  ];

  // Sort by start date descending (most recent first), nulls at end
  entries.sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate).getTime() : 0;
    const db = b.startDate ? new Date(b.startDate).getTime() : 0;
    return db - da;
  });

  return entries;
}

export function CareerTimeline({ workExperience, education, className }: CareerTimelineProps) {
  const entries = buildEntries(workExperience, education);

  if (entries.length === 0) {
    return (
      <div className={cn("text-center py-12 text-muted-foreground text-sm", className)}>
        No career history yet. Add work experience or education to see your timeline.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-px" />

      <div className="space-y-8">
        {entries.map((entry, index) => {
          const isLeft = index % 2 === 0;
          const Icon = entry.type === "work" ? Briefcase : GraduationCap;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "relative pl-12 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-8",
                isLeft ? "" : ""
              )}
            >
              {/* Node dot */}
              <div
                className={cn(
                  "absolute left-2.5 lg:left-1/2 top-1 w-3 h-3 rounded-full border-2 z-10 lg:-translate-x-1.5",
                  entry.type === "work"
                    ? "bg-primary border-primary/60"
                    : "bg-[var(--color-vouch-signal,#8b5cf6)] border-[var(--color-vouch-signal,#8b5cf6)]/60"
                )}
              />

              {/* Content card — alternating sides on large screens */}
              <div
                className={cn(
                  "lg:col-span-1",
                  isLeft ? "lg:col-start-1 lg:text-right lg:pr-8" : "lg:col-start-2 lg:pl-8"
                )}
              >
                <div
                  className={cn(
                    "bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow",
                    isLeft ? "lg:ml-auto" : ""
                  )}
                >
                  <div className={cn("flex items-center gap-2 mb-1", isLeft ? "lg:flex-row-reverse" : "")}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                        entry.type === "work"
                          ? "bg-primary/10 text-primary"
                          : "bg-[var(--color-vouch-signal,#8b5cf6)]/10 text-[var(--color-vouch-signal,#8b5cf6)]"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {entry.type === "work" ? "Work" : "Education"}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground leading-snug">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.subtitle}</p>

                  {dateRange(entry.startDate, entry.endDate, entry.isCurrent) && (
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {dateRange(entry.startDate, entry.endDate, entry.isCurrent)}
                    </p>
                  )}

                  {entry.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
