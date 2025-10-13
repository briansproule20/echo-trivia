"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBanner } from "@/components/trivia/ScoreBanner";
import { storage } from "@/lib/storage";
import { getTodayString } from "@/lib/quiz-utils";
import { generateDailyShareText, copyToClipboard } from "@/lib/share-utils";
import { CheckCircle2, XCircle, RotateCcw, Home, Share2, Copy, Check } from "lucide-react";
import type { Session } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);

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
    router.push(`/practice?category=${encodeURIComponent(session.quiz.category)}`);
  };

  const handleShare = async () => {
    const isDailyQuiz = session.quiz.seeded === true;
    
    if (isDailyQuiz) {
      // Generate daily quiz share text with emoji grid
      const shareText = generateDailyShareText(
        score,
        session.quiz.questions.length,
        getTodayString()
      );
      
      const success = await copyToClipboard(shareText);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // Regular quiz share
      const percentage = Math.round((score / session.quiz.questions.length) * 100);
      const text = `I scored ${percentage}% on "${session.quiz.title}" in Trivia Wizard!\n\nPlay: https://trivia-wizard-omega.vercel.app/`;
      
      if (navigator.share) {
        try {
          await navigator.share({ text });
        } catch (err) {
          const success = await copyToClipboard(text);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }
      } else {
        const success = await copyToClipboard(text);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
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

          {/* Share Card for Daily Quiz */}
          {session.quiz.seeded && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Share Your Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-background/80 border font-mono text-sm whitespace-pre-line">
                  {generateDailyShareText(score, session.quiz.questions.length, getTodayString())}
                </div>
                <Button onClick={handleShare} size="lg" className="w-full" variant={copied ? "default" : "outline"}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Score Card
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button onClick={handleRetry} size="lg" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              {session.quiz.seeded ? "Try Tomorrow" : "Practice Similar"}
            </Button>
            {!session.quiz.seeded && (
              <Button onClick={handleShare} size="lg" variant="outline">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Score
                  </>
                )}
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

