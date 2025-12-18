"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CorrectAnswerFlurp } from "@/components/trivia/CorrectAnswerFlurp";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Flame,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  BarChart3,
  Clock,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  LogIn,
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple_choice" | "true_false";
  difficulty: "easy" | "medium";
  category: string;
  prompt: string;
  choices?: { id: string; text: string }[];
}

interface QuestionAttempt {
  question_id: string;
  prompt: string;
  category: string;
  user_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  explanation: string | null;
}

interface GameOverStats {
  streak: number;
  categories_seen: string[];
  rank: number | null;
  time_played: number;
  is_personal_best: boolean;
  questions_attempted: QuestionAttempt[];
  awarded_rank: string;
}

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const echo = useEcho();
  const { user, isLoading: authLoading } = echo;

  const mode = (searchParams.get("mode") || "mixed") as "mixed" | "category";
  const category = searchParams.get("category") || undefined;

  const [runId, setRunId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverStats, setGameOverStats] = useState<GameOverStats | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showQuestions, setShowQuestions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCorrectFlurp, setShowCorrectFlurp] = useState(false);
  const hasFetchedInitial = useRef(false);

  const handleSignIn = async () => {
    try {
      await echo.signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  // Fetch first question
  const fetchQuestion = useCallback(async (existingRunId?: string) => {
    if (!user) return;

    setIsLoadingQuestion(true);
    try {
      const res = await fetch("/api/survival/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: existingRunId,
          mode,
          category,
          echo_user_id: user.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch question");
      }

      const data = await res.json();
      setRunId(data.run_id);
      setQuestion(data.question);
      setCurrentCategory(data.category);
      setStreak(data.current_streak);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to fetch question:", error);
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [user, mode, category]);

  // Initial fetch - use ref to prevent double fetch in StrictMode
  useEffect(() => {
    if (user && !authLoading && !hasFetchedInitial.current) {
      hasFetchedInitial.current = true;
      fetchQuestion();
    }
  }, [user, authLoading, fetchQuestion]);

  const handleSubmit = async () => {
    if (!selectedAnswer || !question || !runId || !user) return;

    setIsSubmitting(true);
    const timeMs = Date.now() - startTime;

    try {
      const res = await fetch("/api/survival/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: runId,
          question_id: question.id,
          response: selectedAnswer,
          time_ms: timeMs,
          echo_user_id: user.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await res.json();
      setIsCorrect(data.correct);
      setExplanation(data.explanation);
      setCorrectAnswer(data.canonical_answer);
      setShowResult(true);

      // Show correct answer flurp animation
      if (data.correct) {
        setShowCorrectFlurp(true);
        setTimeout(() => setShowCorrectFlurp(false), 1300);
      }

      if (data.game_over) {
        setIsGameOver(true);
        setGameOverStats(data.final_stats);

        // Confetti for personal best
        if (data.final_stats?.is_personal_best && data.final_stats.streak > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } else {
        setStreak(data.streak);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    fetchQuestion(runId || undefined);
  };

  const handleTryAgain = () => {
    setRunId(null);
    setQuestion(null);
    setStreak(0);
    setIsGameOver(false);
    setGameOverStats(null);
    setShowResult(false);
    fetchQuestion();
  };

  const getChoiceClass = (choiceId: string) => {
    if (!showResult) {
      return selectedAnswer === choiceId
        ? "border-primary bg-primary/10"
        : "border-border hover:border-primary/50";
    }

    if (choiceId === correctAnswer) {
      return "border-green-500 bg-green-500/10";
    }

    if (selectedAnswer === choiceId && !isCorrect) {
      return "border-red-500 bg-red-500/10";
    }

    return "border-border opacity-50";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to play Survival mode
            </p>
            <Button onClick={handleSignIn} size="lg" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Play
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confetti particles for personal best
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#fbbf24', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'][Math.floor(Math.random() * 6)],
  }));

  // Game Over Screen
  if (isGameOver && gameOverStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: '100vh',
                opacity: [1, 1, 0],
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg relative z-10"
        >
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Game Over</h1>

              {/* Awarded Rank */}
              <div className="mb-4 flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold text-yellow-500">{gameOverStats.awarded_rank || "Highly Regarded"}</span>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>

              <div className="my-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary mb-2">
                  <Flame className="h-8 w-8" />
                  {gameOverStats.streak}
                </div>
                <p className="text-sm text-muted-foreground">Final Streak</p>

                {gameOverStats.is_personal_best && gameOverStats.streak > 0 && (
                  <Badge className="mt-2" variant="default">
                    New Personal Best!
                  </Badge>
                )}
              </div>

              {mode === "mixed" && gameOverStats.categories_seen.length > 0 && (
                <div className="mb-6 text-left">
                  <p className="text-sm font-medium mb-2">Categories Survived:</p>
                  <div className="flex flex-wrap gap-1">
                    {gameOverStats.categories_seen.slice(0, 8).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {gameOverStats.categories_seen.length > 8 && (
                      <Badge variant="secondary" className="text-xs">
                        +{gameOverStats.categories_seen.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                {gameOverStats.rank && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-bold">#{gameOverStats.rank}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Leaderboard</p>
                  </div>
                )}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-bold">{Math.floor(gameOverStats.time_played / 60)}:{String(gameOverStats.time_played % 60).padStart(2, "0")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Time Played</p>
                </div>
              </div>

              {/* Questions Attempted - Collapsible */}
              {gameOverStats.questions_attempted && gameOverStats.questions_attempted.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowQuestions(!showQuestions)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      Questions Attempted ({gameOverStats.questions_attempted.length})
                    </span>
                    {showQuestions ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showQuestions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                          {gameOverStats.questions_attempted.map((q, index) => (
                            <div
                              key={q.question_id}
                              className={`p-3 rounded-lg text-left text-sm ${
                                q.is_correct
                                  ? "bg-green-500/10 border border-green-500/30"
                                  : "bg-red-500/10 border border-red-500/30"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-muted-foreground">
                                  {index + 1}.
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium mb-1">{q.prompt}</p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className="text-xs">
                                      {q.category}
                                    </Badge>
                                    {q.is_correct ? (
                                      <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {q.user_answer}
                                      </span>
                                    ) : (
                                      <span className="text-red-600 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {q.user_answer} → {q.correct_answer}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleTryAgain} className="flex-1" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/survival")}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <CorrectAnswerFlurp isVisible={showCorrectFlurp} />
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Flame className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{streak}</span>
            </div>
            {isLoadingQuestion && mode === "mixed" ? (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                New category...
              </Badge>
            ) : (
              <Badge variant="secondary">{currentCategory || "Loading..."}</Badge>
            )}
          </div>
          <Badge variant="default" className="text-xs">Beta</Badge>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {isLoadingQuestion ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>
          ) : question ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2">
                <CardContent className="p-6">
                  {/* Question */}
                  <div className="mb-6">
                    <Badge variant="outline" className="mb-3 text-xs">
                      {question.difficulty} · {question.type === "multiple_choice" ? "Multiple Choice" : "True/False"}
                    </Badge>
                    <p className="text-lg font-medium leading-relaxed">{question.prompt}</p>
                  </div>

                  {/* Choices */}
                  <div className="space-y-3 mb-6">
                    {question.type === "multiple_choice" && question.choices ? (
                      question.choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => !showResult && setSelectedAnswer(choice.id)}
                          disabled={showResult}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${getChoiceClass(choice.id)}`}
                        >
                          <span className="font-medium mr-3">{choice.id}.</span>
                          {choice.text}
                          {showResult && choice.id === correctAnswer && (
                            <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />
                          )}
                          {showResult && selectedAnswer === choice.id && !isCorrect && (
                            <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
                          )}
                        </button>
                      ))
                    ) : (
                      <>
                        <button
                          onClick={() => !showResult && setSelectedAnswer("true")}
                          disabled={showResult}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${getChoiceClass("true")}`}
                        >
                          True
                          {showResult && correctAnswer === "true" && (
                            <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />
                          )}
                          {showResult && selectedAnswer === "true" && !isCorrect && (
                            <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
                          )}
                        </button>
                        <button
                          onClick={() => !showResult && setSelectedAnswer("false")}
                          disabled={showResult}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${getChoiceClass("false")}`}
                        >
                          False
                          {showResult && correctAnswer === "false" && (
                            <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />
                          )}
                          {showResult && selectedAnswer === "false" && !isCorrect && (
                            <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Explanation (shown after answer) */}
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-6 p-4 bg-muted/50 rounded-lg"
                    >
                      <p className="text-sm">{explanation}</p>
                    </motion.div>
                  )}

                  {/* Submit / Next Button */}
                  {!showResult ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Submit Answer
                    </Button>
                  ) : isCorrect ? (
                    <Button onClick={handleNextQuestion} className="w-full" size="lg">
                      Next Question
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}

export default function SurvivalPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
