import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Look up by vanity_slug first, then public_slug for backward compat
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("vanity_slug", slug)
    .single();

  if (!profile) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select("*")
      .eq("public_slug", slug)
      .single();
    profile = fallback;
  }

  if (!profile) {
    notFound();
  }

  const { data: experience } = await supabase
    .from("work_experience")
    .select("*")
    .eq("profile_id", profile.id)
    .order("start_date", { ascending: false });

  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", profile.id)
    .order("start_date", { ascending: false });

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", profile.id);

  const { data: latestVerification } = await supabase
    .from("verification_requests")
    .select("immigration_status, status_valid_until, reviewed_at")
    .eq("profile_id", profile.id)
    .eq("status", "completed")
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .single();

  const isVerified = profile.verification_status === "verified";
  const vouchScore = profile.vouch_score || 0;

  // Merge skills from both tables
  const allSkills = [
    ...(skills?.map((s: { name: string }) => s.name) || []),
    ...(profile.skills || []),
  ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  // Score ring SVG params
  const ringSize = 80;
  const ringStroke = 5;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = ringRadius * 2 * Math.PI;
  const ringOffset = ringCircumference - (vouchScore / 100) * ringCircumference;

  const scoreColor = vouchScore >= 70 ? "var(--color-vouch-verified)" : vouchScore >= 40 ? "var(--color-vouch-score)" : "var(--color-muted-foreground)";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-sm tracking-tight">Vouch</span>
          </Link>
          <Link
            href="/signup?role=candidate"
            className="text-xs text-primary hover:opacity-80 flex items-center gap-1 transition-colors"
          >
            Get Vouch Verified <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              {profile.photo_original_url ? (
                <img
                  src={profile.photo_original_url}
                  alt={profile.full_name || ""}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {(profile.full_name || "?").charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-2xl font-bold tracking-tight">{profile.full_name}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary text-primary-foreground rounded text-[9px] font-black tracking-wider">
                      &#10003; VOUCHED
                    </span>
                  )}
                </div>
                {(profile.location || profile.headline) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {profile.location && (
                      <>
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {profile.location}
                      </>
                    )}
                    {profile.location && profile.headline && (
                      <span className="opacity-40">&middot;</span>
                    )}
                    {profile.headline && <span>{profile.headline}</span>}
                  </p>
                )}
              </div>
            </div>

            {isVerified && (
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-primary/5 border border-primary/20">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck style={{ width: 18, height: 18, color: "var(--color-primary-foreground)" }} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Vouch Verified</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    Identity and work authorization confirmed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vouch Score Ring */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: ringSize, height: ringSize }}>
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} fill="none" stroke="var(--color-border)" strokeWidth={ringStroke} />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth={ringStroke}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{vouchScore}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Vouch Score</span>
          </div>
        </div>

        {/* Verification Details Grid */}
        {isVerified && latestVerification && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Status
              </p>
              <p className="text-sm font-semibold truncate">Verified</p>
            </div>
            {latestVerification.immigration_status && (
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Work Auth</p>
                <p className="text-sm font-semibold truncate">{latestVerification.immigration_status}</p>
              </div>
            )}
            {latestVerification.reviewed_at && (
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Verified
                </p>
                <p className="text-sm font-semibold truncate">
                  {new Date(latestVerification.reviewed_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            {profile.verification_expires_at && (
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Valid Until
                </p>
                <p className="text-sm font-semibold truncate">
                  {new Date(profile.verification_expires_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {(profile.summary || profile.summary_ai) && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.summary || profile.summary_ai}
            </p>
          </div>
        )}

        {/* Skills */}
        {allSkills.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Experience
            </h2>
            <div className="space-y-0">
              {experience.map((exp: { id: string; title: string; company: string; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null }) => (
                <div
                  key={exp.id}
                  className="border-l-2 border-primary/30 pl-4 pb-6 last:pb-0"
                >
                  <p className="font-semibold text-sm">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {exp.start_date || "?"} &mdash; {exp.is_current ? "Present" : exp.end_date || "?"}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Education
            </h2>
            <div className="space-y-4">
              {education.map((edu: { id: string; institution: string; degree: string | null; field_of_study: string | null; start_date: string | null; end_date: string | null }) => (
                <div key={edu.id} className="bg-card border border-border rounded-xl p-4">
                  <p className="font-semibold text-sm">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {edu.start_date || "?"} &mdash; {edu.end_date || "?"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Verified by{" "}
            <Link href="/" className="text-primary hover:opacity-80">
              Vouch
            </Link>{" "}
            &mdash; The verified candidate marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
