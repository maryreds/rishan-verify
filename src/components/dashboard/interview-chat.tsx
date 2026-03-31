"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  MessageSquare,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Message {
  role: string;
  content: string;
  category?: string;
  timestamp?: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface OverallFeedback {
  overall_score: number;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
}

interface InterviewSession {
  id: string;
  target_role: string;
  target_company: string | null;
  messages: Message[];
  feedback: OverallFeedback | null;
  score: number | null;
  status: string;
}

interface InterviewChatProps {
  session: InterviewSession;
}

export default function InterviewChat({ session }: InterviewChatProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>(session.messages || []);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<OverallFeedback | null>(
    session.feedback || null
  );
  const [isComplete, setIsComplete] = useState(session.status === "completed");
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(
    null
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, lastEvaluation]);

  // Determine if there's a pending question (last interviewer message without a following candidate message)
  const hasPendingQuestion = (() => {
    const lastInterviewerIdx = messages.findLastIndex(
      (m) => m.role === "interviewer"
    );
    if (lastInterviewerIdx === -1) return false;
    const hasAnswer = messages
      .slice(lastInterviewerIdx + 1)
      .some((m) => m.role === "candidate");
    return !hasAnswer;
  })();

  const questionCount = messages.filter(
    (m) => m.role === "interviewer"
  ).length;
  const canEndEarly = questionCount >= 2 && !isComplete && !feedback;

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      toast.error("Please type your answer");
      return;
    }

    setSubmitting(true);
    setLastEvaluation(null);

    try {
      const res = await fetch("/api/ai/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          answer: answer.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to submit answer", {
          description: err.error || "Please try again.",
        });
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      // Add candidate message
      const newMessages = [
        ...messages,
        {
          role: "candidate",
          content: answer.trim(),
          timestamp: new Date().toISOString(),
        },
        {
          role: "evaluation",
          content: JSON.stringify(data.evaluation),
          timestamp: new Date().toISOString(),
        },
      ];

      setLastEvaluation(data.evaluation);

      if (data.nextQuestion) {
        newMessages.push({
          role: "interviewer",
          content: data.nextQuestion,
          category: data.nextCategory,
          timestamp: new Date().toISOString(),
        });
      }

      setMessages(newMessages);
      setAnswer("");
      setIsComplete(data.isComplete);

      if (data.isComplete) {
        toast.info(
          "Interview complete! Click 'Get Feedback' for your overall assessment."
        );
      }
    } catch {
      toast.error("Failed to submit answer");
    }

    setSubmitting(false);
  }

  async function handleGetFeedback() {
    setLoadingFeedback(true);

    try {
      const res = await fetch("/api/ai/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to get feedback", {
          description: err.error || "Please try again.",
        });
        setLoadingFeedback(false);
        return;
      }

      const data = await res.json();
      setFeedback(data);
      setIsComplete(true);
      toast.success("Feedback generated!");
    } catch {
      toast.error("Failed to get feedback");
    }

    setLoadingFeedback(false);
  }

  function getScoreColor(score: number) {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  }

  function getOverallScoreColor(score: number) {
    if (score >= 80) return "text-green-600 border-green-500";
    if (score >= 60) return "text-yellow-600 border-yellow-500";
    return "text-red-600 border-red-500";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/interview")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {session.target_role} Interview
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.target_company
              ? `Practicing for ${session.target_company}`
              : "Mock interview practice"}
            {" "}
            &middot; Question {questionCount} of 5
          </p>
        </div>
      </div>

      {/* Overall Feedback */}
      {feedback && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Interview Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score ring */}
            <div className="flex items-center gap-6">
              <div
                className={`flex items-center justify-center h-24 w-24 rounded-full border-4 ${getOverallScoreColor(feedback.overall_score)}`}
              >
                <div className="text-center">
                  <span className="text-2xl font-bold">
                    {feedback.overall_score}
                  </span>
                  <span className="text-xs block text-muted-foreground">
                    /100
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex-1">
                {feedback.summary}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-2 rounded"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for improvement */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-1">
                  {feedback.areas_for_improvement.map((a, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat messages */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={scrollRef}
            className="max-h-[600px] overflow-y-auto p-6 space-y-4"
          >
            {messages
              .filter((m) => m.role !== "evaluation")
              .map((msg, i) => {
                if (msg.role === "interviewer") {
                  return (
                    <div key={i} className="flex gap-3 max-w-[85%]">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary">
                            Interviewer
                          </span>
                          {msg.category && (
                            <Badge variant="outline" className="text-[10px] py-0">
                              {msg.category}
                            </Badge>
                          )}
                        </div>
                        <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (msg.role === "candidate") {
                  // Find the evaluation that follows this candidate message
                  const evalIdx = messages.findIndex(
                    (m, j) =>
                      j > i && m.role === "evaluation"
                  );
                  // We need to find the actual index in the original messages array
                  const originalIdx = messages.indexOf(msg);
                  const evalMsg = messages.find(
                    (m, j) =>
                      j > originalIdx && m.role === "evaluation"
                  );
                  let evaluation: Evaluation | null = null;
                  if (evalMsg) {
                    try {
                      evaluation = JSON.parse(evalMsg.content);
                    } catch {
                      // ignore parse errors
                    }
                  }

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-xs font-medium">You</span>
                          <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none">
                            <p className="text-sm text-left">{msg.content}</p>
                          </div>
                        </div>
                      </div>

                      {/* Inline evaluation */}
                      {evaluation && (
                        <div className="ml-11 mr-11 bg-muted/50 border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              Answer Evaluation
                            </span>
                            <span
                              className={`text-sm font-bold ${getScoreColor(evaluation.score)}`}
                            >
                              {evaluation.score}/10
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {evaluation.feedback}
                          </p>
                          {evaluation.strengths.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {evaluation.strengths.map((s, si) => (
                                <Badge
                                  key={si}
                                  variant="outline"
                                  className="text-[10px] bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {evaluation.improvements.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {evaluation.improvements.map((im, ii) => (
                                <Badge
                                  key={ii}
                                  variant="outline"
                                  className="text-[10px] bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                >
                                  {im}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })}

            {submitting && (
              <div className="flex items-center gap-2 text-muted-foreground ml-11">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is evaluating your answer...</span>
              </div>
            )}
          </div>

          {/* Answer input */}
          {hasPendingQuestion && !isComplete && !feedback && (
            <div className="border-t p-4 space-y-3">
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
                rows={4}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmitAnswer();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Press Cmd+Enter to submit
                </span>
                <div className="flex gap-2">
                  {canEndEarly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGetFeedback}
                      disabled={submitting || loadingFeedback}
                    >
                      End Interview
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Get feedback button */}
          {isComplete && !feedback && (
            <div className="border-t p-4 flex justify-center">
              <Button onClick={handleGetFeedback} disabled={loadingFeedback}>
                {loadingFeedback ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Feedback...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Get Overall Feedback
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Completed with feedback */}
          {feedback && (
            <div className="border-t p-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/interview")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Interview List
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
