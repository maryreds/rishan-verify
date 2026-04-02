"use client";

import { useState, useRef } from "react";
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
  ShieldCheck,
  Fingerprint,
  User as UserIcon,
  Briefcase,
  Image,
  Rocket,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { VouchLogo } from "@/components/vouch/vouch-logo";
import { ScoreRing } from "@/components/vouch/score-ring";

// ─── Demo constants ───

const STEPS = [
  { key: "welcome", label: "Welcome", icon: UserIcon, description: "Confirm your name", next: "Next, we'll import your resume" },
  { key: "resume", label: "Resume", icon: FileText, description: "Upload & auto-parse", next: "Next, you'll review your profile details" },
  { key: "profile", label: "Profile", icon: Briefcase, description: "Review your info", next: "Next, we'll confirm your skills" },
  { key: "skills", label: "Skills", icon: Sparkles, description: "Confirm your skills", next: "Next, add a professional headshot" },
  { key: "photo", label: "Photo", icon: Image, description: "Add a headshot", next: "Next, verify your identity to earn trust" },
  { key: "verify", label: "Verify", icon: Fingerprint, description: "Confirm your identity", next: "Almost done — preview and launch your profile!" },
  { key: "launch", label: "Launch", icon: Rocket, description: "Go live!", next: "" },
];

const DEMO_CANDIDATE = {
  full_name: "Priya Sharma",
  email: "priya.sharma@email.com",
  phone: "+1 (512) 867-5309",
  location: "Austin, TX",
  headline: "Senior Full-Stack Engineer",
  summary:
    "Full-stack engineer with 6+ years of experience building scalable web applications. Passionate about clean architecture, developer experience, and shipping products that make a difference. Led engineering teams at two Y Combinator startups, delivering platforms serving 500K+ users.",
};

const DEMO_SKILLS = [
  { name: "React", category: "Frontend", selected: true },
  { name: "Next.js", category: "Frontend", selected: true },
  { name: "TypeScript", category: "Frontend", selected: true },
  { name: "Tailwind CSS", category: "Frontend", selected: true },
  { name: "Node.js", category: "Backend", selected: true },
  { name: "Python", category: "Backend", selected: true },
  { name: "PostgreSQL", category: "Backend", selected: true },
  { name: "GraphQL", category: "Backend", selected: true },
  { name: "AWS", category: "Infrastructure", selected: true },
  { name: "Docker", category: "Infrastructure", selected: true },
  { name: "CI/CD", category: "Infrastructure", selected: true },
  { name: "Agile/Scrum", category: "Leadership", selected: true },
  { name: "System Design", category: "Leadership", selected: true },
  { name: "Technical Mentoring", category: "Leadership", selected: false },
];

const DEMO_PHOTO_URL = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face";

// ─── Helpers ───

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Component ───

