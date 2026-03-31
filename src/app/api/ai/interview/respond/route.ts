import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import {
  evaluateAnswer,
  generateInterviewQuestion,
} from "@/lib/ai/services/interview-coach";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, answer } = await request.json();

    if (!sessionId || !answer) {
      return NextResponse.json(
        { error: "Missing sessionId or answer" },
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

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Session already completed" },
        { status: 400 }
      );
    }

    const messages = (session.messages as Array<Record<string, unknown>>) || [];

    // Find the last interviewer question
    const lastQuestion = [...messages]
      .reverse()
      .find((m) => m.role === "interviewer");

    if (!lastQuestion) {
      return NextResponse.json(
        { error: "No question to answer" },
        { status: 400 }
      );
    }

    // Evaluate the answer
    const evaluation = await evaluateAnswer({
      question: lastQuestion.content as string,
      answer,
      targetRole: session.target_role,
    });

    // Add the candidate's answer and evaluation to messages
    messages.push({
      role: "candidate",
      content: answer,
      timestamp: new Date().toISOString(),
    });

    messages.push({
      role: "evaluation",
      content: JSON.stringify(evaluation),
      timestamp: new Date().toISOString(),
    });

    // Count how many questions have been asked
    const questionCount = messages.filter(
      (m) => m.role === "interviewer"
    ).length;
    const isComplete = questionCount >= 5;

    let nextQuestion = null;
    let nextCategory = null;

    if (!isComplete) {
      // Build previous messages for context
      const previousMessages = messages
        .filter((m) => m.role === "interviewer" || m.role === "candidate")
        .map((m) => ({
          role: m.role as string,
          content: m.content as string,
        }));

      const result = await generateInterviewQuestion({
        targetRole: session.target_role,
        targetCompany: session.target_company || undefined,
        previousMessages,
      });

      nextQuestion = result.question;
      nextCategory = result.category;

      messages.push({
        role: "interviewer",
        content: result.question,
        category: result.category,
        timestamp: new Date().toISOString(),
      });
    }

    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({ messages })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to update session:", updateError);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluation,
      nextQuestion,
      nextCategory,
      isComplete,
    });
  } catch (error) {
    console.error("Interview respond error:", error);
    return NextResponse.json(
      { error: "Failed to process response" },
      { status: 500 }
    );
  }
}
