import { getAIProvider } from "../index";
import type { PhotoAnalysis } from "../types";

export async function analyzeHeadshot(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<PhotoAnalysis> {
  const ai = getAIProvider();

  const response = await ai.vision({
    prompt: `Analyze this headshot photo for professional quality. Return ONLY valid JSON with this schema:
{
  "quality_score": number (0-100),
  "is_professional": boolean,
  "suggestions": string[] (max 3 actionable suggestions),
  "lighting": "good" | "fair" | "poor",
  "background": "clean" | "busy" | "neutral",
  "face_detected": boolean
}
Evaluate: lighting, background cleanliness, face visibility, professionalism, resolution.
Be constructive in suggestions.`,
    imageBase64,
    imageMimeType: mimeType,
    temperature: 0.2,
    maxTokens: 500,
  });

  const jsonStr = response.content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(jsonStr) as PhotoAnalysis;
}
