import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, verification_status")
    .eq("public_slug", slug)
    .eq("verification_status", "verified")
    .single();

  if (!profile) {
    return { title: "Profile Not Found — Rishan Verify" };
  }

  return {
    title: `${profile.full_name} — Verified by Rishan`,
    description: profile.headline
      ? `${profile.full_name} is a verified professional: ${profile.headline}`
      : `${profile.full_name} has been verified by Rishan Verify`,
    openGraph: {
      title: `${profile.full_name} — Verified ✓`,
      description: profile.headline || "Verified professional on Rishan Verify",
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch verified profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("public_slug", slug)
    .eq("verification_status", "verified")
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch public experience + education
  const [{ data: experience }, { data: education }] = await Promise.all([
    supabase
      .from("work_experience")
      .select("*")
      .eq("profile_id", profile.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("education")
      .select("*")
      .eq("profile_id", profile.id)
      .order("start_date", { ascending: false }),
  ]);

  // Fetch latest completed verification for the badge details
  const { data: verification } = await supabase
    .from("verification_requests")
    .select("immigration_status, status_valid_until, reviewed_at")
    .eq("profile_id", profile.id)
    .eq("status", "completed")
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .single();

  const verifiedDate = profile.verified_at
    ? new Date(profile.verified_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const expiresDate = profile.verification_expires_at
    ? new Date(profile.verification_expires_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm text-gray-700">Rishan Verify</span>
          </div>
          <a
            href="/"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Get verified yourself <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Verification Badge Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden mb-8">
          {/* Green verification banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                {profile.headline && (
                  <p className="text-green-100 text-sm mt-0.5">{profile.headline}</p>
                )}
                {profile.location && (
                  <p className="text-green-200 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Verification details */}
          <div className="px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-green-700">Identity Verified</h2>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  This person&apos;s identity and work authorization have been verified by
                  Rishan Verify through official government sources.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {verification?.immigration_status && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Work Authorization</p>
                      <p className="font-medium text-gray-900">
                        {verification.immigration_status}
                      </p>
                    </div>
                  )}
                  {verifiedDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Verified Since</p>
                      <p className="font-medium text-gray-900">{verifiedDate}</p>
                    </div>
                  )}
                  {expiresDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Valid Until</p>
                      <p className="font-medium text-gray-900">{expiresDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Experience
            </h3>
            <div className="space-y-5">
              {experience.map((exp: { id: string; title: string; company: string; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null }) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-gray-200">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="font-medium text-gray-900">{exp.title}</p>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {exp.start_date || "?"} — {exp.is_current ? "Present" : exp.end_date || "?"}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-500 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Education
            </h3>
            <div className="space-y-4">
              {education.map((edu: { id: string; institution: string; degree: string | null; field_of_study: string | null; start_date: string | null; end_date: string | null }) => (
                <div key={edu.id} className="relative pl-6 border-l-2 border-gray-200">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 bg-emerald-500 rounded-full" />
                  <p className="font-medium text-gray-900">{edu.institution}</p>
                  <p className="text-sm text-gray-600">
                    {edu.degree}
                    {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                  </p>
                  {(edu.start_date || edu.end_date) && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {edu.start_date || "?"} — {edu.end_date || "?"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer trust badge */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>
              Verified by Rishan Verify — Identity & work authorization confirmed through
              official government sources
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
