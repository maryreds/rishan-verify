export interface ChatParams {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: "fast" | "standard";
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

export interface VisionParams {
  prompt: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
}

export interface ParsedResume {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string[];
  domains: string[];
  experience: {
    company: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
  }[];
  education: {
    institution: string;
    degree: string | null;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
  }[];
}

export interface SkillExtraction {
  name: string;
  category: string;
  years_experience: number | null;
}

export interface PhotoAnalysis {
  quality_score: number;
  is_professional: boolean;
  suggestions: string[];
  lighting: "good" | "fair" | "poor";
  background: "clean" | "busy" | "neutral";
  face_detected: boolean;
}
