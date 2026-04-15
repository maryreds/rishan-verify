"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Link2,
  Loader2,
  Lock,
  Circle,
  Mail,
  Plus,
  Share2,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile, VerificationRequest, Education } from "@/lib/types";
import { AddressHistory } from "@/components/dashboard/address-history";

interface VoucherReference {
  id: string;
  profile_id: string;
  referee_name: string;
  referee_email: string;
  referee_title: string | null;
  referee_company: string | null;
  relationship: string | null;
  status: string;
  created_at: string;
}

const VOUCHER_RELATIONSHIPS = [
  { value: "manager", label: "Manager" },
  { value: "colleague", label: "Colleague" },
  { value: "report", label: "Direct Report" },
  { value: "client", label: "Client" },
];

const PersonaInline = dynamic(
  () => import("@/components/vouch/persona-inline"),
  { ssr: false }
);

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
  const [showPersonaInline, setShowPersonaInline] = useState(false);
  const [personaSession, setPersonaSession] = useState<{
    inquiryId: string;
    sessionToken: string;
    sandbox: boolean;
  } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Work Auth state
  const [showWorkAuthForm, setShowWorkAuthForm] = useState(false);
  const [workAuthType, setWorkAuthType] = useState(
    latestVerification?.immigration_status || ""
  );
  const [workAuthExpiry, setWorkAuthExpiry] = useState(
    latestVerification?.status_valid_until || ""
  );
  const [uploadingWorkAuth, setUploadingWorkAuth] = useState(false);
  const [savingWorkAuth, setSavingWorkAuth] = useState(false);

  // Education state
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [showEduDialog, setShowEduDialog] = useState(false);
  const [savingEdu, setSavingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
  });

  // Voucher (references) state
  const [vouchers, setVouchers] = useState<VoucherReference[]>([]);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [submittingVoucher, setSubmittingVoucher] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    name: "",
    email: "",
    title: "",
    company: "",
    relationship: "",
  });

  // Fetch education entries on mount
  useEffect(() => {
    async function fetchEducation() {
      const { data } = await supabase
        .from("education")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setEducationList(data);
    }
    fetchEducation();
  }, [supabase, user.id]);

  // Fetch voucher references on mount
  useEffect(() => {
    async function fetchVouchers() {
      const { data } = await supabase
        .from("references")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setVouchers(data);
    }
    fetchVouchers();
  }, [supabase, user.id]);

  async function addEducation() {
    if (!newEdu.institution) return;
    setSavingEdu(true);

    const { data, error } = await supabase
      .from("education")
      .insert({
        profile_id: user.id,
        institution: newEdu.institution,
        degree: newEdu.degree || null,
        field_of_study: newEdu.field_of_study || null,
        start_date: newEdu.start_date || null,
        end_date: newEdu.end_date || null,
      })
      .select()
      .single();

    if (!error && data) {
      setEducationList([data, ...educationList]);
      setNewEdu({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "" });
      setShowEduDialog(false);
      toast.success("Education added");
    } else if (error) {
      toast.error("Failed to add education", { description: error.message });
    }

    setSavingEdu(false);
  }

  async function deleteEducation(id: string) {
    await supabase.from("education").delete().eq("id", id);
    setEducationList(educationList.filter((e) => e.id !== id));
    toast.success("Education removed");
  }

  async function requestVoucher() {
    if (!voucherForm.name || !voucherForm.email) return;
    setSubmittingVoucher(true);

    try {
      const res = await fetch("/api/references/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: voucherForm.name,
          email: voucherForm.email,
          title: voucherForm.title,
          company: voucherForm.company,
          relationship: voucherForm.relationship,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request voucher");
      }

      const { reference } = await res.json();
      if (reference) {
        setVouchers([reference, ...vouchers]);
      }

      toast.success("Voucher request sent!", {
        description: `An email has been sent to ${voucherForm.name}`,
      });
      setShowVoucherDialog(false);
      setVoucherForm({ name: "", email: "", title: "", company: "", relationship: "" });
    } catch (err) {
      toast.error("Failed to send request", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSubmittingVoucher(false);
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

  // Poll for verification status after completing embedded flow
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/persona/status");
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "completed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          toast.success("Identity verified!", {
            description: "Your Vouch Verified badge is now active.",
          });
          router.refresh();
        } else if (data.status === "rejected") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          toast.error("Verification was not approved", {
            description: "Please try again or contact support.",
          });
          router.refresh();
        }
      } catch {
        // Silently continue polling
      }
    }, 3000);
  }, [router]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function startPersonaVerification() {
    setStartingPersona(true);
    try {
      const res = await fetch("/api/persona/create-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start verification");
      }

      const { inquiryId, sessionToken, sandbox } = data;

      if (inquiryId && sessionToken) {
        // Use embedded inline flow
        setPersonaSession({ inquiryId, sessionToken, sandbox: !!sandbox });
        setShowPersonaInline(true);
      } else if (data.sessionUrl) {
        // Fallback to redirect if no session token
        window.location.href = data.sessionUrl;
      } else {
        toast.error("Could not start verification session.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start verification";
      toast.error("Verification error", { description: message });
    } finally {
      setStartingPersona(false);
    }
  }

  function handlePersonaComplete(inquiryId: string, status: string) {
    setShowPersonaInline(false);
    setPersonaSession(null);
    toast.success("Verification submitted!", {
      description: "We're processing your results now...",
    });
    // Start polling for the webhook to update our DB
    startPolling();
  }

  function handlePersonaCancel() {
    setShowPersonaInline(false);
    setPersonaSession(null);
    toast.info("Verification cancelled", {
      description: "You can restart anytime.",
    });
  }

  async function handleWorkAuthSave() {
    if (!workAuthType) {
      toast.error("Please select your work authorization status.");
      return;
    }
    setSavingWorkAuth(true);
    try {
      const { error } = await supabase
        .from("verification_requests")
        .upsert(
          {
            profile_id: user.id,
            immigration_status: workAuthType,
            status_valid_until: workAuthExpiry || null,
          },
          { onConflict: "profile_id" }
        );

      if (error) throw error;

      toast.success("Work authorization saved", {
        description: "Your status has been recorded.",
      });
      setShowWorkAuthForm(false);
      router.refresh();
    } catch (err) {
      toast.error("Failed to save work authorization");
    } finally {
      setSavingWorkAuth(false);
    }
  }

  async function handleWorkAuthDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingWorkAuth(true);
    const filePath = `${user.id}/${Date.now()}-workauth-${file.name}`;

    const { error } = await supabase.storage
      .from("verification-docs")
      .upload(filePath, file);

    if (error) {
      toast.error("Upload failed", { description: error.message });
      setUploadingWorkAuth(false);
      return;
    }

    // Update the verification request with document path
    await supabase
      .from("verification_requests")
      .upsert(
        {
          profile_id: user.id,
          document_path: filePath,
          document_uploaded_at: new Date().toISOString(),
          immigration_status: workAuthType || null,
          status_valid_until: workAuthExpiry || null,
        },
        { onConflict: "profile_id" }
      );

    setUploadingWorkAuth(false);
    toast.success("Document uploaded", {
      description: "Your work authorization document is on file.",
    });
    router.refresh();
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

  const hasEducation = educationList.length > 0;
  const hasVouchers = vouchers.length > 0;

  // Calculate verification progress
  const completedSteps = [isIdentityVerified, hasWorkAuth, hasEducation, hasVouchers].filter(Boolean).length;
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
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">verified_user</span>
                    Powered by Persona
                  </p>
                </div>
              </div>
              <StatusBadge status={identityStatus} />
            </div>

            {/* Verification upload or embedded Persona flow */}
            {!isIdentityVerified && (
              <div className="flex-1 flex flex-col">
                {showPersonaInline && personaSession ? (
                  <PersonaInline
                    inquiryId={personaSession.inquiryId}
                    sessionToken={personaSession.sessionToken}
                    sandbox={personaSession.sandbox}
                    onComplete={handlePersonaComplete}
                    onCancel={handlePersonaCancel}
                  />
                ) : (
                  <>
                    {/* Primary: Manual ID upload */}
                    <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
                      <span className="material-symbols-outlined text-muted-foreground text-5xl mb-2 relative z-10 group-hover:text-primary transition-colors">
                        upload_file
                      </span>
                      <span className="text-sm font-medium text-muted-foreground relative z-10">
                        {uploadingVerification
                          ? "Uploading securely..."
                          : "Upload your government-issued ID"}
                      </span>
                      <span className="text-xs text-muted-foreground/60 mt-1 relative z-10">
                        JPG, PNG, or PDF. Encrypted and deleted after review.
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleVerificationUpload}
                        disabled={uploadingVerification}
                        className="hidden"
                      />
                    </label>

                    <div className="relative flex items-center my-4">
                      <div className="flex-1 border-t border-border" />
                      <span className="px-3 text-xs text-muted-foreground">or verify instantly</span>
                      <div className="flex-1 border-t border-border" />
                    </div>

                    {/* Secondary: Automated Persona verification */}
                    <Button
                      onClick={startPersonaVerification}
                      disabled={startingPersona}
                      variant="outline"
                      className="w-full rounded-xl"
                      size="lg"
                    >
                      {startingPersona ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <span className="material-symbols-outlined text-base mr-2">photo_camera</span>
                      )}
                      {startingPersona ? "Starting..." : "Scan ID with Camera"}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-3">
                      Automated identity check powered by Persona. Have your government-issued ID ready.
                    </p>
                  </>
                )}
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
            {/* Work Authorization — expandable */}
            {showWorkAuthForm ? (
              <div className="col-span-2 bg-card rounded-xl border-2 border-primary/20 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">work_history</span>
                    <h4 className="font-semibold text-foreground text-sm">Work Authorization</h4>
                  </div>
                  <button
                    onClick={() => setShowWorkAuthForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                {/* Status dropdown */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Authorization type
                  </label>
                  <select
                    value={workAuthType}
                    onChange={(e) => setWorkAuthType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select status...</option>
                    <option value="US Citizen">US Citizen</option>
                    <option value="Permanent Resident (Green Card)">Permanent Resident (Green Card)</option>
                    <option value="H-1B">H-1B Visa</option>
                    <option value="H-1B Transfer">H-1B Transfer</option>
                    <option value="L-1">L-1 Visa</option>
                    <option value="O-1">O-1 Visa</option>
                    <option value="TN Visa">TN Visa</option>
                    <option value="E-2">E-2 Treaty Investor</option>
                    <option value="E-3">E-3 (Australian)</option>
                    <option value="OPT">OPT (F-1)</option>
                    <option value="CPT">CPT (F-1)</option>
                    <option value="STEM OPT Extension">STEM OPT Extension</option>
                    <option value="EAD">Employment Authorization Document (EAD)</option>
                    <option value="Asylum/Refugee EAD">Asylum/Refugee EAD</option>
                    <option value="Canadian Citizen">Canadian Citizen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Expiration date — show for non-permanent statuses */}
                {workAuthType && !["US Citizen", "Permanent Resident (Green Card)", "Canadian Citizen"].includes(workAuthType) && (
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      Valid until
                    </label>
                    <input
                      type="date"
                      value={workAuthExpiry}
                      onChange={(e) => setWorkAuthExpiry(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}

                {/* Supporting document upload */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Supporting document <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <label className="flex items-center gap-2 w-full rounded-lg border border-dashed border-border px-3 py-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-muted-foreground text-lg">upload_file</span>
                    <span className="text-xs text-muted-foreground">
                      {uploadingWorkAuth ? "Uploading..." : "Upload EAD card, visa stamp, or work permit"}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleWorkAuthDocUpload}
                      disabled={uploadingWorkAuth}
                      className="hidden"
                    />
                  </label>
                </div>

                <Button
                  onClick={handleWorkAuthSave}
                  disabled={savingWorkAuth || !workAuthType}
                  className="w-full rounded-xl"
                >
                  {savingWorkAuth ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {savingWorkAuth ? "Saving..." : "Save Work Authorization"}
                </Button>
              </div>
            ) : (
              <div
                className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setShowWorkAuthForm(true)}
              >
                <span className="material-symbols-outlined text-primary text-2xl">work_history</span>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Work Auth</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hasWorkAuth
                      ? latestVerification?.immigration_status
                      : "Employment eligibility"}
                  </p>
                </div>
                <div className="mt-auto">
                  <StatusBadge status={workAuthStatus} />
                </div>
              </div>
            )}

            {/* Background Check */}
            {!showWorkAuthForm && (
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
            )}

            {/* Education */}
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-primary text-2xl">school</span>
                {hasEducation && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Education</h4>
                {educationList.length > 0 ? (
                  <div className="mt-1.5 space-y-1.5">
                    {educationList.map((edu) => (
                      <div key={edu.id} className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteEducation(edu.id)}
                          className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">Not Added</p>
                )}
              </div>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowEduDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Education
                </Button>
              </div>
            </div>

            {/* Vouchers */}
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-primary text-2xl">group</span>
                {vouchers.length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Vouchers</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {vouchers.length > 0
                    ? `${vouchers.length} of 3 vouchers added`
                    : "Add 2-3 people who will vouch for you"}
                </p>
                {vouchers.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {vouchers.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{v.referee_name}</p>
                          {v.referee_company && (
                            <p className="text-xs text-muted-foreground truncate">{v.referee_company}</p>
                          )}
                        </div>
                        {v.status === "pending" ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] px-1.5 py-0">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-[10px] px-1.5 py-0">
                            Done
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowVoucherDialog(true)}
                  disabled={vouchers.length >= 3}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {vouchers.length >= 3 ? "Max Reached" : "Add Voucher"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Education Dialog ── */}
      <Dialog open={showEduDialog} onOpenChange={setShowEduDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="verify-edu-institution">Institution *</Label>
                <Input
                  id="verify-edu-institution"
                  value={newEdu.institution}
                  onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                  placeholder="University of California, Berkeley"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-edu-degree">Degree</Label>
                <Input
                  id="verify-edu-degree"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-edu-field">Field of Study</Label>
                <Input
                  id="verify-edu-field"
                  value={newEdu.field_of_study}
                  onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-edu-start">Start Date</Label>
                <Input
                  id="verify-edu-start"
                  type="date"
                  value={newEdu.start_date}
                  onChange={(e) => setNewEdu({ ...newEdu, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-edu-end">End Date</Label>
                <Input
                  id="verify-edu-end"
                  type="date"
                  value={newEdu.end_date}
                  onChange={(e) => setNewEdu({ ...newEdu, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEduDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addEducation} disabled={!newEdu.institution || savingEdu}>
              {savingEdu && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {savingEdu ? "Adding..." : "Add Education"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Voucher Dialog ── */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Voucher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="voucher-name">Full Name *</Label>
              <Input
                id="voucher-name"
                required
                placeholder="Jane Smith"
                value={voucherForm.name}
                onChange={(e) => setVoucherForm({ ...voucherForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voucher-email">Email *</Label>
              <Input
                id="voucher-email"
                type="email"
                required
                placeholder="jane@company.com"
                value={voucherForm.email}
                onChange={(e) => setVoucherForm({ ...voucherForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voucher-title">Job Title</Label>
              <Input
                id="voucher-title"
                placeholder="Engineering Manager"
                value={voucherForm.title}
                onChange={(e) => setVoucherForm({ ...voucherForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voucher-company">Company</Label>
              <Input
                id="voucher-company"
                placeholder="Acme Inc."
                value={voucherForm.company}
                onChange={(e) => setVoucherForm({ ...voucherForm, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select
                value={voucherForm.relationship}
                onValueChange={(val) => setVoucherForm({ ...voucherForm, relationship: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {VOUCHER_RELATIONSHIPS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowVoucherDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={requestVoucher}
              disabled={!voucherForm.name || !voucherForm.email || submittingVoucher}
            >
              {submittingVoucher ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Address History ── */}
      {profile && (
        <AddressHistory profileId={profile.id} />
      )}

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
