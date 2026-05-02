import { NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/services/summary-generator";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const summary = await generateSummary(body);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
