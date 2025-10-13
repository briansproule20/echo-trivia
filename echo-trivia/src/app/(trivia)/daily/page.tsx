"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { storage } from "@/lib/storage";
import { getTodayString, generateId } from "@/lib/quiz-utils";
import { usePlayStore } from "@/lib/store";
import type { Quiz, Session } from "@/lib/types";
import { useEcho } from "@merit-systems/echo-react-sdk";

interface DailyChallenge {
  date: string;
  category: string;
  title: string;
  description: string;
  numQuestions: number;
  difficulty: string;
  type: string;
}

export default function DailyQuizPage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { setSession } = usePlayStore();
  const { user, signIn, isLoading: echoLoading } = useEcho();

  const loadDailyChallenge = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = getTodayString();
      const response = await fetch(`/api/trivia/daily?date=${today}`);
      if (!response.ok) {
        throw new Error("Failed to load daily challenge");
      }

      const dailyChallenge = await response.json();
      setChallenge(dailyChallenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load daily challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const handleStartQuiz = async () => {
    if (!challenge || generating) return;

    // Check if user is signed in
    if (!user) {
      setError("Please sign in to start the daily challenge");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Generate quiz based on daily challenge (this charges the user)
      const response = await fetch("/api/trivia/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            category: challenge.category,
            numQuestions: challenge.numQuestions,
            difficulty: challenge.difficulty,
            type: challenge.type,
            style: "classic",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const quiz: Quiz = await response.json();
      
      // Mark as daily quiz
      quiz.title = challenge.title;
      quiz.description = challenge.description;
      quiz.seeded = true;

      const session: Session = {
        id: generateId(),
        quiz,
        startedAt: new Date().toISOString(),
        submissions: [],
      };

      setSession(session);
      await storage.saveSession(session);
      router.push(`/play/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz. Please try again.");
      setGenerating(false);
    }
  };

  const handleSignIn = () => {
    setIsSigningIn(true);
    signIn();
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-8">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight pb-1">
              Daily Challenge
            </h1>
            <p className="text-xl text-muted-foreground">
              {getTodayString()} - One challenge per day, infinite attempts
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
          {error && !generating && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={loadDailyChallenge} className="w-full">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Challenge Card */}
          {challenge && !loading && (
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <CardTitle className="text-2xl sm:text-3xl">{challenge.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base line-clamp-2">{challenge.description}</CardDescription>
                  </div>
                  <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Sign-in Prompt */}
                {!user && !echoLoading && (
                  <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <Lock className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Sign In Required</h3>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Connect your Echo account to play today's challenge
                    </p>
                    <Button
                      onClick={handleSignIn}
                      disabled={isSigningIn}
                      className="w-full"
                      size="lg"
                    >
                      {isSigningIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Sign In with Echo
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Challenge Info */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Category</div>
                    <div className="font-semibold text-sm sm:text-base truncate">{challenge.category}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Questions</div>
                    <div className="font-semibold text-sm sm:text-base">{challenge.numQuestions}</div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-center p-3 sm:p-4 border rounded-lg bg-muted/50">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">Next challenge in</div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">{getTimeUntilTomorrow()}</div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStartQuiz}
                  size="lg"
                  className="w-full"
                  disabled={generating || !user}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Your Quiz...
                    </>
                  ) : !user ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In to Start
                    </>
                  ) : (
                    "Start Challenge"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
