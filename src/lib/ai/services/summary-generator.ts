import { getAIProvider } from "../index";

interface ProfileData {
  full_name?: string | null;
  headline?: string | null;
  skills?: string[];
  experience?: {
    title: string;
    company: string;
    description?: string | null;
  }[];
  education?: {
    institution: string;
    degree?: string | null;
    field_of_study?: string | null;
  }[];
}

export async function generateSummary(profile: ProfileData): Promise<string> {
  const ai = getAIProvider();

  const context = [
    profile.full_name && `Name: ${profile.full_name}`,
    profile.headline && `Title: ${profile.headline}`,
    profile.skills?.length && `Skills: ${profile.skills.join(", ")}`,
    profile.experience?.length &&
      `Experience:\n${profile.experience
        .map((e) => `- ${e.title} at ${e.company}${e.description ? `: ${e.description}` : ""}`)
        .join("\n")}`,
    profile.education?.length &&
      `Education:\n${profile.education
        .map((e) => `- ${e.degree || "Degree"} ${e.field_of_study ? `in ${e.field_of_study}` : ""} from ${e.institution}`)
        .join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content:
          "You are a professional resume writer. Write a concise, compelling 2-3 sentence professional summary based on the candidate's profile data. Write in third person. Focus on key strengths, experience highlights, and value proposition. Do not fabricate information.",
      },
      {
        role: "user",
        content: context,
      },
    ],
    model: "fast",
    temperature: 0.5,
    maxTokens: 300,
  });

  return response.content.trim();
}
