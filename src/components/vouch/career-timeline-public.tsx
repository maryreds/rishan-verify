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
}

interface CareerTimelinePublicProps {
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
    })),
    ...edu.map((e) => ({
      id: e.id,
      type: "education" as const,
      title: e.degree ? `${e.degree}${e.field_of_study ? ` in ${e.field_of_study}` : ""}` : e.field_of_study || "Education",
      subtitle: e.institution,
      startDate: e.start_date,
      endDate: e.end_date,
      isCurrent: false,
    })),
  ];

  entries.sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate).getTime() : 0;
    const db = b.startDate ? new Date(b.startDate).getTime() : 0;
    return db - da;
  });

  return entries;
}

export function CareerTimelinePublic({ workExperience, education, className }: CareerTimelinePublicProps) {
  const entries = buildEntries(workExperience, education);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6">
        {entries.map((entry) => {
          const Icon = entry.type === "work" ? Briefcase : GraduationCap;

          return (
            <div key={entry.id} className="relative pl-12">
              {/* Node dot */}
              <div
                className={cn(
                  "absolute left-2.5 top-1 w-3 h-3 rounded-full border-2",
                  entry.type === "work"
                    ? "bg-primary border-primary/60"
                    : "bg-[var(--color-vouch-signal,#8b5cf6)] border-[var(--color-vouch-signal,#8b5cf6)]/60"
                )}
              />

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
