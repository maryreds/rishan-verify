"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { coerceDate } from "@/lib/types";

interface ResumeClientProps {
  user: User;
  profile: Profile | null;
}

export default function ResumeClient({ user, profile }: ResumeClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("resumes").upload(filePath, file);
    if (error) {
      toast.error("Upload failed", { description: error.message });
      setUploading(false);
      return;
    }

    await supabase.from("profiles").update({ resume_file_path: filePath }).eq("id", user.id);
    setParsing(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("userId", user.id);

      const res = await fetch("/api/parse-resume", { method: "POST", body });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Resume parsing failed", {
          description: err.error || `Server returned ${res.status}. Try again later.`,
        });
      } else {
        const parsed = await res.json();

        if (parsed.full_name || parsed.phone || parsed.location || parsed.headline) {
          await supabase
            .from("profiles")
            .update({
              full_name: parsed.full_name || profile?.full_name,
              phone: parsed.phone || profile?.phone,
              location: parsed.location || profile?.location,
              headline: parsed.headline || profile?.headline,
              summary: parsed.summary || profile?.summary,
              skills: parsed.skills || [],
              domains: parsed.domains || [],
              resume_parsed_at: new Date().toISOString(),
              parsed_cv_json: parsed,
            })
            .eq("id", user.id);
        }

        if (parsed.experience?.length) {
          for (const exp of parsed.experience) {
            await supabase
              .from("work_experience")
              .insert({
                profile_id: user.id,
                company: exp.company,
                title: exp.title,
                start_date: coerceDate(exp.start_date),
                end_date: coerceDate(exp.end_date),
                is_current: exp.is_current || false,
                description: exp.description || null,
              })
              .select()
              .single();
          }
        }

        if (parsed.education?.length) {
          for (const edu of parsed.education) {
            await supabase
              .from("education")
              .insert({
                profile_id: user.id,
                institution: edu.institution,
                degree: edu.degree || null,
                field_of_study: edu.field_of_study || null,
                start_date: coerceDate(edu.start_date),
                end_date: coerceDate(edu.end_date),
              })
              .select()
              .single();
          }
        }

        toast.success("Resume parsed successfully");
        router.refresh();
      }
    } catch {
      toast.error("Resume parsing failed");
    }

    setParsing(false);
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume</h1>
        <p className="text-sm text-muted-foreground">
          Upload your resume and AI will extract your experience, education, and skills.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.from("work_experience").delete().eq("profile_id", user.id);
              await supabase.from("education").delete().eq("profile_id", user.id);
              await supabase
                .from("profiles")
                .update({
                  skills: [],
                  domains: [],
                  headline: null,
                  summary: null,
                  resume_parsed_at: null,
                  parsed_cv_json: null,
                  resume_file_path: null,
                })
                .eq("id", user.id);
              toast.success("Profile data reset. Upload a new resume to re-parse.");
              router.refresh();
            }}
          >
            Reset &amp; Re-upload
          </Button>

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
    </div>
  );
}
