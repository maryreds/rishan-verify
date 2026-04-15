"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  MapPin,
  Fingerprint,
  FileCheck,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Shield,
  Pencil,
  Share2,
  ExternalLink,
  Clock,
  Users,
} from "lucide-react";
import { AchievementBadgesRow } from "@/components/vouch/achievement-badges-row";

interface MyProfileClientProps {
  profile: Record<string, any>;
  experience: Record<string, any>[];
  education: Record<string, any>[];
  skills: Record<string, any>[];
  latestVerification: Record<string, any> | null;
  completedRefs: Record<string, any>[];
  peerVouches: Record<string, any>[];
  portfolioItems: Record<string, any>[];
  credentials: Record<string, any>[];
  assessments: Record<string, any>[];
}

export default function MyProfileClient({
  profile,
  experience,
  education,
  skills,
  latestVerification,
  completedRefs,
  peerVouches,
  portfolioItems,
  credentials,
  assessments,
}: MyProfileClientProps) {
  const [copied, setCopied] = useState(false);

  const isVerified = profile.verification_status === "verified";
  const slug = profile.vanity_slug || profile.public_slug;
  const publicUrl = slug ? `https://vouch-app-xi.vercel.app/v/${slug}` : null;

  // Merge skills from both tables
  const allSkills = [
    ...(skills?.map((s) => s.name) || []),
    ...(profile.skills || []),
  ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  // Map verified skills from assessments
  const verifiedSkillsSet = new Set(
    assessments
      ?.filter((a) => a.score >= a.max_score * 0.8)
      .map((a) => a.skill_name) || []
  );

  // Build competency data from skills + assessments
  const competencies = allSkills.slice(0, 6).map((skill: string) => {
    const assessment = assessments?.find((a) => a.skill_name === skill);
    const pct = assessment
      ? Math.round((assessment.score / assessment.max_score) * 100)
      : verifiedSkillsSet.has(skill)
        ? 85
        : 60;
    const level =
      pct >= 90 ? "Expert" : pct >= 70 ? "Advanced" : "Intermediate";
    const color =
      pct >= 90
        ? "bg-green-500"
        : pct >= 70
          ? "bg-amber-500"
          : "bg-orange-400";
    return { skill, level, pct, color };
  });

  // Trust audit items
  const completedRefCount = completedRefs?.length || 0;
  const trustAudit = [
    {
      label: "Identity Verification",
      description: isVerified
        ? "Government-issued ID + biometric match"
        : "Not yet verified",
      status: isVerified ? ("verified" as const) : ("pending" as const),
    },
    {
      label: "Work Authorization",
      description: latestVerification?.immigration_status
        ? latestVerification.immigration_status
        : "Not yet verified",
      status: latestVerification?.immigration_status
        ? ("verified" as const)
        : ("pending" as const),
    },
    {
      label: "Background Check",
      description: "Criminal background and sanctions screening",
      status: "coming_soon" as const,
    },
    {
      label: "Education",
      description:
        education.length > 0
          ? `${education.length} education record${education.length !== 1 ? "s" : ""} on file`
          : "No education records added",
      status: education.length > 0 ? ("verified" as const) : ("pending" as const),
    },
    {
      label: "References",
      description: `${completedRefCount} of 3 completed`,
      status:
        completedRefCount >= 3
          ? ("verified" as const)
          : completedRefCount > 0
            ? ("partial" as const)
            : ("pending" as const),
    },
  ];

  const statusBadge = (status: "verified" | "cleared" | "pending" | "partial" | "coming_soon") => {
    if (status === "verified") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    }
    if (status === "cleared") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-3 h-3" />
          Cleared
        </span>
      );
    }
    if (status === "partial") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    if (status === "coming_soon") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
          Coming Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const levelBadge = (level: string) => {
    const colors: Record<string, string> = {
      Expert: "bg-green-100 text-green-700 border-green-200",
      Advanced: "bg-amber-50 text-amber-700 border-amber-200",
      Intermediate: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[level] || "bg-gray-100 text-gray-600 border-gray-200"}`}
      >
        {level}
      </span>
    );
  };

  const trustAuditIcons = [
    <Fingerprint key="id" className="w-4 h-4 text-gray-500" />,
    <FileCheck key="wa" className="w-4 h-4 text-gray-500" />,
    <Shield key="bg" className="w-4 h-4 text-gray-500" />,
    <GraduationCap key="ed" className="w-4 h-4 text-gray-500" />,
    <Users key="ref" className="w-4 h-4 text-gray-500" />,
  ];

  function handleShareProfile() {
    if (!publicUrl) {
      toast.error("No public profile link yet. Generate one from your Dashboard.");
      return;
    }
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Profile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  // Format date helper
  const formatPeriod = (start: string | null, end: string | null, isCurrent?: boolean) => {
    const fmt = (d: string | null) => {
      if (!d) return "?";
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    };
    return `${fmt(start)} — ${isCurrent ? "Present" : fmt(end)}`;
  };

  return (
    <div className="bg-gray-50/80 -m-8 lg:-m-12 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Profile Header ── */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              {profile.photo_original_url ? (
                <img
                  alt={profile.full_name || "Profile"}
                  src={profile.photo_original_url}
                  width={100}
                  height={100}
                  className="w-[100px] h-[100px] rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-[100px] h-[100px] rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-lg text-green-700 font-bold text-3xl">
                  {(profile.full_name || "?").charAt(0)}
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center border-3 border-white shadow">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {profile.full_name || "Your Name"}
                </h1>
                {isVerified && <ShieldCheck className="w-5 h-5 text-green-600" />}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {profile.headline || "Add a headline in your profile"}
              </p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {isVerified && (
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold uppercase tracking-wide">
                    Verified
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Link>
            <button
              onClick={handleShareProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              {copied ? "Copied!" : "Share Profile"}
            </button>
            {slug && (
              <Link
                href={`/v/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Badge
              </Link>
            )}
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trust Audit Report */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Trust Audit Report
                </h2>
              </div>
              <div className="space-y-4">
                {trustAudit.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {trustAuditIcons[i]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusBadge(item.status)}
                      {item.status === "verified" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Reference Synthesis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-bold text-gray-900">
                    Verified Reference Synthesis
                  </h2>
                </div>
                {peerVouches.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Insights
                  </span>
                )}
              </div>
              {peerVouches.length > 0 ? (
                <div className="space-y-4">
                  {peerVouches.map((vouch) => (
                    <div
                      key={vouch.id}
                      className="border border-gray-100 rounded-lg p-4"
                    >
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        &ldquo;{vouch.message}&rdquo;
                      </p>
                      {vouch.skill && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          {vouch.skill}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {vouch.voucher?.photo_original_url ? (
                          <img
                            src={vouch.voucher.photo_original_url}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-[10px] font-bold">
                            {(vouch.voucher?.full_name || "?").charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {vouch.voucher?.full_name || "Verified Professional"}
                          </p>
                          {vouch.voucher?.headline && (
                            <p className="text-[10px] text-gray-400">
                              {vouch.voucher.headline}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 leading-relaxed">
                  No vouches yet. Ask colleagues and managers to vouch for your
                  skills and work ethic.
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Experience
                </h2>
              </div>
              {experience.length > 0 ? (
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="relative pl-6 border-l-2 border-gray-100"
                    >
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-sm font-semibold text-gray-900">
                        {exp.title}
                      </p>
                      <p className="text-xs text-gray-500">{exp.company}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatPeriod(exp.start_date, exp.end_date, exp.is_current)}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No work experience added yet.{" "}
                  <Link
                    href="/dashboard/profile"
                    className="text-green-600 hover:underline"
                  >
                    Add experience
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Competency Matrix */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Competency Matrix
                </h2>
              </div>
              {competencies.length > 0 ? (
                <div className="space-y-4">
                  {competencies.map((comp, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-700">
                          {comp.skill}
                        </p>
                        <div className="flex items-center gap-2">
                          {levelBadge(comp.level)}
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {comp.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${comp.color}`}
                          style={{ width: `${comp.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No skills added yet.{" "}
                  <Link
                    href="/dashboard/profile"
                    className="text-green-600 hover:underline"
                  >
                    Add skills
                  </Link>
                </p>
              )}

              {/* Technical Stack */}
              {allSkills.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Technical Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allSkills.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Badges */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Verification Badges
                </h2>
              </div>
              <AchievementBadgesRow
                identity={isVerified}
                workAuth={!!latestVerification?.immigration_status}
                background={false}
                education={education.length > 0}
                references={completedRefs.length > 0}
                size="md"
              />
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Education
                </h2>
              </div>
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <p className="text-sm font-semibold text-gray-900">
                        {edu.institution}
                      </p>
                      <p className="text-xs text-gray-500">
                        {edu.degree}
                        {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatPeriod(edu.start_date, edu.end_date)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No education records added yet.{" "}
                  <Link
                    href="/dashboard/profile"
                    className="text-green-600 hover:underline"
                  >
                    Add education
                  </Link>
                </p>
              )}
            </div>

            {/* QR Code Share */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                  <img
                    alt="Scan to view verified profile"
                    width={80}
                    height={80}
                    className="w-[80px] h-[80px]"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(publicUrl || "https://vouch-app-xi.vercel.app")}&bgcolor=ffffff&color=000000&margin=4`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Share Verified Profile
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Scan QR code or share link to let employers verify your
                    profile instantly.
                  </p>
                  {slug && (
                    <p className="text-[10px] text-gray-300 font-mono mt-2">
                      /v/{slug}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 border-t border-gray-200 mt-8">
          <p className="text-xs text-gray-400 text-center">
            This is how employers see your profile on{" "}
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Vouch
            </Link>{" "}
            — The trusted marketplace for pre-verified candidates
          </p>
        </div>
      </div>
    </div>
  );
}
