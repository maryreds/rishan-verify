export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface Profile {
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
  vanity_slug: string | null;
  verification_status: string | null;
  verification_expires_at: string | null;
  resume_parsed_at: string | null;
  vouch_score: number | null;
  photo_original_url: string | null;
  summary_ai: string | null;
  video_intro_url?: string | null;
  video_intro_transcript?: string | null;
  video_intro_duration?: number | null;
  parsed_cv_json?: Record<string, unknown> | null;
}

export interface VerificationRequest {
  immigration_status: string | null;
  status_valid_until: string | null;
  reviewed_at?: string | null;
}

export function coerceDate(val: string | null | undefined): string | null {
  if (!val) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
  const monthMatch = val.match(/^(\w+)\s+(\d{4})$/);
  if (monthMatch) {
    const d2 = new Date(`${monthMatch[1]} 1, ${monthMatch[2]}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().split("T")[0];
  }
  return null;
}
