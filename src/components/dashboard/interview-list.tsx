"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Loader2,
  Calendar,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InterviewSession {
  id: string;
  target_role: string;
  target_company: string | null;
  score: number | null;
  status: string;
  created_at: string;
}

interface InterviewListClientProps {
  sessions: InterviewSession[];
}

export default function InterviewListClient({
  sessions,
}: InterviewListClientProps) {
  const router = useRouter();

  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [starting, setStarting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleStart() {
    if (!targetRole.trim()) {
      toast.error("Please enter a target role");
      return;
    }

    setStarting(true);

    try {
      const res = await fetch("/api/ai/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: targetRole.trim(),
          targetCompany: targetCompany.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to start interview", {
          description: err.error || "Please try again.",
        });
        setStarting(false);
        return;
      }

      const data = await res.json();
      router.push(`/dashboard/interview/${data.sessionId}`);
    } catch {
      toast.error("Failed to start interview");
      setStarting(false);
    }
  }

  function getScoreColor(score: number | null) {
    if (score === null) return "secondary";
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
          <p className="text-sm text-muted-foreground">
            Practice with AI-powered mock interviews and get instant feedback.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Interview
        </Button>
      </div>

      {/* Start new interview form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Start a Mock Interview</CardTitle>
            <CardDescription>
              Enter the role you are preparing for. The AI interviewer will ask
              5 targeted questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="targetRole"
                className="text-sm font-medium"
              >
                Target Role *
              </label>
              <Input
                id="targetRole"
                placeholder="e.g., Senior Frontend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={starting}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="targetCompany"
                className="text-sm font-medium"
              >
                Target Company (optional)
              </label>
              <Input
                id="targetCompany"
                placeholder="e.g., Google"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                disabled={starting}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={starting}
              >
                Cancel
              </Button>
              <Button onClick={handleStart} disabled={starting}>
                {starting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past sessions */}
      {sessions.length === 0 && !showForm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">No interview sessions yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Start a mock interview to practice for your next opportunity.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() =>
                router.push(`/dashboard/interview/${session.id}`)
              }
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{session.target_role}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {session.target_company && (
                        <span>{session.target_company}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {session.score !== null && (
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {session.score}/100
                      </span>
                    </div>
                  )}
                  <Badge variant={getScoreColor(session.score)}>
                    {session.status === "completed"
                      ? "Completed"
                      : "In Progress"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
