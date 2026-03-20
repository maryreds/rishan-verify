"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  Sparkles,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { VouchLogo } from "@/components/vouch/vouch-logo";
import { StepWizard } from "@/components/vouch/step-wizard";
import { ScoreRing } from "@/components/vouch/score-ring";
import type { User } from "@supabase/supabase-js";

function coerceDate(val: string | null | undefined): string | null {
  if (!val) return null;
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Try to parse with Date
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  // Try "YYYY-MM" format
  if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
  // Try "Month YYYY" or "Mon YYYY"
  const monthMatch = val.match(/^(\w+)\s+(\d{4})$/);
  if (monthMatch) {
    const d2 = new Date(`${monthMatch[1]} 1, ${monthMatch[2]}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().split("T")[0];
  }
  return null;
}

const STEPS = ["Welcome", "Resume", "Profile", "Skills", "Photo", "Preview"];

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string[] | null;
  domains: string[] | null;
  onboarding_step: number | null;
  photo_original_url: string | null;
  vouch_score: number | null;
  [key: string]: unknown;
}

interface OnboardingClientProps {
  user: User;
  profile: Profile | null;
}

export default function OnboardingClient({ user, profile }: OnboardingClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(profile?.onboarding_step || 0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [resumeDone, setResumeDone] = useState(false);
  const [parseStats, setParseStats] = useState<{
    experience: number;
    education: number;
    skills: number;
  } | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<{
    quality_score: number;
    suggestions: string[];
    is_professional: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name || user.user_metadata?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    headline: profile?.headline || "",
    summary: profile?.summary || "",
    skills: profile?.skills?.join(", ") || "",
    domains: profile?.domains?.join(", ") || "",
  });

  const [parsedSkills, setParsedSkills] = useState<
    { name: string; category: string; selected: boolean }[]
  >([]);

  const updateStep = useCallback(
    async (newStep: number) => {
      setStep(newStep);
      await supabase
        .from("profiles")
        .update({ onboarding_step: newStep })
        .eq("id", user.id);
    },
    [supabase, user.id]
  );

  // ─── Resume upload + parse (the whole pipeline) ───

  async function processResumeFile(file: File) {
    // Validate
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf("."));
    if (![".pdf", ".docx", ".doc", ".txt"].includes(ext)) {
      toast.error("Unsupported file type", {
        description: "Please upload a PDF, DOCX, or TXT file.",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum size is 10 MB." });
      return;
    }

    // 1. Upload to Supabase storage
    setUploading(true);
    setResumeDone(false);
    setParseStats(null);

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      setUploading(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({ resume_file_path: filePath })
      .eq("id", user.id);

    setUploading(false);

    // 2. Parse with AI
    setParsing(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("userId", user.id);

      const res = await fetch("/api/parse-resume", { method: "POST", body });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Parse API error:", res.status, err);
        toast.error("Resume parsing failed", {
          description: err.error || `Server returned ${res.status}`,
        });
        setParsing(false);
        return;
      }

      const parsed = await res.json();
      console.log("Parsed resume:", parsed);

      // 3. Save parsed data to profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          parsed_cv_json: parsed,
          full_name: parsed.full_name || form.full_name,
          phone: parsed.phone || form.phone,
          location: parsed.location || form.location,
          headline: parsed.headline || form.headline,
          summary: parsed.summary || form.summary,
          skills: parsed.skills || [],
          domains: parsed.domains || [],
          resume_parsed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Update local form
      setForm({
        full_name: parsed.full_name || form.full_name,
        phone: parsed.phone || form.phone,
        location: parsed.location || form.location,
        headline: parsed.headline || form.headline,
        summary: parsed.summary || form.summary,
        skills: (parsed.skills || []).join(", "),
        domains: (parsed.domains || []).join(", "),
      });

      // 4. Insert work experience
      let expCount = 0;
      if (parsed.experience && parsed.experience.length > 0) {
        for (const exp of parsed.experience) {
          const { error: expError } = await supabase
            .from("work_experience")
            .insert({
              profile_id: user.id,
              company: exp.company || "Unknown",
              title: exp.title || "Unknown",
              start_date: coerceDate(exp.start_date),
              end_date: coerceDate(exp.end_date),
              is_current: exp.is_current || false,
              description: exp.description || null,
            });

          if (expError) {
            console.error("Experience insert error:", expError);
          } else {
            expCount++;
          }
        }
      }

      // 5. Insert education
      let eduCount = 0;
      if (parsed.education && parsed.education.length > 0) {
        for (const edu of parsed.education) {
          const { error: eduError } = await supabase
            .from("education")
            .insert({
              profile_id: user.id,
              institution: edu.institution || "Unknown",
              degree: edu.degree || null,
              field_of_study: edu.field_of_study || null,
              start_date: coerceDate(edu.start_date),
              end_date: coerceDate(edu.end_date),
            });

          if (eduError) {
            console.error("Education insert error:", eduError);
          } else {
            eduCount++;
          }
        }
      }

      // 6. Extract categorized skills via AI (non-blocking)
      const skillCount = parsed.skills?.length || 0;
      try {
        const skillsRes = await fetch("/api/ai/extract-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parsedCV: parsed }),
        });
        if (skillsRes.ok) {
          const { skills } = await skillsRes.json();
          if (Array.isArray(skills) && skills.length > 0) {
            setParsedSkills(
              skills.map((s: { name: string; category: string }) => ({
                ...s,
                selected: true,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Skills extraction error:", err);
      }

      setParseStats({
        experience: expCount,
        education: eduCount,
        skills: skillCount,
      });
      setResumeDone(true);
      toast.success("Resume parsed!", {
        description: `Found ${expCount} jobs, ${eduCount} degrees, ${skillCount} skills.`,
      });
    } catch (err) {
      console.error("Resume processing error:", err);
      toast.error("Something went wrong", {
        description: "Check the console for details.",
      });
    }

    setParsing(false);
  }

  // ─── Drag & drop handlers ───

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processResumeFile(file);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processResumeFile(file);
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  // ─── Other handlers ───

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          headline: form.headline,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const { summary } = await res.json();
        setForm({ ...form, summary });
        toast.success("AI summary generated!");
      }
    } catch {
      toast.error("Failed to generate summary");
    }
    setGeneratingSummary(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    const filePath = `${user.id}/headshot-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("photos").upload(filePath, file);
    if (error) {
      toast.error("Upload failed", { description: error.message });
      setAnalyzingPhoto(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ photo_original_url: publicUrl })
      .eq("id", user.id);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/ai/analyze-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        if (res.ok) {
          const analysis = await res.json();
          setPhotoAnalysis(analysis);
        }
        setAnalyzingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setAnalyzingPhoto(false);
    }
  }

  async function saveSkills() {
    const selectedSkills = parsedSkills.filter((s) => s.selected);
    for (const skill of selectedSkills) {
      await supabase.from("skills").upsert(
        {
          profile_id: user.id,
          name: skill.name,
          category: skill.category,
          source: "ai_parsed",
        },
        { onConflict: "profile_id,name" }
      );
    }
  }

  async function finishOnboarding() {
    await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        location: form.location,
        headline: form.headline,
        summary: form.summary,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        domains: form.domains.split(",").map((s) => s.trim()).filter(Boolean),
        onboarding_completed_at: new Date().toISOString(),
        onboarding_step: STEPS.length,
      })
      .eq("id", user.id);

    await saveSkills();

    try {
      await fetch("/api/profile/vouch-score", { method: "POST" });
    } catch {
      // Non-blocking
    }

    toast.success("Welcome to Vouch!");
    router.push("/dashboard");
    router.refresh();
  }

  function goNext() {
    if (step < STEPS.length - 1) updateStep(step + 1);
  }

  function goBack() {
    if (step > 0) updateStep(step - 1);
  }

  // ─── Render ───

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border py-4 px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <VouchLogo size="sm" href="/" />
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Step Wizard */}
      <div className="py-6 px-4">
        <StepWizard steps={STEPS} currentStep={step} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-32">
        <div className="w-full max-w-xl">
          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to Vouch
                {form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Let&apos;s build your verified profile in a few quick steps.
                Confirm your info to get started.
              </p>
              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Resume Upload (rebuilt from scratch) ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Upload your resume
                </h2>
                <p className="text-muted-foreground mt-2">
                  Drop your file anywhere in the box below. Our AI will extract
                  your experience, skills, and education.
                </p>
              </div>

              {/* ── The drop zone ── */}
              {!resumeDone ? (
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() =>
                    !uploading && !parsing && fileInputRef.current?.click()
                  }
                  className={`
                    relative flex flex-col items-center justify-center
                    w-full min-h-[280px] rounded-2xl cursor-pointer
                    border-3 border-dashed transition-all duration-200
                    ${
                      uploading || parsing
                        ? "border-primary/40 bg-primary/5 cursor-wait"
                        : isDragging
                          ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
                          : "border-border hover:border-primary hover:bg-primary/5"
                    }
                  `}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-base font-medium text-primary">
                        Uploading...
                      </p>
                    </div>
                  ) : parsing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-base font-medium text-primary">
                        AI is reading your resume...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Extracting experience, education &amp; skills
                      </p>
                    </div>
                  ) : isDragging ? (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-14 h-14 text-primary" />
                      <p className="text-lg font-semibold text-primary">
                        Drop it right here!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 px-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-foreground">
                          Drag &amp; drop your resume here
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or{" "}
                          <span className="text-primary font-medium underline underline-offset-2">
                            click to browse
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {["PDF", "DOCX", "TXT"].map((type) => (
                          <span
                            key={type}
                            className="px-2.5 py-1 bg-muted rounded text-[11px] font-medium text-muted-foreground"
                          >
                            .{type.toLowerCase()}
                          </span>
                        ))}
                        <span className="text-[11px] text-muted-foreground/60">
                          Max 10 MB
                        </span>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                    disabled={uploading || parsing}
                    className="hidden"
                  />
                </div>
              ) : (
                /* ── Success state ── */
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Resume parsed successfully!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Here&apos;s what we found:
                      </p>
                    </div>
                  </div>

                  {parseStats && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-background border border-border p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {parseStats.experience}
                        </p>
                        <p className="text-xs text-muted-foreground">Jobs</p>
                      </div>
                      <div className="rounded-xl bg-background border border-border p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {parseStats.education}
                        </p>
                        <p className="text-xs text-muted-foreground">Degrees</p>
                      </div>
                      <div className="rounded-xl bg-background border border-border p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {parseStats.skills}
                        </p>
                        <p className="text-xs text-muted-foreground">Skills</p>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResumeDone(false);
                      setParseStats(null);
                    }}
                  >
                    Upload a different resume
                  </Button>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                You can skip this and fill in your profile manually.
              </p>
            </div>
          )}

          {/* ── Step 2: Review Profile ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Review your profile
                </h2>
                <p className="text-muted-foreground mt-2">
                  Edit anything that doesn&apos;t look right.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    value={form.headline}
                    onChange={(e) =>
                      setForm({ ...form, headline: e.target.value })
                    }
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Professional Summary</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={generatingSummary}
                      className="text-xs"
                    >
                      {generatingSummary ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    value={form.summary}
                    onChange={(e) =>
                      setForm({ ...form, summary: e.target.value })
                    }
                    rows={4}
                    placeholder="Brief professional summary..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Skills ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Your skills
                </h2>
                <p className="text-muted-foreground mt-2">
                  Review AI-extracted skills or add your own.
                </p>
              </div>
              {parsedSkills.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    parsedSkills.reduce(
                      (acc, s) => {
                        const cat = s.category || "Other";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(s);
                        return acc;
                      },
                      {} as Record<string, typeof parsedSkills>
                    )
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <button
                            key={skill.name}
                            onClick={() => {
                              const updated = [...parsedSkills];
                              const idx = updated.findIndex(
                                (s) => s.name === skill.name
                              );
                              updated[idx] = {
                                ...updated[idx],
                                selected: !updated[idx].selected,
                              };
                              setParsedSkills(updated);
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              skill.selected
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-muted border-border text-muted-foreground line-through"
                            }`}
                          >
                            {skill.selected ? (
                              <Check className="w-3 h-3 inline mr-1" />
                            ) : (
                              <X className="w-3 h-3 inline mr-1" />
                            )}
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Textarea
                    value={form.skills}
                    onChange={(e) =>
                      setForm({ ...form, skills: e.target.value })
                    }
                    rows={3}
                    placeholder="JavaScript, React, Node.js, Python..."
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Photo ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Add a headshot
                </h2>
                <p className="text-muted-foreground mt-2">
                  A professional photo boosts your Vouch Score.
                </p>
              </div>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                {analyzingPhoto ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Analyzing your photo...
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Click to upload a headshot
                    </span>
                    <span className="text-xs text-muted-foreground/60 mt-1">
                      JPG or PNG recommended
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={analyzingPhoto}
                  className="hidden"
                />
              </label>

              {photoAnalysis && (
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Photo Quality</span>
                    <span
                      className={`text-sm font-bold ${
                        photoAnalysis.quality_score >= 70
                          ? "text-primary"
                          : photoAnalysis.quality_score >= 40
                            ? "text-accent"
                            : "text-destructive"
                      }`}
                    >
                      {photoAnalysis.quality_score}/100
                    </span>
                  </div>
                  {photoAnalysis.suggestions.length > 0 && (
                    <div className="space-y-1">
                      {photoAnalysis.suggestions.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          &bull; {s}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                You can skip this for now and add a photo later.
              </p>
            </div>
          )}

          {/* ── Step 5: Preview ── */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Your Vouch Profile
                </h2>
                <p className="text-muted-foreground mt-2">
                  Looking good! Publish your profile to start getting discovered.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                    {form.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {form.full_name || "Your Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form.headline || "Your headline"}
                    </p>
                    {form.location && (
                      <p className="text-xs text-muted-foreground/60">
                        {form.location}
                      </p>
                    )}
                  </div>
                </div>

                {form.summary && (
                  <p className="text-sm text-muted-foreground">
                    {form.summary}
                  </p>
                )}

                {form.skills && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 8)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <ScoreRing
                    score={profile?.vouch_score || 25}
                    size={100}
                    strokeWidth={6}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm py-4 px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {step === STEPS.length - 1 ? (
            <Button onClick={finishOnboarding}>
              Publish Profile <Check className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={goNext}>
              {step === 1 ? "Continue" : "Next"}{" "}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
