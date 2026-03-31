"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, XCircle, Loader2, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface Props {
  assessmentId: string;
  skillName: string;
  questions: Question[];
  isCompleted: boolean;
  existingScore: number | null;
  existingMaxScore: number | null;
}

export default function QuizPlayer({
  assessmentId,
  skillName,
  questions,
  isCompleted,
  existingScore,
  existingMaxScore,
}: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    breakdown: { questionId: string; correct: boolean }[];
    explanations: { id: string; explanation: string }[];
  } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || result || isCompleted) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [started, result, isCompleted]);

  if (isCompleted) {
    const pct =
      existingScore !== null && existingMaxScore !== null
        ? Math.round((existingScore / existingMaxScore) * 100)
        : 0;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{skillName} Assessment</h1>
          <p className="text-sm text-muted-foreground">This assessment has been completed.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-3xl font-bold">{pct}%</p>
            <p className="text-muted-foreground mt-1">
              {existingScore}/{existingMaxScore} correct
            </p>
            <p className="text-sm mt-2">
              {pct >= 80 ? (
                <span className="text-primary font-medium">Passed! Skill verified.</span>
              ) : (
                <span className="text-muted-foreground">Below 80% threshold. You can retake.</span>
              )}
            </p>
            <Button className="mt-6" onClick={() => router.push("/dashboard/assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{skillName} Assessment</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions. Score 80%+ to earn a verified badge.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">
              You&apos;ll have unlimited time, but your duration will be recorded.
            </p>
            <Button
              size="lg"
              onClick={async () => {
                setStarted(true);
                await fetch("/api/ai/assessment/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ assessmentId, action: "start" }),
                }).catch(() => {});
              }}
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{skillName} — Results</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                result.passed ? "bg-primary/10" : "bg-destructive/10"
              }`}
            >
              <span className={`text-3xl font-bold ${result.passed ? "text-primary" : "text-destructive"}`}>
                {result.percentage}%
              </span>
            </div>
            <p className="text-lg font-semibold">
              {result.score}/{result.maxScore} correct
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed in {Math.floor(elapsed / 60)}m {elapsed % 60}s
            </p>
            {result.passed ? (
              <p className="text-primary font-medium mt-3">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Congratulations! Your {skillName} skill is now verified.
              </p>
            ) : (
              <p className="text-muted-foreground mt-3">
                You need 80% to pass. Review the explanations below and try again.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Review */}
        <div className="space-y-3">
          {questions.map((q, i) => {
            const br = result.breakdown.find((b) => b.questionId === q.id);
            const exp = result.explanations.find((e) => e.id === q.id);
            return (
              <Card key={q.id}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-2">
                    {br?.correct ? (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Q{i + 1}: {q.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your answer: {q.options[answers[q.id]] || "—"}
                      </p>
                      {exp && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {exp.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button className="w-full" onClick={() => router.push("/dashboard/assessments")}>
          Back to Assessments
        </Button>
      </div>
    );
  }

  const question = questions[currentIndex];
  const selectedAnswer = answers[question.id];

  async function submitQuiz() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, answers }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast.error("Failed to submit", {
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{skillName}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardContent className="py-6 px-6">
          <p className="text-base font-medium mb-6">{question.question}</p>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() =>
                  setAnswers({ ...answers, [question.id]: i })
                }
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                  selectedAnswer === i
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground"
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          Previous
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button
            disabled={selectedAnswer === undefined}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            disabled={Object.keys(answers).length < questions.length || submitting}
            onClick={submitQuiz}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Assessment"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
