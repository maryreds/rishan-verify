import { getAIProvider } from "@/lib/ai";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export async function generateQuiz(skillName: string): Promise<QuizQuestion[]> {
  const ai = getAIProvider();

  const { content } = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are a professional skill assessment creator. Generate exactly 10 multiple-choice questions to test proficiency in the given skill. Each question should have 4 options with exactly one correct answer. Questions should range from intermediate to advanced difficulty. Return JSON array.`,
      },
      {
        role: "user",
        content: `Generate 10 assessment questions for: ${skillName}

Return JSON: { "questions": [{ "id": "q1", "question": "...", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Brief explanation of correct answer" }] }`,
      },
    ],
    model: "standard",
    temperature: 0.4,
    maxTokens: 4096,
    responseFormat: "json",
  });

  const parsed = JSON.parse(content);
  return parsed.questions;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, number>
): { score: number; maxScore: number; percentage: number; passed: boolean; breakdown: { questionId: string; correct: boolean }[] } {
  const breakdown = questions.map((q) => ({
    questionId: q.id,
    correct: answers[q.id] === q.correct_index,
  }));

  const score = breakdown.filter((b) => b.correct).length;
  const maxScore = questions.length;
  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= 80,
    breakdown,
  };
}
