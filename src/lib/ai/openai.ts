import OpenAI from "openai";
import type { AIProvider } from "./provider";
import type { ChatParams, ChatResponse, VisionParams } from "./types";

const MODEL_MAP = {
  fast: "gpt-4o-mini",
  standard: "gpt-4o",
  vision: "gpt-4o",
} as const;

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    const model = MODEL_MAP[params.model || "fast"];

    const response = await this.client.chat.completions.create({
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 4096,
      ...(params.responseFormat === "json" && {
        response_format: { type: "json_object" },
      }),
    });

    return {
      content: response.choices[0]?.message?.content || "",
    };
  }

  async vision(params: VisionParams): Promise<ChatResponse> {
    const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart = params.imageUrl
      ? { type: "image_url", image_url: { url: params.imageUrl } }
      : {
          type: "image_url",
          image_url: {
            url: `data:${params.imageMimeType || "image/jpeg"};base64,${params.imageBase64}`,
          },
        };

    const response = await this.client.chat.completions.create({
      model: MODEL_MAP.vision,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: params.prompt },
            imageContent,
          ],
        },
      ],
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
    };
  }
}
