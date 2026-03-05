"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  Clock,
  XCircle,
  LogOut,
  Plus,
  Trash2,
  Camera,
  Link2,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

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
  const [activeTab, setActiveTab] = useState<"profile" | "resume" | "verify">("profile");
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

    // Generate slug from name: "John Doe" -> "john-doe-a1b2"
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
    }
    setAddingEdu(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
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
      alert("Upload failed: " + uploadError.message);
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

        router.refresh();
      }
    } catch {
      console.error("Parse failed");
    }

    setParsing(false);
    setUploading(false);
  }

  async function handleSaveProfile() {
    setSaving(true);
    await supabase
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
      alert("Upload failed: " + uploadError.message);
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
    router.refresh();
  }

  const verificationBadge = () => {
    const status = profile?.verification_status || "unverified";
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <BadgeCheck className="w-4 h-4" /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" /> Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Not Verified
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">Rishan Verify</span>
          </div>
          <div className="flex items-center gap-4">
            {verificationBadge()}
            <span className="text-sm text-gray-600">{profile?.full_name || user.email}</span>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100 w-fit mb-8">
          {[
            { key: "profile" as const, label: "My Profile", icon: FileText },
            { key: "resume" as const, label: "Resume Upload", icon: Upload },
            { key: "verify" as const, label: "Get Verified", icon: BadgeCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "full_name" as const, placeholder: "John Doe" },
                  { label: "Phone", key: "phone" as const, placeholder: "+1 (555) 123-4567" },
                  { label: "Location", key: "location" as const, placeholder: "New York, NY" },
                  { label: "Headline", key: "headline" as const, placeholder: "Senior Salesforce Developer" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={profileData[key]}
                      onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea
                    value={profileData.summary}
                    onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief professional summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={profileData.skills}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    placeholder="Salesforce, Apex, JavaScript, SQL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domains (comma-separated)</label>
                  <input
                    type="text"
                    value={profileData.domains}
                    onChange={(e) => setProfileData({ ...profileData, domains: e.target.value })}
                    placeholder="IT, Healthcare, Legal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-400" /> Work Experience
                </h2>
                <button onClick={() => setShowAddExp(!showAddExp)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {showAddExp && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Job Title *</label>
                      <input type="text" value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} placeholder="Software Engineer" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
                      <input type="text" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} placeholder="Acme Inc." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input type="date" value={newExp.start_date} onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                      <input type="date" value={newExp.end_date} disabled={newExp.is_current} onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newExp.is_current} onChange={(e) => setNewExp({ ...newExp, is_current: e.target.checked })} className="rounded" /> I currently work here
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} rows={2} placeholder="Brief description of your role..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddExperience} disabled={!newExp.company || !newExp.title || addingExp} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                      {addingExp ? "Adding..." : "Add Experience"}
                    </button>
                    <button onClick={() => setShowAddExp(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                  </div>
                </div>
              )}

              {experience.length === 0 && !showAddExp ? (
                <p className="text-gray-500 text-sm">
                  No experience added yet. Upload your resume to auto-fill, or click Add above.
                </p>
              ) : (
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-400">
                          {exp.start_date || "?"} — {exp.is_current ? "Present" : exp.end_date || "?"}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-500 mt-1">{exp.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gray-400" /> Education
                </h2>
                <button onClick={() => setShowAddEdu(!showAddEdu)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {showAddEdu && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Institution *</label>
                      <input type="text" value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} placeholder="University of California, Berkeley" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                      <input type="text" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} placeholder="Bachelor of Science" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Field of Study</label>
                      <input type="text" value={newEdu.field_of_study} onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })} placeholder="Computer Science" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input type="date" value={newEdu.start_date} onChange={(e) => setNewEdu({ ...newEdu, start_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                      <input type="date" value={newEdu.end_date} onChange={(e) => setNewEdu({ ...newEdu, end_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddEducation} disabled={!newEdu.institution || addingEdu} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                      {addingEdu ? "Adding..." : "Add Education"}
                    </button>
                    <button onClick={() => setShowAddEdu(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                  </div>
                </div>
              )}

              {education.length === 0 && !showAddEdu ? (
                <p className="text-gray-500 text-sm">
                  No education added yet. Upload your resume to auto-fill, or click Add above.
                </p>
              ) : (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{edu.institution}</p>
                        <p className="text-sm text-gray-600">
                          {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                        </p>
                        <p className="text-xs text-gray-400">
                          {edu.start_date || "?"} — {edu.end_date || "?"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume upload tab */}
        {activeTab === "resume" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-semibold mb-2">Upload Your Resume</h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and our AI will automatically extract your experience,
              education, and skills to build your profile.
            </p>

            {profile?.resume_file_path && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume already uploaded. Upload a new one to replace it.
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600">
                {uploading
                  ? "Uploading..."
                  : parsing
                  ? "AI is parsing your resume..."
                  : "Click to upload PDF or DOCX"}
              </span>
              <span className="text-xs text-gray-400 mt-1">Max 10MB</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading || parsing}
                className="hidden"
              />
            </label>

            {parsing && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-700 border-t-transparent" />
                  <span className="text-sm font-medium">
                    Extracting experience, education, and skills from your resume...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verify tab */}
        {activeTab === "verify" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-semibold mb-2">Get Verified</h2>

            {profile?.verification_status === "verified" ? (
              <div className="space-y-6">
                {/* Verified status */}
                <div className="p-6 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <BadgeCheck className="w-8 h-8 text-green-600" />
                    <span className="text-xl font-semibold text-green-700">You are verified!</span>
                  </div>
                  {latestVerification?.immigration_status && (
                    <p className="text-green-700">
                      Status: {latestVerification.immigration_status}
                    </p>
                  )}
                  {profile.verification_expires_at && (
                    <p className="text-green-600 text-sm mt-1">
                      Valid until: {new Date(profile.verification_expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Share your badge */}
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Share Your Verified Badge</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Share your verified profile link on your resume, LinkedIn, or with
                    recruiters to prove your identity and work authorization instantly.
                  </p>

                  {publicUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-lg border border-blue-300 px-4 py-2.5 flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate font-mono">
                            {publicUrl}
                          </span>
                        </div>
                        <button
                          onClick={copyProfileLink}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex-shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-blue-600">
                        Anyone with this link can see your verified status, skills, and
                        experience — but never your raw documents or personal ID information.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={generatePublicSlug}
                      disabled={generatingSlug}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                    >
                      <Link2 className="w-4 h-4" />
                      {generatingSlug ? "Generating..." : "Generate My Public Profile Link"}
                    </button>
                  )}
                </div>
              </div>
            ) : profile?.verification_status === "pending" ? (
              <div className="p-6 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <span className="text-xl font-semibold text-yellow-700">
                    Verification in progress
                  </span>
                </div>
                <p className="text-yellow-700">
                  Your ID has been submitted and is being reviewed. We&apos;ll notify you once
                  the review is complete. Your document will be destroyed after review.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Submit a photo of your passport or government-issued ID. A human reviewer
                  will verify your identity using official government sources. Your document
                  is <strong>permanently destroyed</strong> immediately after verification.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    <strong>Privacy guarantee:</strong> Your passport photo is encrypted during
                    upload, only accessible to authorized reviewers, and permanently deleted
                    from our systems the moment verification is complete. We only retain the
                    result (e.g. &ldquo;Verified&rdquo;), never the source document.
                  </p>
                </div>

                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-colors">
                  <Camera className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">
                    {uploadingId
                      ? "Uploading securely..."
                      : "Click to upload passport photo"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
