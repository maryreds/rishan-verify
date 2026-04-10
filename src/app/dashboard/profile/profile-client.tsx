"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import type { Profile, WorkExperience, Education } from "@/lib/types";

interface ProfileClientProps {
  user: User;
  profile: Profile | null;
  experience: WorkExperience[];
  education: Education[];
}

export default function ProfileClient({
  user,
  profile,
  experience,
  education,
}: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();

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
  const [newSkillInput, setNewSkillInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_original_url || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) {
      toast.error("File too large", { description: "Please use an image under 4.5 MB." });
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });
      let data: any;
      try {
        data = await res.json();
      } catch {
        toast.error("Upload failed", { description: "File may be too large. Please use an image under 10 MB." });
        setUploadingPhoto(false);
        return;
      }
      if (!res.ok) {
        toast.error("Upload failed", { description: data.error || "Unknown error" });
      } else {
        setPhotoUrl(data.url);
        toast.success("Profile photo updated!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
    }
    setUploadingPhoto(false);
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
      fetch("/api/profile/vouch-score", { method: "POST" }).catch(() => {});
      router.refresh();
    }

    setSavingProfile(false);
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
      setNewExp({ company: "", title: "", start_date: "", end_date: "", is_current: false, description: "" });
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
      setNewEdu({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "" });
      setShowEduDialog(false);
      toast.success("Education added");
    } else if (error) {
      toast.error("Failed to add education", { description: error.message });
    }

    setSavingEdu(false);
  }

  async function deleteExperience(id: string) {
    await supabase.from("work_experience").delete().eq("id", id);
    setExperienceList(experienceList.filter((e) => e.id !== id));
  }

  async function deleteEducation(id: string) {
    await supabase.from("education").delete().eq("id", id);
    setEducationList(educationList.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">Edit your professional information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile photo"
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-muted-foreground text-3xl">person</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : photoUrl ? (
                "Change photo"
              ) : (
                "Upload photo"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              { label: "Headline", key: "headline" as const, placeholder: "Senior Software Engineer" },
            ].map(({ label, key, placeholder }) => (
              <div className="space-y-2" key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="text"
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                placeholder="Brief professional summary..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-background">
                {formData.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.skills
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s && s !== skill)
                            .join(", ");
                          setFormData({ ...formData, skills: updated });
                        }}
                        className="ml-0.5 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const raw = newSkillInput.replace(/,/g, "").trim();
                      if (raw) {
                        const existing = formData.skills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        if (!existing.some((s) => s.toLowerCase() === raw.toLowerCase())) {
                          setFormData({ ...formData, skills: [...existing, raw].join(", ") });
                        }
                      }
                      setNewSkillInput("");
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const raw = newSkillInput.replace(/,/g, "").trim();
                    if (raw) {
                      const existing = formData.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      if (!existing.some((s) => s.toLowerCase() === raw.toLowerCase())) {
                        setFormData({ ...formData, skills: [...existing, raw].join(", ") });
                      }
                    }
                    setNewSkillInput("");
                  }}
                  disabled={!newSkillInput.trim()}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter or comma to add each skill. Click the x to remove.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domains">Domains (comma-separated)</Label>
              <Input
                id="domains"
                type="text"
                value={formData.domains}
                onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                placeholder="IT, Healthcare, Legal"
              />
            </div>
          </div>

          <Button onClick={saveProfile} disabled={savingProfile} className="mt-6">
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" /> Work Experience
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
                <Button variant="ghost" onClick={() => setShowExpDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={addExperience}
                  disabled={!newExp.company || !newExp.title || savingExp}
                >
                  {savingExp && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {savingExp ? "Adding..." : "Add Experience"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {experienceList.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No experience added yet. Upload your resume to auto-fill, or click Add above.
            </p>
          ) : (
            <div className="space-y-4">
              {experienceList.map((exp) => (
                <div
                  key={exp.id}
                  className="flex justify-between items-start border-l-2 border-primary/30 pl-4 pb-4 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{exp.title}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {exp.start_date || "?"} &mdash;{" "}
                      {exp.is_current ? "Present" : exp.end_date || "?"}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
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
            <GraduationCap className="w-5 h-5 text-muted-foreground" /> Education
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
        </CardHeader>
        <CardContent>
          {educationList.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No education added yet. Upload your resume to auto-fill, or click Add above.
            </p>
          ) : (
            <div className="space-y-4">
              {educationList.map((edu) => (
                <div
                  key={edu.id}
                  className="flex justify-between items-start border-b border-border pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree}
                      {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {edu.start_date || "?"} &mdash; {edu.end_date || "?"}
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
  );
}
