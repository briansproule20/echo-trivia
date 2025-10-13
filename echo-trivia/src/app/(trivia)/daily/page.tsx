"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, RefreshCw, Sparkles } from "lucide-react";
import { storage } from "@/lib/storage";
import { getTodayString, generateId } from "@/lib/quiz-utils";
import { usePlayStore } from "@/lib/store";
import type { Quiz, Session } from "@/lib/types";

export default function DailyQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSession } = usePlayStore();

  const loadDailyQuiz = async (forceNew = false) => {
    setLoading(true);
    setError(null);

    try {
      const today = getTodayString();

      // Check cache if not forcing new
      if (!forceNew) {
        const cached = storage.getDailyQuiz(today);
        if (cached) {
          setQuiz(cached);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await fetch(`/api/trivia/daily?date=${today}`);
      if (!response.ok) {
        throw new Error("Failed to load daily quiz");
      }

      const dailyQuiz = await response.json();
      setQuiz(dailyQuiz);
      storage.saveDailyQuiz(today, dailyQuiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load daily quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyQuiz();
  }, []);

  const handleStartQuiz = () => {
    if (!quiz) return;

    const session: Session = {
      id: generateId(),
      quiz,
      startedAt: new Date().toISOString(),
      submissions: [],
    };

    setSession(session);
    storage.saveSession(session);
    router.push(`/play/${session.id}`);
  };

  const getTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src="/trivia-wizard-logo.png" 
                alt="Trivia Wizard" 
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Daily Quiz
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getTodayString()} - One quiz per day
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Quiz</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => loadDailyQuiz()} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quiz Card */}
          {quiz && !loading && (
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl">{quiz.title}</CardTitle>
                    <CardDescription className="text-base">{quiz.description}</CardDescription>
                  </div>
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quiz Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-semibold">{quiz.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                    <div className="font-semibold">{quiz.questions.length}</div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-center p-4 border rounded-lg bg-primary/5">
                  <div className="text-sm text-muted-foreground mb-1">Next quiz in</div>
                  <div className="text-2xl font-bold text-primary">{getTimeUntilTomorrow()}</div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button onClick={handleStartQuiz} size="lg" className="w-full">
                    Start Today's Quiz
                  </Button>
                  <Button
                    onClick={() => loadDailyQuiz(true)}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

