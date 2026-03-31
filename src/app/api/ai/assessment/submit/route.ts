import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { scoreQuiz } from "@/lib/ai/services/quiz-generator";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { assessmentId, answers } = await request.json();
    if (!assessmentId || !answers)
      return NextResponse.json({ error: "assessmentId and answers required" }, { status: 400 });

    // Fetch the assessment
    const { data: assessment, error: fetchError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("profile_id", user.id)
      .single();

    if (fetchError || !assessment)
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    if (assessment.status === "completed")
      return NextResponse.json({ error: "Assessment already completed" }, { status: 400 });

    // Score the quiz
    const result = scoreQuiz(assessment.questions, answers);

    // Update assessment
    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        answers,
        score: result.score,
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_seconds: assessment.started_at
          ? Math.round(
              (Date.now() - new Date(assessment.started_at).getTime()) / 1000
            )
          : null,
      })
      .eq("id", assessmentId);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // If passed, mark the skill as verified
    if (result.passed) {
      await supabase
        .from("skills")
        .update({ verified: true })
        .eq("profile_id", user.id)
        .eq("name", assessment.skill_name);
    }

    // Recalculate vouch score
    await fetch(new URL("/api/profile/vouch-score", request.url).toString(), {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      passed: result.passed,
      breakdown: result.breakdown,
      explanations: assessment.questions.map(
        (q: { id: string; explanation: string }) => ({
          id: q.id,
          explanation: q.explanation,
        })
      ),
    });
  } catch (err) {
    console.error("Assessment submit error:", err);
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
  }
}
