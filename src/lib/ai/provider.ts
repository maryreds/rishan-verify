import type { ChatParams, ChatResponse, VisionParams } from "./types";

export interface AIProvider {
  chat(params: ChatParams): Promise<ChatResponse>;
  vision(params: VisionParams): Promise<ChatResponse>;
}