export default function DemoOnboardingClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [resumeDone, setResumeDone] = useState(false);
  const [parseStats, setParseStats] = useState<{ experience: number; education: number; skills: number } | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<{ quality_score: number; suggestions: string[]; is_professional: boolean } | null>(null);
  const [startingPersona, setStartingPersona] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const [form, setForm] = useState({
    full_name: DEMO_CANDIDATE.full_name,
    phone: "",
    location: "",
    headline: "",
    summary: "",
    skills: "",
    domains: "",
  });

  const [parsedSkills, setParsedSkills] = useState<{ name: string; category: string; selected: boolean }[]>([]);

  // ─── Mock: Resume upload + parse ───

  async function simulateResumeParse() {
    setUploading(true);
    setResumeDone(false);
    setParseStats(null);
    await sleep(800);
    setUploading(false);
    setParsing(true);
    await sleep(1500);

    setForm({
      full_name: DEMO_CANDIDATE.full_name,
      phone: DEMO_CANDIDATE.phone,
      location: DEMO_CANDIDATE.location,
      headline: DEMO_CANDIDATE.headline,
      summary: DEMO_CANDIDATE.summary,
      skills: DEMO_SKILLS.filter((s) => s.selected).map((s) => s.name).join(", "),
      domains: "SaaS, Fintech, Developer Tools",
    });
    setParsedSkills(DEMO_SKILLS.map((s) => ({ ...s })));

    setParseStats({ experience: 4, education: 2, skills: DEMO_SKILLS.length });
    setResumeDone(true);
    toast.success("Resume parsed!", {
      description: `Found 4 jobs, 2 degrees, ${DEMO_SKILLS.length} skills.`,
    });
    setParsing(false);
  }

  // ─── Mock: AI summary ───

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    await sleep(1200);
    setForm((prev) => ({ ...prev, summary: DEMO_CANDIDATE.summary }));
    toast.success("AI summary generated!");
    setGeneratingSummary(false);
  }

  // ─── Mock: Photo upload ───

  async function simulatePhotoUpload() {
    setPhotoPreviewUrl(DEMO_PHOTO_URL);
    setAnalyzingPhoto(true);
    await sleep(1000);
    setPhotoAnalysis({
      quality_score: 87,
      suggestions: ["Great lighting and professional background", "Consider a slight crop for tighter framing"],
      is_professional: true,
    });
    setAnalyzingPhoto(false);
  }

  // ─── Mock: Persona verification ───

  async function simulateVerification() {
    setStartingPersona(true);
    await sleep(1200);
    setStartingPersona(false);
    setVerificationStatus("pending");
    toast.info("Verification started — simulating ID scan...");
    await sleep(2000);
    setVerificationStatus("verified");
    toast.success("Identity verified!");
  }

  // ─── Mock: Publish ───

  async function simulatePublish() {
    setPublishing(true);
    await sleep(1500);
    setPublishing(false);
    setPublished(true);
    toast.success("Welcome to Vouch! Your profile is live.");
  }

  // ─── Navigation ───

  function goNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  // ─── Drag handlers (trigger simulated parse) ───

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); }
  function handleDragEnter(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setIsDragging(false); simulateResumeParse(); }
  function handleFileInput() { simulateResumeParse(); }

  const currentStep = STEPS[step];
  const isVerified = verificationStatus === "verified";
  const isPending = verificationStatus === "pending";

  // ─── Render ───

  if (published) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Published!</h1>
          <p className="text-muted-foreground">
            {form.full_name} is now live on Vouch. Employers can discover, verify, and connect with this candidate.
          </p>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm text-left">
            <div className="flex items-center gap-4">
              <img src={photoPreviewUrl || ""} alt={form.full_name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{form.full_name}</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{form.headline}</p>
                <p className="text-xs text-muted-foreground/60">{form.location}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <ScoreRing score={82} size={90} strokeWidth={5} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This was a demo walkthrough. In production, the candidate would now land on their full dashboard.
          </p>
          <Button onClick={() => { setPublished(false); setStep(0); setResumeDone(false); setParseStats(null); setPhotoPreviewUrl(null); setPhotoAnalysis(null); setVerificationStatus(null); setParsedSkills([]); setForm({ full_name: DEMO_CANDIDATE.full_name, phone: "", location: "", headline: "", summary: "", skills: "", domains: "" }); }}>
            Restart Demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <div className="border-b border-border py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <VouchLogo size="sm" href="/demo/onboarding" />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 text-xs font-semibold rounded-full border border-amber-500/20">
              <Eye className="w-3 h-3" />
              DEMO MODE
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Step Progress Bar ── */}
      <div className="py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isComplete = i < step;
              const isCurrent = i === step;
              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isComplete ? "bg-primary text-primary-foreground shadow-sm" : isCurrent ? "bg-primary/10 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-[10px] mt-1.5 whitespace-nowrap font-medium ${isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-14px] transition-colors duration-300 ${isComplete ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 pb-40">
        <div className="w-full max-w-xl">

          {/* ──────── Step 0: Welcome ──────── */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome to Vouch{form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}!
                </h1>
                <p className="text-muted-foreground text-lg mt-2 max-w-md mx-auto">
                  Let&apos;s build your verified profile in a few quick steps.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Here&apos;s what we&apos;ll do together:</p>
                <div className="space-y-2.5">
                  {STEPS.slice(1, -1).map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.key} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span><span className="font-medium text-foreground">{s.label}</span> &mdash; {s.description}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Takes about 5 minutes. You can skip any step and come back later.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={DEMO_CANDIDATE.email} disabled className="bg-muted" />
                </div>
              </div>
            </div>
          )}

          {/* ──────── Step 1: Resume ──────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Upload your resume</h2>
                <p className="text-muted-foreground mt-2">Our AI will extract your experience, skills, and education automatically.</p>
              </div>
              {!resumeDone ? (
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploading && !parsing && (fileInputRef.current?.click(), simulateResumeParse())}
                  className={`relative flex flex-col items-center justify-center w-full min-h-[280px] rounded-2xl cursor-pointer border-3 border-dashed transition-all duration-200 ${
                    uploading || parsing
                      ? "border-primary/40 bg-primary/5 cursor-wait"
                      : isDragging
                        ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
                        : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-base font-medium text-primary">Uploading...</p>
                    </div>
                  ) : parsing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-base font-medium text-primary">AI is reading your resume...</p>
                      <p className="text-sm text-muted-foreground">Extracting experience, education &amp; skills</p>
                    </div>
                  ) : isDragging ? (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-14 h-14 text-primary" />
                      <p className="text-lg font-semibold text-primary">Drop it right here!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 px-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-foreground">Drag &amp; drop your resume here</p>
                        <p className="text-sm text-muted-foreground mt-1">or <span className="text-primary font-medium underline underline-offset-2">click to browse</span></p>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {["PDF", "DOCX", "TXT"].map((type) => (
                          <span key={type} className="px-2.5 py-1 bg-muted rounded text-[11px] font-medium text-muted-foreground">.{type.toLowerCase()}</span>
                        ))}
                        <span className="text-[11px] text-muted-foreground/60">Max 10 MB</span>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileInput} disabled={uploading || parsing} className="hidden" />
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">Resume parsed successfully!</p>
                      <p className="text-sm text-muted-foreground">Here&apos;s what we found:</p>
                    </div>
                  </div>
                  {parseStats && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: parseStats.experience, label: "Jobs" },
                        { value: parseStats.education, label: "Degrees" },
                        { value: parseStats.skills, label: "Skills" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-background border border-border p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => { setResumeDone(false); setParseStats(null); }}>
                    Upload a different resume
                  </Button>
                </div>
              )}
              <p className="text-xs text-center text-muted-foreground">You can skip this and fill in your profile manually.</p>
            </div>
          )}

          {/* ──────── Step 2: Profile ──────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Review your profile</h2>
                <p className="text-muted-foreground mt-2">Edit anything that doesn&apos;t look right.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Professional Summary</Label>
                    <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={generatingSummary} className="text-xs">
                      {generatingSummary ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      AI Generate
                    </Button>
                  </div>
                  <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={4} placeholder="Brief professional summary..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────── Step 3: Skills ──────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Your skills</h2>
                <p className="text-muted-foreground mt-2">Tap to toggle skills on or off. These help employers find you.</p>
              </div>
              {parsedSkills.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    parsedSkills.reduce((acc, s) => {
                      const cat = s.category || "Other";
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(s);
                      return acc;
                    }, {} as Record<string, typeof parsedSkills>)
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <button
                            key={skill.name}
                            onClick={() => {
                              const updated = [...parsedSkills];
                              const idx = updated.findIndex((s) => s.name === skill.name);
                              updated[idx] = { ...updated[idx], selected: !updated[idx].selected };
                              setParsedSkills(updated);
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              skill.selected ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground line-through"
                            }`}
                          >
                            {skill.selected ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
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
                  <Textarea value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} rows={3} placeholder="JavaScript, React, Node.js, Python..." />
                </div>
              )}
            </div>
          )}

          {/* ──────── Step 4: Photo ──────── */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Add a headshot</h2>
                <p className="text-muted-foreground mt-2">A professional photo boosts your Vouch Score and builds trust with employers.</p>
              </div>
              {photoPreviewUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <img src={photoPreviewUrl} alt="Your headshot" className="w-40 h-40 rounded-full object-cover border-4 border-primary/20 shadow-lg" />
                    {analyzingPhoto && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  {photoAnalysis && (
                    <div className="w-full rounded-xl border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Photo Quality</span>
                        <span className={`text-sm font-bold ${photoAnalysis.quality_score >= 70 ? "text-primary" : photoAnalysis.quality_score >= 40 ? "text-amber-500" : "text-destructive"}`}>
                          {photoAnalysis.quality_score}/100
                        </span>
                      </div>
                      {photoAnalysis.suggestions.length > 0 && (
                        <div className="space-y-1">
                          {photoAnalysis.suggestions.map((s, i) => (
                            <p key={i} className="text-xs text-muted-foreground">&bull; {s}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { setPhotoPreviewUrl(null); setPhotoAnalysis(null); }} className="text-sm text-primary font-medium underline underline-offset-2 hover:text-primary/80">
                    Choose a different photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={simulatePhotoUpload}
                  className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                  <span className="text-sm font-medium text-foreground">Click to upload a headshot</span>
                  <span className="text-xs text-muted-foreground/60 mt-1">JPG or PNG recommended</span>
                </div>
              )}
              <p className="text-xs text-center text-muted-foreground">You can skip this for now and add a photo later.</p>
            </div>
          )}

          {/* ──────── Step 5: Verify Identity ──────── */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Verify your identity</h2>
                <p className="text-muted-foreground mt-2">This is what makes Vouch special. A verified identity badge makes employers trust you instantly.</p>
              </div>
              <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 space-y-5">
                {isVerified ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-primary">Identity Verified</p>
                    <p className="text-sm text-muted-foreground text-center">You&apos;re all set! Your verified badge will appear on your public profile.</p>
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    </div>
                    <p className="text-lg font-semibold text-amber-600">Verification in progress</p>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">Your ID is being reviewed. This usually takes a few minutes. You can continue and we&apos;ll notify you.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Fingerprint className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Quick &amp; secure identity check</h3>
                        <p className="text-sm text-muted-foreground mt-1">You&apos;ll be redirected to our secure partner (Persona) to scan a government-issued ID. It takes under 2 minutes.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: "🔒", title: "Encrypted", desc: "Bank-level security" },
                        { icon: "🗑️", title: "Deleted after", desc: "Docs removed post-review" },
                        { icon: "⚡", title: "Under 2 min", desc: "Quick scan & done" },
                      ].map((item) => (
                        <div key={item.title} className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-xl mb-1">{item.icon}</p>
                          <p className="text-xs font-semibold text-foreground">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <Button onClick={simulateVerification} disabled={startingPersona} className="w-full" size="lg">
                      {startingPersona ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                      {startingPersona ? "Starting verification..." : "Start Identity Verification"}
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">You can skip this and verify later from your dashboard. Verified profiles get 3x more employer views.</p>
            </div>
          )}

          {/* ──────── Step 6: Launch ──────── */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">You&apos;re ready to launch!</h2>
                <p className="text-muted-foreground mt-2">Here&apos;s a preview of your Vouch profile. Hit publish to go live.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-4">
                  {photoPreviewUrl ? (
                    <img src={photoPreviewUrl} alt={form.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                      {form.full_name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold truncate">{form.full_name || "Your Name"}</h3>
                      {(isVerified || isPending) && <ShieldCheck className={`w-5 h-5 flex-shrink-0 ${isVerified ? "text-primary" : "text-amber-500"}`} />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{form.headline || "Your headline"}</p>
                    {form.location && <p className="text-xs text-muted-foreground/60">{form.location}</p>}
                  </div>
                </div>
                {form.summary && <p className="text-sm text-muted-foreground line-clamp-3">{form.summary}</p>}
                {form.skills && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8).map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{skill}</span>
                    ))}
                    {form.skills.split(",").filter((s) => s.trim()).length > 8 && (
                      <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        +{form.skills.split(",").filter((s) => s.trim()).length - 8} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex justify-center pt-2">
                  <ScoreRing score={82} size={100} strokeWidth={6} />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profile checklist</p>
                {[
                  { label: "Name & contact", done: !!form.full_name },
                  { label: "Resume uploaded", done: resumeDone },
                  { label: "Professional headline", done: !!form.headline },
                  { label: "Skills added", done: parsedSkills.some((s) => s.selected) || !!form.skills.trim() },
                  { label: "Headshot", done: !!photoPreviewUrl },
                  { label: "Identity verified", done: isVerified, pending: isPending },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : "pending" in item && item.pending ? (
                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                    )}
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-xl mx-auto py-4 px-6">
          {currentStep.next && (
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              {currentStep.next}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step === STEPS.length - 1 ? (
              <Button onClick={simulatePublish} size="lg" disabled={publishing}>
                {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                {publishing ? "Publishing..." : "Publish My Profile"}
              </Button>
            ) : (
              <Button onClick={goNext}>
                {step === 0 ? "Get Started" : step === 5 ? (isPending || isVerified ? "Continue" : "Skip for now") : "Continue"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
