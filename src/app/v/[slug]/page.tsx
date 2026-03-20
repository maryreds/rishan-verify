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

export default async function PublicBadgePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("public_slug", slug)
    .single();

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

  const { data: latestVerification } = await supabase
    .from("verification_requests")
    .select("immigration_status, status_valid_until, reviewed_at")
    .eq("profile_id", profile.id)
    .eq("status", "completed")
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .single();

  const isVerified = profile.verification_status === "verified";

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm tracking-tight">
              Rishan Verify
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Get verified yourself{" "}
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Header */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {profile.full_name}
              </h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 rounded text-[9px] font-black tracking-wider text-white">
                  &#10003; VERIFIED
                </span>
              )}
            </div>
            {(profile.location || profile.headline) && (
              <p className="text-sm text-white/60 flex items-center gap-1">
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

          {isVerified && (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white/[0.03] backdrop-blur-md border border-white/10">
              <div
                className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: "0 0 16px rgba(34,197,94,0.4)" }}
              >
                <ShieldCheck style={{ width: 18, height: 18, color: "white" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">
                  Identity Verified
                </p>
                <p className="text-[10px] text-white/55 leading-tight mt-0.5">
                  Work authorization confirmed via government sources
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Details Grid */}
        {isVerified && latestVerification && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Status
              </p>
              <p className="text-sm font-semibold text-white truncate">
                Verified
              </p>
            </div>
            {latestVerification.immigration_status && (
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Work Auth
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {latestVerification.immigration_status}
                </p>
              </div>
            )}
            {latestVerification.reviewed_at && (
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Verified
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {new Date(latestVerification.reviewed_at).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </p>
              </div>
            )}
            {profile.verification_expires_at && (
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Valid Until
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {new Date(
                    profile.verification_expires_at
                  ).toLocaleDateString("en-US", {
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
        {profile.summary && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              About
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {profile.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-white/[0.05] border border-white/10 rounded-full text-xs text-slate-300"
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
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp: { id: string; title: string; company: string; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null }) => (
                <div
                  key={exp.id}
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
                >
                  <p className="font-semibold text-white text-sm">
                    {exp.title}
                  </p>
                  <p className="text-xs text-slate-400">{exp.company}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exp.start_date || "?"} &mdash;{" "}
                    {exp.is_current ? "Present" : exp.end_date || "?"}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-400 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Education
            </h2>
            <div className="space-y-4">
              {education.map((edu: { id: string; institution: string; degree: string | null; field_of_study: string | null; start_date: string | null; end_date: string | null }) => (
                <div
                  key={edu.id}
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
                >
                  <p className="font-semibold text-white text-sm">
                    {edu.institution}
                  </p>
                  <p className="text-xs text-slate-400">
                    {edu.degree}
                    {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {edu.start_date || "?"} &mdash; {edu.end_date || "?"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            Verified by{" "}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Rishan Verify
            </Link>{" "}
            &mdash; The trusted platform for background-checked candidates
          </p>
        </div>
      </div>
    </div>
  );
}
