import { getAIProvider } from "../index";
import type { SkillExtraction, ParsedResume } from "../types";

export async function extractSkills(
  parsedCV: ParsedResume
): Promise<SkillExtraction[]> {
  const ai = getAIProvider();

  const context = [
    parsedCV.skills?.length && `Listed skills: ${parsedCV.skills.join(", ")}`,
    parsedCV.experience?.length &&
      `Experience:\n${parsedCV.experience
        .map((e) => `${e.title} at ${e.company}: ${e.description || ""}`)
        .join("\n")}`,
    parsedCV.education?.length &&
      `Education: ${parsedCV.education.map((e) => `${e.degree} in ${e.field_of_study} from ${e.institution}`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `Extract and categorize skills from this resume data. Return a JSON array of objects with:
- "name": skill name
- "category": one of "Technical", "Language", "Framework", "Tool", "Soft Skill", "Domain", "Certification"
- "years_experience": estimated years or null if unknown

Only include skills that are explicitly mentioned or strongly implied. Do not fabricate.
Return JSON array only.`,
      },
      {
        role: "user",
        content: context,
      },
    ],
    model: "fast",
    temperature: 0.2,
    responseFormat: "json",
  });

  const parsed = JSON.parse(response.content);
  return Array.isArray(parsed) ? parsed : parsed.skills || [];
}
