import { NextResponse } from "next/server";
import { enhanceDescription } from "@/lib/ai/services/portfolio-summarizer";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { title, url, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const enhanced = await enhanceDescription({ title, url, description });
    return NextResponse.json({ description: enhanced });
  } catch (error) {
    console.error("Portfolio enhance error:", error);
    return NextResponse.json(
      { error: "Failed to enhance description" },
      { status: 500 }
    );
  }
}
