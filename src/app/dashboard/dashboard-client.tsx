"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Camera,
  Link2,
  Copy,
  Check,
  Share2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  domains: string[];
  skills: string[];
  availability: string;
  verification_status: string;
  verified_at: string | null;
  verification_expires_at: string | null;
  resume_file_path: string | null;
  public_slug: string | null;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface VerificationRequest {
  id: string;
  status: string;
  created_at: string;
  immigration_status: string | null;
  status_valid_until: string | null;
}

export default function DashboardClient({
  user,
  profile,
  experience: initialExperience,
  education: initialEducation,
  latestVerification,
}: {
  user: User;
  profile: Profile | null;
  experience: Experience[];
  education: Education[];
  latestVerification: VerificationRequest | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [experience, setExperience] = useState(initialExperience);
  const [education, setEducation] = useState(initialEducation);
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    headline: profile?.headline || "",
    summary: profile?.summary || "",
    skills: profile?.skills?.join(", ") || "",
    domains: profile?.domains?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [showAddExp, setShowAddExp] = useState(false);
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [newExp, setNewExp] = useState({ company: "", title: "", start_date: "", end_date: "", is_current: false, description: "" });
  const [newEdu, setNewEdu] = useState({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "" });
  const [addingExp, setAddingExp] = useState(false);
  const [addingEdu, setAddingEdu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);

  const publicUrl = profile?.public_slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/v/${profile.public_slug}`
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
      .update({ public_slug: slug })
      .eq("id", user.id);

    if (!error) {
      router.refresh();
    }
    setGeneratingSlug(false);
  }

  function copyProfileLink() {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleAddExperience() {
    if (!newExp.company || !newExp.title) return;
    setAddingExp(true);
    const { data, error } = await supabase.from("work_experience").insert({
      profile_id: user.id,
      company: newExp.company,
      title: newExp.title,
      start_date: newExp.start_date || null,
      end_date: newExp.is_current ? null : (newExp.end_date || null),
      is_current: newExp.is_current,
      description: newExp.description || null,
    }).select().single();
    if (!error && data) {
      setExperience([data, ...experience]);
      setNewExp({ company: "", title: "", start_date: "", end_date: "", is_current: false, description: "" });
      setShowAddExp(false);
      toast.success("Experience added");
    } else if (error) {
      toast.error("Failed to add experience", { description: error.message });
    }
    setAddingExp(false);
  }

  async function handleAddEducation() {
    if (!newEdu.institution) return;
    setAddingEdu(true);
    const { data, error } = await supabase.from("education").insert({
      profile_id: user.id,
      institution: newEdu.institution,
      degree: newEdu.degree || null,
      field_of_study: newEdu.field_of_study || null,
      start_date: newEdu.start_date || null,
      end_date: newEdu.end_date || null,
    }).select().single();
    if (!error && data) {
      setEducation([data, ...education]);
      setNewEdu({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "" });
      setShowAddEdu(false);
      toast.success("Education added");
    } else if (error) {
      toast.error("Failed to add education", { description: error.message });
    }
    setAddingEdu(false);
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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

    // Now parse with AI
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const parsed = await res.json();

        if (parsed.full_name || parsed.phone || parsed.location || parsed.headline) {
          await supabase.from("profiles").update({
            full_name: parsed.full_name || profileData.full_name,
            phone: parsed.phone || profileData.phone,
            location: parsed.location || profileData.location,
            headline: parsed.headline || profileData.headline,
            summary: parsed.summary || profileData.summary,
            skills: parsed.skills || [],
            domains: parsed.domains || [],
            resume_parsed_at: new Date().toISOString(),
          }).eq("id", user.id);
        }

        if (parsed.experience?.length) {
          for (const exp of parsed.experience) {
            await supabase.from("work_experience").insert({
              profile_id: user.id,
              company: exp.company,
              title: exp.title,
              start_date: exp.start_date || null,
              end_date: exp.end_date || null,
              is_current: exp.is_current || false,
              description: exp.description || null,
            });
          }
        }

        if (parsed.education?.length) {
          for (const edu of parsed.education) {
            await supabase.from("education").insert({
              profile_id: user.id,
              institution: edu.institution,
              degree: edu.degree || null,
              field_of_study: edu.field_of_study || null,
              start_date: edu.start_date || null,
              end_date: edu.end_date || null,
            });
          }
        }

        toast.success("Resume parsed successfully", { description: "Your profile has been updated with extracted data." });
        router.refresh();
      }
    } catch {
      console.error("Parse failed");
      toast.error("Resume parsing failed", { description: "Please try again or fill in your profile manually." });
    }

    setParsing(false);
    setUploading(false);
  }

  async function handleSaveProfile() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        location: profileData.location,
        headline: profileData.headline,
        summary: profileData.summary,
        skills: profileData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        domains: profileData.domains.split(",").map((s) => s.trim()).filter(Boolean),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile", { description: error.message });
    } else {
      toast.success("Profile saved successfully");
    }
    setSaving(false);
  }

  async function handleDeleteExperience(id: string) {
    await supabase.from("work_experience").delete().eq("id", id);
    setExperience(experience.filter((e) => e.id !== id));
  }

  async function handleDeleteEducation(id: string) {
    await supabase.from("education").delete().eq("id", id);
    setEducation(education.filter((e) => e.id !== id));
  }

  async function handleIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(true);
    const filePath = `${user.id}/${Date.now()}-id-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("verification-docs")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      setUploadingId(false);
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

    setUploadingId(false);
    toast.success("Document uploaded", { description: "Your ID is now pending review." });
    router.refresh();
  }

  const verificationBadge = () => {
    const status = profile?.verification_status || "unverified";
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            {verificationBadge()}
            <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">
              <FileText className="h-4 w-4 mr-2" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="resume">
              <Upload className="h-4 w-4 mr-2" />
              Resume
            </TabsTrigger>
            <TabsTrigger value="verify">
              <BadgeCheck className="h-4 w-4 mr-2" />
              Verify
            </TabsTrigger>
          </TabsList>

          {/* ───────────── Profile Tab ───────────── */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", key: "full_name" as const, placeholder: "John Doe" },
                      { label: "Phone", key: "phone" as const, placeholder: "+1 (555) 123-4567" },
                      { label: "Location", key: "location" as const, placeholder: "New York, NY" },
                      { label: "Headline", key: "headline" as const, placeholder: "Senior Salesforce Developer" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                          id={key}
                          type="text"
                          value={profileData[key]}
                          onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        value={profileData.summary}
                        onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                        rows={3}
                        placeholder="Brief professional summary..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        type="text"
                        value={profileData.skills}
                        onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                        placeholder="Salesforce, Apex, JavaScript, SQL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domains">Domains (comma-separated)</Label>
                      <Input
                        id="domains"
                        type="text"
                        value={profileData.domains}
                        onChange={(e) => setProfileData({ ...profileData, domains: e.target.value })}
                        placeholder="IT, Healthcare, Legal"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" /> Work Experience
                  </CardTitle>
                  <Dialog open={showAddExp} onOpenChange={setShowAddExp}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Experience</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="exp-title">Job Title *</Label>
                            <Input
                              id="exp-title"
                              value={newExp.title}
                              onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="exp-company">Company *</Label>
                            <Input
                              id="exp-company"
                              value={newExp.company}
                              onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                              placeholder="Acme Inc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="exp-start">Start Date</Label>
                            <Input
                              id="exp-start"
                              type="date"
                              value={newExp.start_date}
                              onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="exp-end">End Date</Label>
                            <Input
                              id="exp-end"
                              type="date"
                              value={newExp.end_date}
                              disabled={newExp.is_current}
                              onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newExp.is_current}
                            onChange={(e) => setNewExp({ ...newExp, is_current: e.target.checked })}
                            className="rounded"
                          />
                          I currently work here
                        </label>
                        <div className="space-y-2">
                          <Label htmlFor="exp-desc">Description</Label>
                          <Textarea
                            id="exp-desc"
                            value={newExp.description}
                            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                            rows={2}
                            placeholder="Brief description of your role..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowAddExp(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddExperience}
                          disabled={!newExp.company || !newExp.title || addingExp}
                        >
                          {addingExp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {addingExp ? "Adding..." : "Add Experience"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {experience.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No experience added yet. Upload your resume to auto-fill, or click Add above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {experience.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-start border-b border-border pb-4 last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{exp.title}</p>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                            <p className="text-xs text-muted-foreground/60">
                              {exp.start_date || "?"} — {exp.is_current ? "Present" : exp.end_date || "?"}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteExperience(exp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" /> Education
                  </CardTitle>
                  <Dialog open={showAddEdu} onOpenChange={setShowAddEdu}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Education</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="edu-institution">Institution *</Label>
                            <Input
                              id="edu-institution"
                              value={newEdu.institution}
                              onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                              placeholder="University of California, Berkeley"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-degree">Degree</Label>
                            <Input
                              id="edu-degree"
                              value={newEdu.degree}
                              onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                              placeholder="Bachelor of Science"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-field">Field of Study</Label>
                            <Input
                              id="edu-field"
                              value={newEdu.field_of_study}
                              onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                              placeholder="Computer Science"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-start">Start Date</Label>
                            <Input
                              id="edu-start"
                              type="date"
                              value={newEdu.start_date}
                              onChange={(e) => setNewEdu({ ...newEdu, start_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-end">End Date</Label>
                            <Input
                              id="edu-end"
                              type="date"
                              value={newEdu.end_date}
                              onChange={(e) => setNewEdu({ ...newEdu, end_date: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowAddEdu(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddEducation}
                          disabled={!newEdu.institution || addingEdu}
                        >
                          {addingEdu ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {addingEdu ? "Adding..." : "Add Education"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {education.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No education added yet. Upload your resume to auto-fill, or click Add above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start border-b border-border pb-4 last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              {edu.start_date || "?"} — {edu.end_date || "?"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteEducation(edu.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ───────────── Resume Upload Tab ───────────── */}
          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Upload your resume and our AI will automatically extract your experience,
                  education, and skills to build your profile.
                </p>

                {profile?.resume_file_path && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Resume already uploaded. Upload a new one to replace it.
                    </AlertDescription>
                  </Alert>
                )}

                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {uploading
                      ? "Uploading..."
                      : parsing
                      ? "AI is parsing your resume..."
                      : "Click to upload PDF or DOCX"}
                  </span>
                  <span className="text-xs text-muted-foreground/60 mt-1">Max 10MB</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={uploading || parsing}
                    className="hidden"
                  />
                </label>

                {parsing && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Extracting experience, education, and skills from your resume...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────────── Verify Tab ───────────── */}
          <TabsContent value="verify">
            <Card>
              <CardHeader>
                <CardTitle>Get Verified</CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.verification_status === "verified" ? (
                  <div className="space-y-6">
                    {/* Verified status */}
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <BadgeCheck className="w-8 h-8 text-emerald-600" />
                        <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                          You are verified!
                        </span>
                      </div>
                      {latestVerification?.immigration_status && (
                        <p className="text-emerald-700 dark:text-emerald-400">
                          Status: {latestVerification.immigration_status}
                        </p>
                      )}
                      {profile.verification_expires_at && (
                        <p className="text-emerald-600 dark:text-emerald-500 text-sm mt-1">
                          Valid until: {new Date(profile.verification_expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Share your badge */}
                    <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Share2 className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Share Your Verified Badge</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share your verified profile link on your resume, LinkedIn, or with
                        recruiters to prove your identity and work authorization instantly.
                      </p>

                      {publicUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-lg border border-border px-4 py-2.5 flex items-center gap-2 bg-background">
                              <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm text-foreground truncate font-mono">
                                {publicUrl}
                              </span>
                            </div>
                            <Button onClick={copyProfileLink} className="flex-shrink-0">
                              {copied ? (
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
                          <p className="text-xs text-muted-foreground">
                            Anyone with this link can see your verified status, skills, and
                            experience — but never your raw documents or personal ID information.
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={generatePublicSlug}
                          disabled={generatingSlug}
                        >
                          {generatingSlug ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                          {generatingSlug ? "Generating..." : "Generate My Public Profile Link"}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : profile?.verification_status === "pending" ? (
                  <div className="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-8 h-8 text-amber-600" />
                      <span className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                        Verification in progress
                      </span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-400">
                      Your ID has been submitted and is being reviewed. We&apos;ll notify you once
                      the review is complete. Your document will be destroyed after review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">
                      Submit a photo of your passport or government-issued ID. A human reviewer
                      will verify your identity using official government sources. Your document
                      is <strong className="text-foreground">permanently destroyed</strong> immediately after verification.
                    </p>

                    <Alert>
                      <AlertDescription>
                        <strong>Privacy guarantee:</strong> Your passport photo is encrypted during
                        upload, only accessible to authorized reviewers, and permanently deleted
                        from our systems the moment verification is complete. We only retain the
                        result (e.g. &ldquo;Verified&rdquo;), never the source document.
                      </AlertDescription>
                    </Alert>

                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                      <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {uploadingId
                          ? "Uploading securely..."
                          : "Click to upload passport photo"}
                      </span>
                      <span className="text-xs text-muted-foreground/60 mt-1">
                        JPG, PNG, or PDF. This will be deleted after review.
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleIdUpload}
                        disabled={uploadingId}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
