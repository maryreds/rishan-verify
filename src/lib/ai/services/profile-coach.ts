import { getAIProvider } from "../index";

interface ProfileData {
  name?: string | null;
  headline?: string | null;
  summary?: string | null;
  skills?: string[];
  experience_count: number;
  education_count: number;
  verification_status?: string | null;
  photo_url?: string | null;
  vouch_score?: number | null;
}

interface Suggestion {
  category: string;
  title: string;
  message: string;
  action_type:
    | "generate_summary"
    | "add_skills"
    | "add_experience"
    | "upload_photo"
    | "verify_identity"
    | "improve_headline"
    | "add_portfolio";
  impact: "high" | "medium" | "low";
}

interface CoachResult {
  overall_grade: "A" | "B" | "C" | "D" | "F";
  suggestions: Suggestion[];
}

export async function analyzeProfile(profileData: ProfileData): Promise<CoachResult> {
  const ai = getAIProvider();

  const profileContext = JSON.stringify(profileData, null, 2);

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert career coach and profile optimization specialist for a verified candidate marketplace called Vouch.

Analyze the candidate's profile data and provide a comprehensive assessment.

**Grading Criteria:**
- A: Profile is exceptional. Has headline, detailed summary, 5+ skills, 2+ experiences, education, photo, and identity verification.
- B: Profile is strong. Most sections filled out, may be missing 1-2 minor items.
- C: Profile is average. Has basics but missing several important sections like summary, skills, or verification.
- D: Profile is weak. Missing multiple critical sections.
- F: Profile is very incomplete. Only has bare minimum (name/email).

**Analysis Areas:**
1. Headline quality — Is it specific, keyword-rich, and compelling?
2. Summary — Does it exist? Is it well-written and professional?
3. Skills — Are there enough? Do they match the headline/experience?
4. Experience — Is there sufficient work history?
5. Education — Is education listed?
6. Photo — Is a professional photo uploaded?
7. Identity Verification — Has the candidate verified their identity?
8. Portfolio — Are there work samples or projects?

For each area that needs improvement, provide a specific, actionable suggestion. Prioritize suggestions by impact.

Respond with JSON only in this exact format:
{
  "overall_grade": "A"|"B"|"C"|"D"|"F",
  "suggestions": [
    {
      "category": "string (e.g., Headline, Summary, Skills, Experience, Photo, Verification, Portfolio)",
      "title": "string (short actionable title)",
      "message": "string (1-2 sentence specific advice)",
      "action_type": "generate_summary"|"add_skills"|"add_experience"|"upload_photo"|"verify_identity"|"improve_headline"|"add_portfolio",
      "impact": "high"|"medium"|"low"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Analyze this candidate profile and provide improvement suggestions:\n\n${profileContext}`,
      },
    ],
    model: "standard",
    temperature: 0.4,
    maxTokens: 1500,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as CoachResult;
}
