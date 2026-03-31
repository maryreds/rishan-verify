import { getAIProvider } from "../index";

interface EnhanceDescriptionParams {
  title: string;
  url?: string;
  description: string;
}

export async function enhanceDescription(params: EnhanceDescriptionParams): Promise<string> {
  const ai = getAIProvider();

  const context = [
    `Project title: ${params.title}`,
    params.url && `URL: ${params.url}`,
    `Original description: ${params.description}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content:
          "You are a professional portfolio copywriter. Rewrite the given project description to be more compelling, concise, and professional. Highlight impact, technologies used, and outcomes where possible. Keep it to 2-3 sentences. Return only the enhanced description text, nothing else. Do not fabricate information — only enhance what is provided.",
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
