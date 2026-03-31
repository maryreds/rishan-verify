"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ShieldCheck, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Skill {
  name: string;
  verified: boolean;
  category: string | null;
}

interface Assessment {
  id: string;
  skill_name: string;
  score: number | null;
  max_score: number | null;
  status: string;
  completed_at: string | null;
}

interface Props {
  skills: Skill[];
  assessments: Assessment[];
}

export default function AssessmentListClient({ skills, assessments }: Props) {
  const router = useRouter();
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const completedMap = new Map<string, Assessment>();
  for (const a of assessments) {
    if (a.status === "completed" && !completedMap.has(a.skill_name)) {
      completedMap.set(a.skill_name, a);
    }
  }

  async function startAssessment(skillName: string) {
    setGeneratingFor(skillName);
    try {
      const res = await fetch("/api/ai/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate");
      }

      const { assessmentId } = await res.json();
      router.push(`/dashboard/assessments/${assessmentId}`);
    } catch (err) {
      toast.error("Failed to generate assessment", {
        description: err instanceof Error ? err.message : "Try again later",
      });
    } finally {
      setGeneratingFor(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skill Assessments</h1>
        <p className="text-sm text-muted-foreground">
          Take AI-generated quizzes to verify your skills. Score 80%+ to earn a verified badge.
        </p>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Add skills to your profile first, then come back to verify them.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/profile")}
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {skills.map((skill) => {
            const completed = completedMap.get(skill.name);
            const passed = completed && completed.score !== null && completed.max_score !== null
              ? completed.score >= completed.max_score * 0.8
              : false;
            const isGenerating = generatingFor === skill.name;

            return (
              <Card key={skill.name}>
                <CardContent className="py-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        passed
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {passed ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {skill.name}
                        {passed && (
                          <Badge variant="default" className="text-[10px] py-0">
                            Verified
                          </Badge>
                        )}
                      </p>
                      {skill.category && (
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                      )}
                      {completed && (
                        <p className="text-xs text-muted-foreground">
                          Score: {completed.score}/{completed.max_score} (
                          {Math.round(
                            ((completed.score || 0) / (completed.max_score || 1)) * 100
                          )}
                          %)
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={passed ? "outline" : "default"}
                    onClick={() => startAssessment(skill.name)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" />{" "}
                        {passed ? "Retake" : completed ? "Retry" : "Take Quiz"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
