import { getAIProvider } from "../index";

interface SkillGapParams {
  currentSkills: string[];
  targetRole: string;
}

interface MissingSkill {
  name: string;
  importance: "critical" | "nice_to_have";
  description: string;
}

interface SkillGapResult {
  target_role: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: MissingSkill[];
  market_insight: string;
}

export async function analyzeSkillGap(params: SkillGapParams): Promise<SkillGapResult> {
  const ai = getAIProvider();

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert career advisor and job market analyst. Given a candidate's current skills and their target role, analyze the skill gap between where they are and where they want to be.

Provide:
1. A match percentage (0-100) based on how well their current skills align with the target role.
2. Which of their current skills are relevant to the target role.
3. Which skills they are missing, with importance level and a brief description of why each matters.
4. A market insight about demand for this role and advice on bridging the gap.

Respond with JSON only in this exact format:
{
  "target_role": "string",
  "match_percentage": number,
  "matching_skills": ["string"],
  "missing_skills": [
    {
      "name": "string",
      "importance": "critical"|"nice_to_have",
      "description": "string (1 sentence explaining why this skill matters for the role)"
    }
  ],
  "market_insight": "string (2-3 sentences about market demand and advice)"
}`,
      },
      {
        role: "user",
        content: `Current skills: ${params.currentSkills.join(", ") || "None listed"}\n\nTarget role: ${params.targetRole}`,
      },
    ],
    model: "standard",
    temperature: 0.3,
    maxTokens: 1500,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as SkillGapResult;
}
