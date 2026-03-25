"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Camera,
  Clock,
  Copy,
  Check,
  Link2,
  Loader2,
  Lock,
  Circle,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile, VerificationRequest } from "@/lib/types";

interface VerifyClientProps {
  user: User;
  profile: Profile | null;
  latestVerification: VerificationRequest | null;
}

export default function VerifyClient({
  user,
  profile,
  latestVerification,
}: VerifyClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [uploadingVerification, setUploadingVerification] = useState(false);
  const [startingPersona, setStartingPersona] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);

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

  async function startPersonaVerification() {
    setStartingPersona(true);
    try {
      const res = await fetch("/api/persona/create-inquiry", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start verification");
      }
      const { sessionUrl } = await res.json();
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error("Could not start verification session.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start verification";
      toast.error("Verification error", { description: message });
    } finally {
      setStartingPersona(false);
    }
  }

  async function handleVerificationUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVerification(true);
    const filePath = `${user.id}/${Date.now()}-id-${file.name}`;

    const { error } = await supabase.storage.from("verification-docs").upload(filePath, file);
    if (error) {
      toast.error("Upload failed", { description: error.message });
      setUploadingVerification(false);
      return;
    }

    await supabase.from("verification_requests").insert({
      profile_id: user.id,
      document_path: filePath,
      document_uploaded_at: new Date().toISOString(),
    });

    await supabase
      .from("profiles")
      .update({ verification_status: "pending" })
      .eq("id", user.id);

    setUploadingVerification(false);
    toast.success("Document uploaded", {
      description: "Your ID is now pending review.",
    });
    router.refresh();
  }

  const isIdentityVerified = profile?.verification_status === "verified";
  const isIdentityPending = profile?.verification_status === "pending";
  const hasWorkAuth = !!latestVerification?.immigration_status;

  // Calculate verification progress
  const completedSteps = [isIdentityVerified, hasWorkAuth].filter(Boolean).length;
  const totalSteps = 4;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  // Status helpers
  const identityStatus = isIdentityVerified
    ? "verified"
    : isIdentityPending
      ? "pending"
      : "not_started";

  const workAuthStatus = hasWorkAuth
    ? "verified"
    : isIdentityPending
      ? "pending"
      : "not_started";

  function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; classes: string }> = {
      verified: {
        label: "Verified",
        classes: "bg-primary/10 text-primary",
      },
      pending: {
        label: "In Progress",
        classes: "bg-amber-500/10 text-amber-600",
      },
      not_started: {
        label: "Pending",
        classes: "bg-muted text-muted-foreground",
      },
      coming_soon: {
        label: "Coming Soon",
        classes: "bg-muted text-muted-foreground/60",
      },
    };
    const c = config[status] || config.not_started;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.classes}`}>
        {c.label}
      </span>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header & Progress ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
            Verification Hub
          </h1>
          <p className="mt-1 text-muted-foreground">
            Let&apos;s build your professional trust profile, one step at a time.
          </p>
        </div>

        <div className="w-80 flex-shrink-0 bg-muted p-6 rounded-xl border-l-4 border-primary">
          <p className="text-sm font-semibold text-foreground mb-2">Verification Progress</p>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completedSteps}/{totalSteps} completed &middot; {progressPercent}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete all steps to earn the Vouch Verified badge.
          </p>
        </div>
      </div>

      {/* ── Verified Banner (when fully verified) ── */}
      {isIdentityVerified && (
        <div className="p-6 bg-primary/10 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <BadgeCheck className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold text-primary">
              You are Vouch Verified!
            </span>
          </div>
          {latestVerification?.immigration_status && (
            <p className="text-primary">
              Status: {latestVerification.immigration_status}
            </p>
          )}
          {profile?.verification_expires_at && (
            <p className="text-primary/80 text-sm mt-1">
              Valid until:{" "}
              {new Date(profile.verification_expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* ── Share Profile (when verified) ── */}
      {isIdentityVerified && (
        <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Share Your Vouch Profile</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Share your verified profile link on your resume, LinkedIn, or with recruiters.
          </p>
          {publicUrl ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border px-4 py-2.5 flex items-center gap-2 bg-background">
                <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate font-mono">
                  {publicUrl}
                </span>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + publicUrl
                  );
                  setLinkCopied(true);
                  toast.success("Link copied to clipboard");
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="flex-shrink-0"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={generatePublicSlug} disabled={generatingSlug}>
              {generatingSlug ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              {generatingSlug
                ? "Generating..."
                : "Generate My Vouch Profile Link"}
            </Button>
          )}
        </div>
      )}

      {/* ── Bento Grid: Verification Status ── */}
      <div>
        <h2 className="text-xl font-[var(--font-headline)] font-bold tracking-tight text-foreground mb-4">
          Verification Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* ── Identity Verification (main card) ── */}
          <div className="md:col-span-2 bg-card rounded-2xl border-2 border-primary/20 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">badge</span>
                <div>
                  <h3 className="font-[var(--font-headline)] font-bold text-foreground text-lg">
                    Identity Verification
                  </h3>
                  <p className="text-xs text-muted-foreground">Powered by Persona</p>
                </div>
              </div>
              <StatusBadge status={identityStatus} />
            </div>

            {/* Camera / photo capture area */}
            {!isIdentityVerified && (
              <div className="flex-1 flex flex-col">
                <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden group">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
                  <span className="material-symbols-outlined text-muted-foreground text-5xl mb-2 relative z-10 group-hover:text-primary transition-colors">
                    photo_camera
                  </span>
                  <span className="text-sm font-medium text-muted-foreground relative z-10">
                    {uploadingVerification
                      ? "Uploading securely..."
                      : "Capture or upload your ID"}
                  </span>
                  <span className="text-xs text-muted-foreground/60 mt-1 relative z-10">
                    JPG, PNG, or PDF. Deleted after review.
                  </span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleVerificationUpload}
                    disabled={uploadingVerification}
                    className="hidden"
                  />
                </label>

                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={startPersonaVerification}
                    disabled={startingPersona}
                    className="flex-1 bg-primary text-white rounded-xl hover:bg-primary/90"
                    size="lg"
                  >
                    {startingPersona ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <span className="material-symbols-outlined text-base mr-2">photo_camera</span>
                    )}
                    {startingPersona ? "Starting..." : "Open Camera"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  You&apos;ll be redirected to our secure partner. Have your government-issued ID ready.
                </p>
              </div>
            )}

            {isIdentityVerified && (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <span className="material-symbols-outlined text-primary text-6xl mb-2">verified</span>
                <p className="font-semibold text-primary">Identity Verified</p>
              </div>
            )}

            {isIdentityPending && !isIdentityVerified && (
              <Alert className="mt-3">
                <AlertDescription>
                  Your ID has been submitted and is being reviewed. We&apos;ll notify you once complete.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* ── Side Cards (2x2 grid) ── */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {/* Work Authorization */}
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">work_history</span>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Work Auth</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Employment eligibility</p>
              </div>
              <div className="mt-auto">
                <StatusBadge status={workAuthStatus} />
              </div>
            </div>

            {/* Background Check */}
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">policy</span>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Background</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Background check</p>
              </div>
              <div className="mt-auto">
                <StatusBadge status="coming_soon" />
              </div>
            </div>

            {/* Education */}
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">school</span>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Education</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Degree verification</p>
              </div>
              <div className="mt-auto">
                <StatusBadge status="coming_soon" />
              </div>
            </div>

            {/* Add Reference */}
            <div className="bg-card rounded-xl border-2 border-dashed border-border p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-muted-foreground text-3xl">add_circle</span>
              <h4 className="font-semibold text-muted-foreground text-sm">Add Reference</h4>
              <p className="text-xs text-muted-foreground text-center">Invite a professional reference</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Verification Matters ── */}
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        </div>

        <div className="relative p-8">
          <h2 className="text-xl font-[var(--font-headline)] font-bold tracking-tight text-foreground mb-6">
            Why Verification Matters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Human-Centric Security</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your documents are encrypted, only accessible to authorized reviewers, and permanently deleted after verification. Privacy is our priority.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">3x Profile Visibility</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Verified candidates get 3x more views from recruiters. Stand out with a trust badge that proves you are who you say you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
