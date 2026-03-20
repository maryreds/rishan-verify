"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  GraduationCap,
  Upload,
  BadgeCheck,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Camera,
  Link2,
  Copy,
  Share2,
  Loader2,
  Check,
  ShieldCheck,
  Lock,
  Circle,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface WorkExperience {
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

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string[] | null;
  domains: string[] | null;
  resume_file_path: string | null;
  public_slug: string | null;
  verification_status: string | null;
  verification_expires_at: string | null;
  resume_parsed_at: string | null;
}

interface VerificationRequest {
  immigration_status: string | null;
  status_valid_until: string | null;
}

interface DashboardClientProps {
  user: User;
  profile: Profile | null;
  experience: WorkExperience[];
  education: Education[];
  latestVerification: VerificationRequest | null;
}

export default function DashboardClient({
  user,
  profile,
  experience,
  education,
  latestVerification,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [experienceList, setExperienceList] = useState<WorkExperience[]>(experience);
  const [educationList, setEducationList] = useState<Education[]>(education);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    headline: profile?.headline || "",
    summary: profile?.summary || "",
    skills: profile?.skills?.join(", ") || "",
    domains: profile?.domains?.join(", ") || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingVerification, setUploadingVerification] = useState(false);
  const [showExpDialog, setShowExpDialog] = useState(false);
  const [showEduDialog, setShowEduDialog] = useState(false);

  const [newExp, setNewExp] = useState({
    company: "",
    title: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  const [newEdu, setNewEdu] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
  });

  const [savingExp, setSavingExp] = useState(false);
  const [savingEdu, setSavingEdu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const [startingPersona, setStartingPersona] = useState(false);

  const publicUrl = profile?.public_slug ? `/v/${profile.public_slug}` : null;

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

    if (!error) router.refresh();
    setGeneratingSlug(false);
  }

  async function addExperience() {
    if (!newExp.company || !newExp.title) return;
    setSavingExp(true);

    const { data, error } = await supabase
      .from("work_experience")
      .insert({
        profile_id: user.id,
        company: newExp.company,
        title: newExp.title,
        start_date: newExp.start_date || null,
        end_date: newExp.is_current ? null : newExp.end_date || null,
        is_current: newExp.is_current,
        description: newExp.description || null,
      })
      .select()
      .single();

    if (!error && data) {
      setExperienceList([data, ...experienceList]);
      setNewExp({
        company: "",
        title: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
      });
      setShowExpDialog(false);
      toast.success("Experience added");
    } else if (error) {
      toast.error("Failed to add experience", { description: error.message });
    }

    setSavingExp(false);
  }

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
      setNewEdu({
        institution: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
      });
      setShowEduDialog(false);
      toast.success("Education added");
    } else if (error) {
      toast.error("Failed to add education", { description: error.message });
    }

    setSavingEdu(false);
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);

    if (error) {
      toast.error("Upload failed", { description: error.message });
      setUploading(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({ resume_file_path: filePath })
      .eq("id", user.id);

    setParsing(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("userId", user.id);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Resume parsing failed", {
          description: err.error || `Server returned ${res.status}. Try again later.`,
        });
      } else {
        const parsed = await res.json();

        // Update profile fields
        const updatedForm = {
          full_name: parsed.full_name || formData.full_name,
          phone: parsed.phone || formData.phone,
          location: parsed.location || formData.location,
          headline: parsed.headline || formData.headline,
          summary: parsed.summary || formData.summary,
          skills: (parsed.skills || []).join(", ") || formData.skills,
          domains: (parsed.domains || []).join(", ") || formData.domains,
        };

        if (parsed.full_name || parsed.phone || parsed.location || parsed.headline) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              full_name: updatedForm.full_name,
              phone: updatedForm.phone,
              location: updatedForm.location,
              headline: updatedForm.headline,
              summary: updatedForm.summary,
              skills: parsed.skills || [],
              domains: parsed.domains || [],
              resume_parsed_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (profileError) {
            console.error("Profile update failed:", profileError);
            toast.error("Failed to save parsed data to profile", {
              description: profileError.message,
            });
          }

          // Update local form state so UI reflects changes immediately
          setFormData(updatedForm);
        }

        // Insert experience and update local state
        if (parsed.experience?.length) {
          const newExperience: typeof experience = [];
          for (const exp of parsed.experience) {
            const { data } = await supabase.from("work_experience").insert({
              profile_id: user.id,
              company: exp.company,
              title: exp.title,
              start_date: exp.start_date || null,
              end_date: exp.end_date || null,
              is_current: exp.is_current || false,
              description: exp.description || null,
            }).select().single();
            if (data) newExperience.push(data);
          }
          setExperienceList((prev) => [...newExperience, ...prev]);
        }

        // Insert education and update local state
        if (parsed.education?.length) {
          const newEducation: typeof education = [];
          for (const edu of parsed.education) {
            const { data } = await supabase.from("education").insert({
              profile_id: user.id,
              institution: edu.institution,
              degree: edu.degree || null,
              field_of_study: edu.field_of_study || null,
              start_date: edu.start_date || null,
              end_date: edu.end_date || null,
            }).select().single();
            if (data) newEducation.push(data);
          }
          setEducationList((prev) => [...newEducation, ...prev]);
        }

        toast.success("Resume parsed successfully", {
          description: "Your profile has been updated with extracted data.",
        });
        router.refresh();
      }
    } catch {
      console.error("Parse failed");
      toast.error("Resume parsing failed", {
        description: "Please try again or fill in your profile manually.",
      });
    }

    setParsing(false);
    setUploading(false);
  }

  async function saveProfile() {
    setSavingProfile(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        headline: formData.headline,
        summary: formData.summary,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        domains: formData.domains
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile", { description: error.message });
    } else {
      toast.success("Profile saved successfully");
    }

    setSavingProfile(false);
  }

  async function deleteExperience(id: string) {
    await supabase.from("work_experience").delete().eq("id", id);
    setExperienceList(experienceList.filter((e) => e.id !== id));
  }

  async function deleteEducation(id: string) {
    await supabase.from("education").delete().eq("id", id);
    setEducationList(educationList.filter((e) => e.id !== id));
  }

  async function startPersonaVerification() {
    setStartingPersona(true);
    try {
      const res = await fetch("/api/persona/create-inquiry", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start verification");
      }

      const { sessionUrl } = await res.json();

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error("Could not start verification session. Please try again.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start verification";
      toast.error("Verification error", { description: message });
    } finally {
      setStartingPersona(false);
    }
  }

  async function handleVerificationUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVerification(true);
    const filePath = `${user.id}/${Date.now()}-id-${file.name}`;

    const { error } = await supabase.storage
      .from("verification-docs")
      .upload(filePath, file);

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

  function renderVerificationStatus() {
    switch (profile?.verification_status || "unverified") {
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
        return <Badge variant="outline">Not Verified</Badge>;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold tracking-tight">Rishan</span>
            <span className="text-muted-foreground/40 select-none">&mdash;</span>
            <span className="text-sm font-semibold tracking-tight">Verify</span>
          </a>
          <span className="text-sm text-muted-foreground">
            {profile?.full_name || user.email}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            {renderVerificationStatus()}
            <span className="text-sm text-muted-foreground">
              {profile?.full_name || user.email}
            </span>
          </div>
        </div>

        {/* Quick Stats Cards */}
        {(() => {
          const skillsCount = profile?.skills?.length || 0;
          const verificationLabel =
            profile?.verification_status === "verified"
              ? "Verified"
              : profile?.verification_status === "pending"
                ? "Pending"
                : "Not Verified";
          const verificationColor =
            profile?.verification_status === "verified"
              ? "text-emerald-600"
              : profile?.verification_status === "pending"
                ? "text-amber-600"
                : "text-muted-foreground";

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <Briefcase className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{experienceList.length}</p>
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <GraduationCap className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{educationList.length}</p>
                    <p className="text-xs text-muted-foreground">Education</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <Zap className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{skillsCount}</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <ShieldCheck className={`h-5 w-5 flex-shrink-0 ${verificationColor}`} />
                  <div>
                    <p className={`text-sm font-bold ${verificationColor}`}>{verificationLabel}</p>
                    <p className="text-xs text-muted-foreground">Verification</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Profile Completion Progress Bar */}
        {(() => {
          const checks = [
            { label: "Full name", done: !!profile?.full_name },
            { label: "Phone number", done: !!profile?.phone },
            { label: "Location", done: !!profile?.location },
            { label: "Headline", done: !!profile?.headline },
            { label: "Summary", done: !!profile?.summary },
            { label: "Skills", done: (profile?.skills?.length || 0) > 0 },
            { label: "Work experience", done: experienceList.length > 0, weight: 20 },
            { label: "Education", done: educationList.length > 0 },
            { label: "Resume uploaded", done: !!profile?.resume_file_path },
          ];
          const totalWeight = checks.reduce((sum, c) => sum + (c.weight || 10), 0);
          const completedWeight = checks
            .filter((c) => c.done)
            .reduce((sum, c) => sum + (c.weight || 10), 0);
          const percentage = Math.round((completedWeight / totalWeight) * 100);
          const missing = checks.filter((c) => !c.done).map((c) => c.label);

          if (percentage >= 100) return null;

          return (
            <Card className="mb-6">
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Profile {percentage}% complete
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {missing.length} item{missing.length !== 1 ? "s" : ""} remaining
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add your {missing.slice(0, 3).join(", ").toLowerCase()}
                  {missing.length > 3 ? ` and ${missing.length - 3} more` : ""} to complete your profile.
                </p>
              </CardContent>
            </Card>
          );
        })()}

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

          {/* Profile Tab */}
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
                      {
                        label: "Full Name",
                        key: "full_name" as const,
                        placeholder: "John Doe",
                      },
                      {
                        label: "Phone",
                        key: "phone" as const,
                        placeholder: "+1 (555) 123-4567",
                      },
                      {
                        label: "Location",
                        key: "location" as const,
                        placeholder: "New York, NY",
                      },
                      {
                        label: "Headline",
                        key: "headline" as const,
                        placeholder: "Senior Salesforce Developer",
                      },
                    ].map(({ label, key, placeholder }) => (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                          id={key}
                          type="text"
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          placeholder={placeholder}
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) =>
                          setFormData({ ...formData, summary: e.target.value })
                        }
                        rows={3}
                        placeholder="Brief professional summary..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        type="text"
                        value={formData.skills}
                        onChange={(e) =>
                          setFormData({ ...formData, skills: e.target.value })
                        }
                        placeholder="Salesforce, Apex, JavaScript, SQL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domains">Domains (comma-separated)</Label>
                      <Input
                        id="domains"
                        type="text"
                        value={formData.domains}
                        onChange={(e) =>
                          setFormData({ ...formData, domains: e.target.value })
                        }
                        placeholder="IT, Healthcare, Legal"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="mt-6"
                  >
                    {savingProfile && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" /> Work
                    Experience
                  </CardTitle>
                  <Dialog open={showExpDialog} onOpenChange={setShowExpDialog}>
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
                              onChange={(e) =>
                                setNewExp({ ...newExp, title: e.target.value })
                              }
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="exp-company">Company *</Label>
                            <Input
                              id="exp-company"
                              value={newExp.company}
                              onChange={(e) =>
                                setNewExp({
                                  ...newExp,
                                  company: e.target.value,
                                })
                              }
                              placeholder="Acme Inc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="exp-start">Start Date</Label>
                            <Input
                              id="exp-start"
                              type="date"
                              value={newExp.start_date}
                              onChange={(e) =>
                                setNewExp({
                                  ...newExp,
                                  start_date: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="exp-end">End Date</Label>
                            <Input
                              id="exp-end"
                              type="date"
                              value={newExp.end_date}
                              disabled={newExp.is_current}
                              onChange={(e) =>
                                setNewExp({
                                  ...newExp,
                                  end_date: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newExp.is_current}
                            onChange={(e) =>
                              setNewExp({
                                ...newExp,
                                is_current: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          I currently work here
                        </label>
                        <div className="space-y-2">
                          <Label htmlFor="exp-desc">Description</Label>
                          <Textarea
                            id="exp-desc"
                            value={newExp.description}
                            onChange={(e) =>
                              setNewExp({
                                ...newExp,
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            placeholder="Brief description of your role..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setShowExpDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addExperience}
                          disabled={
                            !newExp.company || !newExp.title || savingExp
                          }
                        >
                          {savingExp && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          {savingExp ? "Adding..." : "Add Experience"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {experienceList.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No experience added yet. Upload your resume to auto-fill,
                      or click Add above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {experienceList.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex justify-between items-start border-b border-border pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {exp.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {exp.company}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              {exp.start_date || "?"} &mdash;{" "}
                              {exp.is_current
                                ? "Present"
                                : exp.end_date || "?"}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {exp.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteExperience(exp.id)}
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
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />{" "}
                    Education
                  </CardTitle>
                  <Dialog open={showEduDialog} onOpenChange={setShowEduDialog}>
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
                            <Label htmlFor="edu-institution">
                              Institution *
                            </Label>
                            <Input
                              id="edu-institution"
                              value={newEdu.institution}
                              onChange={(e) =>
                                setNewEdu({
                                  ...newEdu,
                                  institution: e.target.value,
                                })
                              }
                              placeholder="University of California, Berkeley"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-degree">Degree</Label>
                            <Input
                              id="edu-degree"
                              value={newEdu.degree}
                              onChange={(e) =>
                                setNewEdu({
                                  ...newEdu,
                                  degree: e.target.value,
                                })
                              }
                              placeholder="Bachelor of Science"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-field">Field of Study</Label>
                            <Input
                              id="edu-field"
                              value={newEdu.field_of_study}
                              onChange={(e) =>
                                setNewEdu({
                                  ...newEdu,
                                  field_of_study: e.target.value,
                                })
                              }
                              placeholder="Computer Science"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-start">Start Date</Label>
                            <Input
                              id="edu-start"
                              type="date"
                              value={newEdu.start_date}
                              onChange={(e) =>
                                setNewEdu({
                                  ...newEdu,
                                  start_date: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edu-end">End Date</Label>
                            <Input
                              id="edu-end"
                              type="date"
                              value={newEdu.end_date}
                              onChange={(e) =>
                                setNewEdu({
                                  ...newEdu,
                                  end_date: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setShowEduDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addEducation}
                          disabled={!newEdu.institution || savingEdu}
                        >
                          {savingEdu && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          {savingEdu ? "Adding..." : "Add Education"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {educationList.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No education added yet. Upload your resume to auto-fill,
                      or click Add above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {educationList.map((edu) => (
                        <div
                          key={edu.id}
                          className="flex justify-between items-start border-b border-border pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {edu.degree}
                              {edu.field_of_study
                                ? ` in ${edu.field_of_study}`
                                : ""}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              {edu.start_date || "?"} &mdash;{" "}
                              {edu.end_date || "?"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteEducation(edu.id)}
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

          {/* Resume Tab */}
          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Upload your resume and our AI will automatically extract your
                  experience, education, and skills to build your profile.
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
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    Max 10MB
                  </span>
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
                      Extracting experience, education, and skills from your
                      resume...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Tab */}
          <TabsContent value="verify">
            {/* 5-Pillar Verification Checklist */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Verification Pillars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    const isIdentityVerified = profile?.verification_status === "verified";
                    const isIdentityPending = profile?.verification_status === "pending";
                    const hasWorkAuth = !!latestVerification?.immigration_status;

                    const pillars = [
                      {
                        name: "Identity",
                        status: isIdentityVerified
                          ? ("verified" as const)
                          : isIdentityPending
                            ? ("pending" as const)
                            : ("not_started" as const),
                      },
                      {
                        name: "Work Authorization",
                        status: hasWorkAuth
                          ? ("verified" as const)
                          : isIdentityPending
                            ? ("pending" as const)
                            : ("not_started" as const),
                      },
                      { name: "Background Check", status: "coming_soon" as const },
                      { name: "Certifications", status: "coming_soon" as const },
                      { name: "References", status: "coming_soon" as const },
                    ];

                    return pillars.map((pillar) => {
                      const config = {
                        verified: {
                          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
                          text: "Verified",
                          color: "text-emerald-600",
                          bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
                        },
                        pending: {
                          icon: <Clock className="w-5 h-5 text-amber-600" />,
                          text: "Pending",
                          color: "text-amber-600",
                          bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
                        },
                        coming_soon: {
                          icon: <Lock className="w-5 h-5 text-muted-foreground/50" />,
                          text: "Coming Soon",
                          color: "text-muted-foreground/60",
                          bg: "bg-muted/50 border-border",
                        },
                        not_started: {
                          icon: <Circle className="w-5 h-5 text-muted-foreground/40" />,
                          text: "Not Started",
                          color: "text-muted-foreground",
                          bg: "bg-background border-border",
                        },
                      }[pillar.status];

                      return (
                        <div
                          key={pillar.name}
                          className={`flex items-center gap-3 rounded-lg border p-3 ${config.bg}`}
                        >
                          {config.icon}
                          <div>
                            <p className="text-sm font-medium text-foreground">{pillar.name}</p>
                            <p className={`text-xs ${config.color}`}>{config.text}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Verified</CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.verification_status === "verified" ? (
                  <div className="space-y-6">
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
                          Valid until:{" "}
                          {new Date(
                            profile.verification_expires_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Share2 className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          Share Your Verified Badge
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share your verified profile link on your resume,
                        LinkedIn, or with recruiters to prove your identity and
                        work authorization instantly.
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
                            <Button
                              onClick={() => {
                                if (publicUrl) {
                                  navigator.clipboard.writeText(publicUrl);
                                  setLinkCopied(true);
                                  toast.success("Link copied to clipboard");
                                  setTimeout(
                                    () => setLinkCopied(false),
                                    2000
                                  );
                                }
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
                          <p className="text-xs text-muted-foreground">
                            Anyone with this link can see your verified status,
                            skills, and experience — but never your raw
                            documents or personal ID information.
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={generatePublicSlug}
                          disabled={generatingSlug}
                        >
                          {generatingSlug ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Link2 className="w-4 h-4 mr-2" />
                          )}
                          {generatingSlug
                            ? "Generating..."
                            : "Generate My Public Profile Link"}
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
                      Your ID has been submitted and is being reviewed. We'll
                      notify you once the review is complete. Your document will
                      be destroyed after review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">
                      Verify your identity to earn a trusted badge on your
                      profile. Choose the fastest option below.
                    </p>

                    {/* Primary: Persona verification */}
                    <div className="p-6 border border-primary/30 bg-primary/5 rounded-xl space-y-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Verify with Persona
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Instant identity verification — takes about 2
                            minutes
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You will be redirected to our secure verification
                        partner. Take a photo of your government-issued ID and a
                        quick selfie. Your documents are processed securely and
                        never stored on our servers.
                      </p>
                      <Button
                        onClick={startPersonaVerification}
                        disabled={startingPersona}
                        size="lg"
                        className="w-full"
                      >
                        {startingPersona ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 mr-2" />
                        )}
                        {startingPersona
                          ? "Starting verification..."
                          : "Verify with Persona"}
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 border-t border-border" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Or submit documents manually for review
                      </span>
                      <div className="flex-1 border-t border-border" />
                    </div>

                    {/* Fallback: Manual upload */}
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          <strong>Privacy guarantee:</strong> Your passport
                          photo is encrypted during upload, only accessible to
                          authorized reviewers, and permanently deleted from our
                          systems the moment verification is complete. We only
                          retain the result (e.g. &quot;Verified&quot;), never
                          the source document.
                        </AlertDescription>
                      </Alert>

                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {uploadingVerification
                            ? "Uploading securely..."
                            : "Click to upload passport or ID photo"}
                        </span>
                        <span className="text-xs text-muted-foreground/60 mt-1">
                          JPG, PNG, or PDF. This will be deleted after review.
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleVerificationUpload}
                          disabled={uploadingVerification}
                          className="hidden"
                        />
                      </label>
                    </div>
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
