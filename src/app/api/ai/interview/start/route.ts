import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateInterviewQuestion } from "@/lib/ai/services/interview-coach";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const { targetRole, targetCompany } = await request.json();

    if (!targetRole) {
      return NextResponse.json(
        { error: "Missing targetRole" },
        { status: 400 }
      );
    }

    const { question, category } = await generateInterviewQuestion({
      targetRole,
      targetCompany,
      previousMessages: [],
    });

    const messages = [
      {
        role: "interviewer",
        content: question,
        category,
        timestamp: new Date().toISOString(),
      },
    ];

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({
        profile_id: profile.id,
        target_role: targetRole,
        target_company: targetCompany || null,
        messages,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create interview session:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      question,
      category,
    });
  } catch (error) {
    console.error("Interview start error:", error);
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    );
  }
}
