"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InterestSignals } from "@/components/dashboard/interest-signals";
import type { User } from "@supabase/supabase-js";
import type { Profile, WorkExperience, Education, VerificationRequest } from "@/lib/types";

interface OverviewProps {
  user: User;
  profile: Profile | null;
  experience: WorkExperience[];
  education: Education[];
  latestVerification: VerificationRequest | null;
  profileViewCount?: number;
}

export default function DashboardOverview({
  user,
  profile,
  experience,
  education,
  latestVerification,
  profileViewCount = 0,
}: OverviewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [vouchScore, setVouchScore] = useState(profile?.vouch_score || 0);
  const [headshot, setHeadshot] = useState(profile?.photo_original_url || null);
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const headshotInputRef = useRef<HTMLInputElement>(null);
  const [salaryRange, setSalaryRange] = useState<string | null>(null);

  const verificationStatus = profile?.verification_status;

  useEffect(() => {
    fetch("/api/profile/vouch-score", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.total != null) setVouchScore(data.total);
      })
      .catch(() => {});

    fetch("/api/ai/salary-benchmark", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.low != null && data?.high != null) {
          const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
          setSalaryRange(`${fmt(data.low)} – ${fmt(data.high)}`);
        }
      })
      .catch(() => {});
  }, []);

  async function handleHeadshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeadshot(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Upload failed", { description: data.error || "Unknown error" });
        setUploadingHeadshot(false);
        return;
      }

      setHeadshot(data.url);
      setUploadingHeadshot(false);
      toast.success("Headshot uploaded!");

      fetch("/api/profile/vouch-score", { method: "POST" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.total != null) setVouchScore(d.total);
        })
        .catch(() => {});
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
      setUploadingHeadshot(false);
    }
  }

  const publicUrl = profile?.vanity_slug
    ? `/v/${profile.vanity_slug}`
    : profile?.public_slug
      ? `/v/${profile.public_slug}`
      : null;

  async function generatePublicSlug() {
    if (!profile) return;
    setGeneratingSlug(true);

    const base = (profile.full_name || "candidate")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const suffix = Math.random().toString(36).substring(2, 6);
    const slug = `${base}-${suffix}`;

    const { error } = await supabase
      .from("profiles")
      .update({ public_slug: slug, vanity_slug: slug })
      .eq("id", user.id);

    if (!error) router.refresh();
    setGeneratingSlug(false);
  }

  // Profile completion
  const checks = [
    { label: "Full name", done: !!profile?.full_name },
    { label: "Headline", done: !!profile?.headline },
    { label: "Summary", done: !!profile?.summary },
    { label: "Location", done: !!profile?.location },
    { label: "Skills", done: (profile?.skills?.length || 0) > 0 },
    { label: "Photo", done: !!profile?.photo_original_url },
    { label: "Work experience", done: experience.length > 0 },
    { label: "Resume uploaded", done: !!profile?.resume_file_path },
    { label: "Identity verified", done: verificationStatus === "verified" },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const percentage = Math.round((doneCount / checks.length) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  // AI Coach Tip logic (preserved from original)
  const aiTip = !headshot
    ? "Add a professional headshot — profiles with photos get 3x more views."
    : !profile?.summary
      ? "Add a professional summary to boost your Vouch Score."
      : experience.length === 0
        ? "Upload your resume to auto-fill your work experience."
        : verificationStatus !== "verified"
          ? "Verify your identity to unlock the full Vouch Score (up to +30 pts)."
          : "Your profile is looking great! Keep it updated for best results.";

  // Placeholder vouch data
  const recentVouches = [
    { name: "Alex Chen", role: "Engineering Manager @ Stripe", skill: "System Design", time: "2d ago" },
    { name: "Sarah Kim", role: "Staff Engineer @ Vercel", skill: "React & Next.js", time: "5d ago" },
    { name: "Marcus Lee", role: "CTO @ Ramp", skill: "Leadership", time: "1w ago" },
  ];

  const skillCount = profile?.skills?.length || 0;

  // Determine next step for portfolio
  const nextPortfolioStep = !profile?.resume_file_path
    ? "Upload resume"
    : experience.length === 0
      ? "Add experience"
      : "Add project";

  return (
    <div className="space-y-8">
      {/* Hidden headshot input (preserved) */}
      <input
        ref={headshotInputRef}
        type="file"
        accept="image/*"
        onChange={handleHeadshotUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}.
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Your profile momentum is building — here&apos;s what&apos;s happening.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-medium text-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          Live Insights Active
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* ─── Profile Completion Card ─── */}
        <div className="col-span-12 lg:col-span-8 bg-muted rounded-xl p-8">
          {/* Top row: title + score */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-[var(--font-headline)] font-bold text-foreground">
                Profile Completion
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {percentage < 100
                  ? `${missing.length} item${missing.length !== 1 ? "s" : ""} remaining`
                  : "All steps complete!"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-primary leading-none">{vouchScore}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Expert Tier</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-background rounded-full h-3 mb-6">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-primary-container transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* 3 status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Identity */}
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                <span className="text-sm font-semibold text-foreground">Identity</span>
              </div>
              {verificationStatus === "verified" ? (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Verified
                </p>
              ) : (
                <button
                  onClick={() => router.push("/dashboard/verify")}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">pending</span>
                  Verify now
                </button>
              )}
            </div>

            {/* Skills */}
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                <span className="text-sm font-semibold text-foreground">Skills</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-bold text-base">{skillCount}</span>{" "}
                skill{skillCount !== 1 ? "s" : ""} added
              </p>
            </div>

            {/* Portfolio / Next Step */}
            <div className="bg-background rounded-lg p-4 border-2 border-dashed border-muted-foreground/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-xl">folder_open</span>
                <span className="text-sm font-semibold text-foreground">Portfolio</span>
              </div>
              <button
                onClick={() => router.push("/dashboard/profile")}
                className="text-xs text-primary font-medium hover:underline"
              >
                {nextPortfolioStep} &rarr;
              </button>
            </div>
          </div>

          {/* Headshot upload / change prompt */}
          <div className="mt-4 flex items-center gap-3">
            {headshot && (
              <img
                src={headshot}
                alt="Profile photo"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            )}
            <button
              onClick={() => headshotInputRef.current?.click()}
              disabled={uploadingHeadshot}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {uploadingHeadshot ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-lg">
                  {headshot ? "edit" : "add_a_photo"}
                </span>
              )}
              {uploadingHeadshot
                ? "Uploading..."
                : headshot
                  ? "Change profile photo"
                  : "Add a profile photo to boost your score"}
            </button>
          </div>

          {/* Share / Public Link actions (preserved from original) */}
          <div className="mt-4 flex flex-wrap gap-3">
            {publicUrl ? (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + publicUrl);
                  toast.success("Profile link copied!");
                }}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                Share Profile
              </button>
            ) : (
              <button
                onClick={generatePublicSlug}
                disabled={generatingSlug}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                <span className="material-symbols-outlined text-lg">link</span>
                {generatingSlug ? "Generating..." : "Get Public Link"}
              </button>
            )}
          </div>
        </div>

        {/* ─── AI Career Coach Card ─── */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-white rounded-xl p-8 relative overflow-hidden flex flex-col justify-between">
          {/* Decorative blur circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <span className="material-symbols-outlined text-white/90" style={{ fontSize: 48 }}>
              psychology
            </span>
            <h2 className="text-xl font-[var(--font-headline)] font-bold mt-4">AI Career Coach</h2>
            <p className="text-white/80 text-sm mt-3 leading-relaxed">{aiTip}</p>
          </div>

          <Button
            className="mt-6 bg-primary-fixed text-primary hover:bg-primary-fixed/90 w-full font-semibold"
            onClick={() => router.push("/dashboard/coach")}
          >
            Start Mock Interview
          </Button>
        </div>

        {/* ─── Recent Peer Vouches ─── */}
        <div className="col-span-12 lg:col-span-5 bg-muted rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-xl">thumb_up</span>
            <h2 className="text-lg font-[var(--font-headline)] font-bold text-foreground">
              Recent Peer Vouches
            </h2>
          </div>

          <div className="space-y-4">
            {recentVouches.map((vouch, i) => (
              <div
                key={i}
                className="bg-background rounded-lg p-4 flex items-start justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{vouch.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{vouch.role}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full">
                    {vouch.skill}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{vouch.time}</span>
              </div>
            ))}
          </div>

          <button className="mt-5 flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            View all 24 vouches
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>

        {/* ─── AI Career Tools ─── */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Salary Insights */}
          <div className="bg-muted rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              <h3 className="text-sm font-[var(--font-headline)] font-bold text-foreground mt-3">
                Salary Insights
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your current Vouch Score
              </p>
            </div>
            <p className="text-2xl font-black text-foreground mt-4">{salaryRange || "Calculating..."}</p>
          </div>

          {/* Headline A/B */}
          <div className="bg-muted rounded-xl p-6">
            <span className="material-symbols-outlined text-primary text-2xl">splitscreen</span>
            <h3 className="text-sm font-[var(--font-headline)] font-bold text-foreground mt-3">
              Headline A/B
            </h3>
            <div className="mt-3 space-y-2">
              <div className="bg-background rounded-lg px-3 py-2 flex items-center justify-between">
                <p className="text-xs text-foreground truncate pr-2">
                  {profile?.headline || "Full-Stack Engineer"}
                </p>
                <span className="text-xs font-bold text-green-600 whitespace-nowrap">12.4% CTR</span>
              </div>
              <div className="bg-background rounded-lg px-3 py-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate pr-2">
                  Senior Software Engineer
                </p>
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">8.1% CTR</span>
              </div>
            </div>
          </div>

          {/* Mock Interview (full width) */}
          <div className="col-span-2 bg-muted rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-[var(--font-headline)] font-bold text-foreground">
                Ready for the big interview?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Practice with our AI interviewer tailored to your target role.
              </p>
            </div>
            <Button
              className="ml-4 flex-shrink-0"
              onClick={() => router.push("/dashboard/coach")}
            >
              Launch Simulator
            </Button>
          </div>
        </div>
      </div>

      {/* Employer Interest Signals (preserved) */}
      <InterestSignals />
    </div>
  );
}
