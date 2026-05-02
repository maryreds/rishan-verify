import { NextResponse } from "next/server";
import { analyzeHeadshot } from "@/lib/ai/services/headshot-analyzer";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    const analysis = await analyzeHeadshot(imageBase64, mimeType || "image/jpeg");
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Photo analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze photo" },
      { status: 500 }
    );
  }
}
