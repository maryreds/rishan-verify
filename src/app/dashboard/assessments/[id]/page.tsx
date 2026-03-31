import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import QuizPlayer from "@/components/dashboard/quiz-player";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!assessment) redirect("/dashboard/assessments");

  // Strip correct answers for client
  const safeQuestions = (assessment.questions || []).map(
    (q: { id: string; question: string; options: string[] }) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    })
  );

  return (
    <QuizPlayer
      assessmentId={assessment.id}
      skillName={assessment.skill_name}
      questions={safeQuestions}
      isCompleted={assessment.status === "completed"}
      existingScore={assessment.score}
      existingMaxScore={assessment.max_score}
    />
  );
}
