import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateQuiz } from "@/lib/ai/services/quiz-generator";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { skillName } = await request.json();
    if (!skillName) return NextResponse.json({ error: "skillName required" }, { status: 400 });

    const questions = await generateQuiz(skillName);

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        profile_id: user.id,
        skill_name: skillName,
        questions,
        status: "not_started",
        max_score: questions.length,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Return questions without correct answers
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({ assessmentId: data.id, questions: safeQuestions });
  } catch (err) {
    console.error("Assessment generation error:", err);
    return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 });
  }
}
