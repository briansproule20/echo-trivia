"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBanner } from "@/components/trivia/ScoreBanner";
import { StatsDialog } from "@/components/trivia/StatsDialog";
import { storage } from "@/lib/storage";
import { getRandomTitle } from "@/lib/quiz-utils";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, RotateCcw, Home, Share2, BarChart3, Check, X, User } from "lucide-react";
import type { Session } from "@/lib/types";
import { useEcho } from "@merit-systems/echo-react-sdk";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const echo = useEcho();

  const [session, setSession] = useState<Session | null>(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isLoadingUsername, setIsLoadingUsername] = useState(true);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const loadedSession = await storage.getSession(sessionId);
      if (loadedSession) {
        setSession(loadedSession);

        // Load quiz results if available (from submission response)
        const resultsKey = `quiz_results_${sessionId}`;
        const savedResults = localStorage.getItem(resultsKey);
        if (savedResults) {
          setQuizResults(JSON.parse(savedResults));
        }

        // Fetch current username
        if (echo.user?.id) {
          try {
            const response = await fetch(`/api/user/profile?echo_user_id=${echo.user.id}`);
            if (response.ok) {
              const data = await response.json();
              const fetchedUsername = data.user?.username || echo.user.name || "Anonymous";
              setCurrentUsername(fetchedUsername);
              setEditingUsername(fetchedUsername);
            }
          } catch (error) {
            console.error("Failed to fetch username:", error);
            const fallbackUsername = echo.user.name || "Anonymous";
            setCurrentUsername(fallbackUsername);
            setEditingUsername(fallbackUsername);
          } finally {
            setIsLoadingUsername(false);
          }
        } else {
          setIsLoadingUsername(false);
        }
      } else {
        router.push("/");
      }
    };
    loadSession();
  }, [sessionId, echo.user?.id]);

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const score = session.submissions.filter((s) => s.correct).length;
  const percentage = Math.round((score / session.quiz.questions.length) * 100);

  // Use saved title from session (should always exist from handleFinish)
  // Only generate as fallback for old sessions without saved title
  const earnedTitle = session.earnedTitle || (() => {
    const generated = getRandomTitle(percentage);
    return generated.title;
  })();
  const earnedTier = session.earnedTier || (() => {
    const generated = getRandomTitle(percentage);
    return generated.tier;
  })();
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

  const handleSaveUsername = async () => {
    if (!echo.user?.id || !editingUsername.trim() || editingUsername === currentUsername) {
      setIsEditingUsername(false);
      setEditingUsername(currentUsername);
      return;
    }

    setIsSavingUsername(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          username: editingUsername.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const savedUsername = data.user?.username || editingUsername.trim();
        setCurrentUsername(savedUsername);
        setEditingUsername(savedUsername);
        setIsEditingUsername(false);
      } else {
        const errorData = await response.json();
        console.error("Failed to save username:", errorData);
        throw new Error(errorData.error || "Failed to save username");
      }
    } catch (error) {
      console.error("Error saving username:", error);
      setEditingUsername(currentUsername);
      alert("Failed to save username. Please try again.");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUsername(currentUsername);
    setIsEditingUsername(false);
  };

  const handleStartEdit = () => {
    setEditingUsername(currentUsername);
    setIsEditingUsername(true);
  };

  const handleShare = async () => {
    // Generate difficulty symbols (row 1) and correct/incorrect (row 2)
    const difficultyRow = session.quiz.questions
      .map((q) => {
        if (q.difficulty === 'easy') return '🟢';
        if (q.difficulty === 'medium') return '🟦';
        if (q.difficulty === 'hard') return '⬛';
        return '🟦'; // default to medium
      })
      .join('');

    const resultRow = session.quiz.questions
      .map((q) => {
        const submission = session.submissions.find(s => s.questionId === q.id);
        return submission?.correct ? '✅' : '❌';
      })
      .join('');

    // Get user's referral code and add to URL
    let shareUrl = "https://trivwiz.com";
    try {
      if (echo.user?.id) {
        shareUrl += `?referral_code=${echo.user.id}`;
      }
    } catch (error) {
      console.error("Failed to get user referral code:", error);
    }

    const text = `I received the rank of "${earnedTitle}" on Trivia Wizard! 🧙‍♂️

Category: ${session.quiz.category}
${difficultyRow}
${resultRow}
Score: ${score}/${session.quiz.questions.length} (${percentage}%)

${shareUrl}`;

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
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Score Banner */}
          <ScoreBanner
            score={score}
            totalQuestions={session.quiz.questions.length}
            timeElapsed={totalTime}
          />

          {/* Earned Title Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {earnedTier}
                  </Badge>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {earnedTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your rank for this quiz
                </p>
              </div>
            </CardContent>
          </Card>

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
                    className={`p-3 sm:p-4 rounded-lg border ${
                      isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-red-500 bg-red-50 dark:bg-red-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
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
          <div className={`grid grid-cols-2 ${quizResults ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
            <Button onClick={handleRetry} size="lg" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice Similar
            </Button>
            <Button onClick={handleShare} size="lg" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Score
            </Button>
            {quizResults && (
              <Button onClick={() => setShowStatsDialog(true)} size="lg" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Stats
              </Button>
            )}
            <Button onClick={() => router.push("/")} size="lg">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>

          {/* Username Display - Simple inline edit at bottom */}
          {echo.user?.id && !isLoadingUsername && (
            <Card className="border-muted">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  {isEditingUsername ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingUsername}
                        onChange={(e) => setEditingUsername(e.target.value)}
                        placeholder="Enter your username"
                        maxLength={30}
                        className="flex-1 h-9"
                        autoFocus
                        disabled={isSavingUsername}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveUsername}
                        disabled={isSavingUsername || !editingUsername.trim()}
                        className="h-9 px-3"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isSavingUsername}
                        className="h-9 px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-base font-medium truncate">{currentUsername}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleStartEdit}
                        className="h-8 text-xs whitespace-nowrap"
                      >
                        Change Username
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stats Dialog */}
      {quizResults && (
        <StatsDialog
          open={showStatsDialog}
          onOpenChange={setShowStatsDialog}
          quizStats={{
            score,
            totalQuestions: session.quiz.questions.length,
            percentage,
            earnedTitle,
            earnedTier,
            newAchievements: quizResults.newAchievements,
            streak: quizResults.streak,
          }}
        />
      )}
    </div>
  );
}

