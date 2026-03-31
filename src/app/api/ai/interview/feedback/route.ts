import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateOverallFeedback } from "@/lib/ai/services/interview-coach";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const { data: session, error: fetchError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const messages = (session.messages as Array<Record<string, unknown>>) || [];

    // Build conversation for feedback
    const conversationMessages = messages
      .filter((m) => m.role === "interviewer" || m.role === "candidate")
      .map((m) => ({
        role: m.role as string,
        content: m.content as string,
      }));

    const feedback = await generateOverallFeedback({
      targetRole: session.target_role,
      messages: conversationMessages,
    });

    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        feedback,
        score: feedback.overall_score,
        status: "completed",
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to update session with feedback:", updateError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Interview feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
