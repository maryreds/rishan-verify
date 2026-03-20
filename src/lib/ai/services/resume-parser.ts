import { getAIProvider } from "../index";
import type { ParsedResume } from "../types";

const PARSE_PROMPT = `You are a resume parsing assistant. Extract structured data from this resume. Return ONLY valid JSON with exactly this schema:
{
  "full_name": string | null,
  "phone": string | null,
  "location": string | null,
  "headline": string | null,
  "summary": string | null,
  "skills": string[],
  "domains": string[],
  "experience": [{ "company": string, "title": string, "start_date": string | null, "end_date": string | null, "is_current": boolean, "description": string | null }],
  "education": [{ "institution": string, "degree": string | null, "field_of_study": string | null, "start_date": string | null, "end_date": string | null }]
}
Rules:
- "headline" = short professional title like "Senior Software Engineer"
- "domains" = broad professional domains (e.g. "Finance", "Healthcare")
- "skills" = specific technical or soft skills mentioned
- If a field is not found, use null for scalars or [] for arrays
- Do NOT invent data not in the resume`;

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const ai = getAIProvider();

  const response = await ai.chat({
    messages: [
      {
        role: "user",
        content: `${PARSE_PROMPT}\n\nResume text:\n${resumeText.slice(0, 30000)}`,
      },
    ],
    model: "fast",
    temperature: 0.1,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as ParsedResume;
}

export async function parseResumeFromImage(
  base64: string,
  mimeType: string
): Promise<ParsedResume> {
  const ai = getAIProvider();

  const response = await ai.vision({
    prompt: PARSE_PROMPT,
    imageBase64: base64,
    imageMimeType: mimeType,
    temperature: 0.1,
  });

  const jsonStr = response.content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(jsonStr) as ParsedResume;
}
