import type { AIProvider } from "./provider";
import { OpenAIProvider } from "./openai";

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (providerInstance) return providerInstance;

  const provider = process.env.AI_PROVIDER || "openai";

  switch (provider) {
    case "openai":
      providerInstance = new OpenAIProvider();
      break;
    default:
      providerInstance = new OpenAIProvider();
  }

  return providerInstance;
}

export type { AIProvider } from "./provider";
export type * from "./types";
