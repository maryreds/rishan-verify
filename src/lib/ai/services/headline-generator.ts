import { getAIProvider } from "../index";

interface HeadlineParams {
  currentHeadline: string;
  skills: string[];
  experience: string;
  targetRole?: string;
}

interface HeadlineVariant {
  headline: string;
  rationale: string;
  tone: "professional" | "creative" | "technical";
}

interface HeadlineResult {
  variants: HeadlineVariant[];
}

export async function generateHeadlines(params: HeadlineParams): Promise<HeadlineResult> {
  const ai = getAIProvider();

  const context = [
    `Current headline: ${params.currentHeadline || "None"}`,
    params.skills.length > 0 ? `Skills: ${params.skills.join(", ")}` : null,
    params.experience ? `Experience summary: ${params.experience}` : null,
    params.targetRole ? `Target role: ${params.targetRole}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert personal branding specialist. Generate exactly 3 headline variants for a candidate's professional profile on a verified candidate marketplace.

Each headline should:
- Be concise (under 80 characters)
- Highlight the candidate's value proposition
- Be optimized for search and recruiter discovery
- Use a different tone: one professional, one creative, one technical

Respond with JSON only in this exact format:
{
  "variants": [
    {
      "headline": "string",
      "rationale": "string (1 sentence explaining the strategy behind this headline)",
      "tone": "professional"|"creative"|"technical"
    }
  ]
}

Always return exactly 3 variants with different tones.`,
      },
      {
        role: "user",
        content: `Generate 3 headline variants based on this profile:\n\n${context}`,
      },
    ],
    model: "standard",
    temperature: 0.7,
    maxTokens: 800,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as HeadlineResult;
}
