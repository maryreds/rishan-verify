import { getAIProvider } from "../index";

interface JobMatchParams {
  candidateSkills: string[];
  candidateHeadline: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
}

interface JobMatchResult {
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string;
}

export async function matchJobToProfile(
  params: JobMatchParams
): Promise<JobMatchResult> {
  const ai = getAIProvider();

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert job matching analyst. Given a candidate's skills and headline, and a job posting, evaluate how well the candidate matches the role.

Provide:
1. A match_score (0-100) indicating overall fit.
2. matching_skills: which of the candidate's skills align with the job requirements.
3. missing_skills: required skills the candidate lacks.
4. recommendation: a brief 1-2 sentence recommendation for the candidate.

Respond with JSON only in this exact format:
{
  "match_score": number,
  "matching_skills": ["string"],
  "missing_skills": ["string"],
  "recommendation": "string"
}`,
      },
      {
        role: "user",
        content: `Candidate headline: ${params.candidateHeadline || "Not specified"}
Candidate skills: ${params.candidateSkills.join(", ") || "None listed"}

Job title: ${params.jobTitle}
Job description: ${params.jobDescription || "No description provided"}
Required skills: ${params.requiredSkills.join(", ") || "None specified"}`,
      },
    ],
    model: "fast",
    temperature: 0.2,
    maxTokens: 1000,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as JobMatchResult;
}
