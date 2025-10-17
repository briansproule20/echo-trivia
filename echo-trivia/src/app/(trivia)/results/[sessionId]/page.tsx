"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBanner } from "@/components/trivia/ScoreBanner";
import { storage } from "@/lib/storage";
import { CheckCircle2, XCircle, RotateCcw, Home, Share2 } from "lucide-react";
import type { Session } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const loadedSession = await storage.getSession(sessionId);
      if (loadedSession) {
        setSession(loadedSession);
      } else {
        router.push("/");
      }
    };
    loadSession();
  }, [sessionId]);

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const score = session.submissions.filter((s) => s.correct).length;
  const totalTime = session.endedAt && session.startedAt
    ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
    : undefined;

  const handleRetry = () => {
    // For daily quizzes, redirect to practice with the same category
    if (session.quiz.seeded) {
      router.push(`/practice?category=${encodeURIComponent(session.quiz.category)}`);
      return;
    }

    // For practice quizzes, try to reconstruct the original settings
    const numQuestions = session.quiz.questions.length;

    // Infer difficulty from questions
    const difficulties = session.quiz.questions.map(q => q.difficulty);
    const uniqueDifficulties = [...new Set(difficulties)];
    const difficulty = uniqueDifficulties.length > 1 ? "mixed" : difficulties[0];

    // Infer question type from questions
    const types = session.quiz.questions.map(q => q.type);
    const uniqueTypes = [...new Set(types)];
    const type = uniqueTypes.length > 1 ? "mixed" : types[0];

    // Build URL with all settings
    const params = new URLSearchParams({
      category: session.quiz.category,
      numQuestions: numQuestions.toString(),
      difficulty,
      type,
    });

    router.push(`/practice?${params.toString()}`);
  };

  const handleShare = async () => {
    const percentage = Math.round((score / session.quiz.questions.length) * 100);

    // Generate emoji grid showing correct/incorrect answers
    const emojiGrid = session.quiz.questions
      .map((q, idx) => {
        const submission = session.submissions.find(s => s.questionId === q.id);
        return submission?.correct ? "🟢" : "🔴";
      })
      .join("");

    // Extract date from quiz description if available (format: "YYYY-MM-DD - A new challenge...")
    const dateMatch = session.quiz.description?.match(/^(\d{4}-\d{2}-\d{2})/);
    const dateString = dateMatch ? dateMatch[1] : "today";

    const text = `I just completed ${dateString === "today" ? "today's" : dateString + "'s"} Daily Challenge on Trivia Wizard! 🧙‍♂️

Category: ${session.quiz.category}
${emojiGrid}
Score: ${score}/${session.quiz.questions.length} (${percentage}%)

Think you can beat me? Play at:
<https://trivia-wizard-omega.vercel.app>`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Create a temporary textarea to copy
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Score Banner */}
          <ScoreBanner
            score={score}
            totalQuestions={session.quiz.questions.length}
            timeElapsed={totalTime}
          />

          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>{session.quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{session.quiz.category}</Badge>
                <Badge variant="outline">
                  {session.quiz.questions.length} questions
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card>
            <CardHeader>
              <CardTitle>Review Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.quiz.questions.map((question, idx) => {
                const submission = session.submissions.find(
                  (s) => s.questionId === question.id
                );
                const isCorrect = submission?.correct || false;

                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-red-500 bg-red-50 dark:bg-red-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            {idx + 1}. {question.prompt}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Response:</span>{" "}
                              {submission?.response || "No answer"}
                            </div>
                            <div>
                              <span className="font-medium">Correct Answer:</span>{" "}
                              {question.answer}
                            </div>
                            {question.explanation && (
                              <div className="mt-2 text-foreground">
                                {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className={`grid grid-cols-1 ${session.quiz.seeded ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
            <Button onClick={handleRetry} size="lg" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice Similar
            </Button>
            {session.quiz.seeded && (
              <Button onClick={handleShare} size="lg" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Score
              </Button>
            )}
            <Button onClick={() => router.push("/")} size="lg">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

