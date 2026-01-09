"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Loader2, Lock, ChevronDown, Calendar, CalendarDays, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { getTodayString, getTodayDateParts, getOrdinalSuffix, generateId } from "@/lib/quiz-utils";
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dailyStats, setDailyStats] = useState<Record<string, { avg: number; category: string } | null>>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [tomorrowChallenge, setTomorrowChallenge] = useState<DailyChallenge | null>(null);
  const { setSession } = usePlayStore();
  const { user, signIn, isLoading: echoLoading } = useEcho();

  // Generate last 7 daily challenge dates
  const getPastChallengeDates = () => {
    const dates: Array<{ date: string; displayDate: string }> = [];
    const today = new Date();
    const estToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    for (let i = 1; i <= 7; i++) {
      const date = new Date(estToday);
      date.setDate(date.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      // Format display date
      const displayDate = date.toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      dates.push({ date: dateString, displayDate });
    }

    return dates;
  };

  // Fetch average scores and categories for past daily challenges from DB
  const loadDailyStats = async () => {
    setStatsLoading(true);
    try {
      const pastDates = getPastChallengeDates();
      const dates = pastDates.map((d) => d.date).join(",");

      const response = await fetch(`/api/daily-stats?dates=${dates}`);
      if (!response.ok) {
        console.error("Failed to load daily stats");
        return;
      }

      const stats = await response.json();
      setDailyStats(stats);
    } catch (err) {
      console.error("Error loading daily stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

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

  const loadTomorrowChallenge = async () => {
    try {
      // Calculate tomorrow's date
      const now = new Date();
      const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const tomorrow = new Date(estNow);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowDate = `${year}-${month}-${day}`;

      const response = await fetch(`/api/trivia/daily?date=${tomorrowDate}`);
      if (!response.ok) {
        console.error("Failed to load tomorrow's challenge");
        return;
      }

      const tomorrowData = await response.json();
      setTomorrowChallenge(tomorrowData);
    } catch (err) {
      console.error("Error loading tomorrow's challenge:", err);
    }
  };

  useEffect(() => {
    loadDailyChallenge();
    loadDailyStats();
    loadTomorrowChallenge();
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
          dailyDate: challenge.date, // Pass date for deterministic seed
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
        gameMode: 'daily',
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
    // Get current time in EST
    const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    // Get tomorrow midnight EST
    const tomorrow = new Date(estNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    // Calculate difference from current actual time to tomorrow midnight EST
    const diff = tomorrow.getTime() - estNow.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTomorrowDateParts = () => {
    const now = new Date();
    const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const tomorrow = new Date(estNow);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const day = tomorrow.getDate();
    const month = tomorrow.toLocaleString('en-US', { month: 'long' });
    const year = tomorrow.getFullYear();
    return { day, month, year, suffix: getOrdinalSuffix(day) };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-8">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-12 space-y-2 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight pb-1">
              Daily Challenge
            </h1>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-semibold text-foreground flex items-baseline justify-center gap-[0.3em]">
                {(() => {
                  const { day, month, year, suffix } = getTodayDateParts();
                  return (
                    <>
                      <span className="inline-block animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both" style={{ animationDelay: '0ms' }}>
                        {day}<sup className="text-[0.6em] ml-[0.05em]">{suffix}</sup>
                      </span>
                      <span className="inline-block animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
                        {month}
                      </span>
                      <span className="inline-block animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
                        {year}
                      </span>
                    </>
                  );
                })()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground animate-in fade-in duration-500 fill-mode-both" style={{ animationDelay: '400ms' }}>
                One challenge per day, infinite attempts
              </p>
            </div>
          </div>

          {/* Warmup Prompt */}
          <Link href="/chat" className="block group">
            <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-accent/50 hover:border-primary/30 transition-all">
              <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Need to warm up? Try the <span className="font-medium text-foreground">Daily Primer</span> in the Wizard's Hat
              </p>
            </div>
          </Link>

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

          {/* Upcoming Challenge Card */}
          {challenge && !loading && tomorrowChallenge && (
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Upcoming Challenge</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {(() => {
                    const { day, month, year, suffix } = getTomorrowDateParts();
                    return (
                      <>
                        {day}<sup className="text-[0.6em] ml-[0.05em]">{suffix}</sup> {month} {year}
                      </>
                    );
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-lg bg-background/50 border border-primary/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">Category</div>
                      <div className="text-base sm:text-lg font-semibold text-foreground truncate">
                        {tomorrowChallenge.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span>{tomorrowChallenge.numQuestions} questions</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    Unlocks in {getTimeUntilTomorrow()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Challenges Dropdown */}
          {challenge && !loading && (
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 sm:p-6 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <span className="text-sm sm:text-base font-medium">Past 7 Days</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-200 ${
                        isHistoryOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0">
                    <div className="space-y-2">
                      {getPastChallengeDates().map((pastDate) => {
                        const stats = dailyStats[pastDate.date];
                        const hasData = stats !== null && stats !== undefined;

                        return (
                          <div
                            key={pastDate.date}
                            className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                {pastDate.displayDate}
                              </span>
                              <span className="hidden sm:inline text-muted-foreground">•</span>
                              <span className="text-sm sm:text-base font-medium truncate">
                                {hasData ? stats.category : "Loading..."}
                              </span>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              {statsLoading ? (
                                <Skeleton className="h-6 w-12" />
                              ) : hasData ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-sm sm:text-base font-semibold text-primary">
                                    {stats.avg}%
                                  </span>
                                  <span className="text-xs text-muted-foreground hidden sm:inline">
                                    avg
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  No data
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
