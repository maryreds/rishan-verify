"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  sort_order: number;
}

interface QuestionnaireFormProps {
  token: string;
  candidateName: string;
  refereeName: string;
  questions: Question[];
}

export function QuestionnaireForm({
  token,
  candidateName,
  refereeName,
  questions,
}: QuestionnaireFormProps) {
  const [responses, setResponses] = useState<Record<string, string | number>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setResponse(questionId: string, value: string | number) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check that all questions are answered
    const unanswered = questions.filter((q) => !responses[q.id]);
    if (unanswered.length > 0) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/references/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, responses }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      toast.error("Failed to submit reference", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Thank You!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your reference for {candidateName} has been submitted successfully.
            Your feedback will help them in their career journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <div className="text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
              Vouch Reference
            </span>
            <CardTitle className="text-2xl mt-2">
              Reference for {candidateName}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Hi {refereeName}, please take a few minutes to complete this
              reference questionnaire.
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <Label className="text-base font-medium mb-3 block">
                {question.question_text}
              </Label>

              {question.question_type === "rating" ? (
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setResponse(question.id, star)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          (responses[question.id] as number) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder="Type your response here..."
                  rows={4}
                  value={(responses[question.id] as string) || ""}
                  onChange={(e) => setResponse(question.id, e.target.value)}
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Reference"
          )}
        </Button>
      </div>
    </form>
  );
}
