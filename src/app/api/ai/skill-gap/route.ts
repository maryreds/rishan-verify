import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { analyzeSkillGap } from "@/lib/ai/services/skill-gap-analyzer";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetRole } = await request.json();

    if (!targetRole) {
      return NextResponse.json({ error: "Missing targetRole" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("skills")
      .eq("id", user.id)
      .single();

    const { data: dbSkills } = await supabase
      .from("skills")
      .select("name")
      .eq("profile_id", user.id);

    const currentSkills = [
      ...(profile?.skills || []),
      ...(dbSkills?.map((s: { name: string }) => s.name) || []),
    ];

    const result = await analyzeSkillGap({ currentSkills, targetRole });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gap" },
      { status: 500 }
    );
  }
}
