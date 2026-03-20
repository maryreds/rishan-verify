import { NextResponse } from "next/server";
import { extractSkills } from "@/lib/ai/services/skill-extractor";

export async function POST(request: Request) {
  try {
    const { parsedCV } = await request.json();
    if (!parsedCV) {
      return NextResponse.json({ error: "Missing parsedCV" }, { status: 400 });
    }

    const skills = await extractSkills(parsedCV);
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skill extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract skills" },
      { status: 500 }
    );
  }
}
