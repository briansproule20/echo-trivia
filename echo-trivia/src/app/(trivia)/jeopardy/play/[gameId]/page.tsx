"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: "multiple_choice" | "true_false";
  category: string;
  points: number;
  prompt: string;
  choices?: { id: string; text: string }[];
}

interface CellState {
  answered: boolean;
  correct?: boolean;
}

interface GameState {
  categories: string[];
  boardSize: 3 | 5;
  score: number;
  boardState: Record<string, CellState>;
  startTime: number;
}

const POINT_VALUES = [200, 400, 600, 800, 1000];

export default function JeopardyPlayPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;
  const echo = useEcho();
  const { user, isLoading: authLoading } = echo;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Question modal state
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load game state from URL params or fetch from server
  useEffect(() => {
    const loadGame = async () => {
      // Get game data from sessionStorage (set by start page)
      const storedGame = sessionStorage.getItem(`jeopardy-${gameId}`);
      if (storedGame) {
        const data = JSON.parse(storedGame);
        setGameState({
          categories: data.categories,
          boardSize: data.board_size,
          score: data.score || 0,
          boardState: {},
          startTime: Date.now(),
        });
        setIsLoading(false);
      } else {
        setError("Game not found. Please start a new game.");
        setIsLoading(false);
      }
    };

    loadGame();
  }, [gameId]);

  // Timer effect
  useEffect(() => {
    if (gameState && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameState.startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  const handleSignIn = async () => {
    try {
      await echo.signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const getCellKey = (category: string, points: number) => `${category}-${points}`;

  const handleCellClick = async (category: string, points: number) => {
    if (!user || !gameState) return;

    const cellKey = getCellKey(category, points);
    if (gameState.boardState[cellKey]?.answered) return;

    setIsLoadingQuestion(true);
    setActiveQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);

    try {
      const res = await fetch("/api/jeopardy/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: gameId,
          category,
          points,
          echo_user_id: user.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch question");
      }

      const data = await res.json();
      setActiveQuestion(data.question);
    } catch (error) {
      console.error("Failed to fetch question:", error);
      setError(error instanceof Error ? error.message : "Failed to load question");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !activeQuestion || !user || !gameState) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/jeopardy/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: gameId,
          question_id: activeQuestion.id,
          category: activeQuestion.category,
          points: activeQuestion.points,
          response: selectedAnswer,
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
      setPointsEarned(data.points_earned);
      setShowResult(true);

      // Update game state
      const cellKey = getCellKey(activeQuestion.category, activeQuestion.points);
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          score: data.current_score,
          boardState: {
            ...prev.boardState,
            [cellKey]: { answered: true, correct: data.correct },
          },
        };
      });

      // If game over, redirect to results
      if (data.game_over) {
        setTimeout(() => {
          router.push(`/jeopardy/results/${gameId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQuestion = () => {
    if (showResult) {
      setActiveQuestion(null);
      setShowResult(false);
    }
  };

  const handleEndGame = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/jeopardy/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: gameId,
          echo_user_id: user.id,
        }),
      });

      if (res.ok) {
        router.push(`/jeopardy/results/${gameId}`);
      }
    } catch (error) {
      console.error("Failed to end game:", error);
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              <LayoutGrid className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to play Jeopardy
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error || "Game not found"}</p>
            <Button onClick={() => router.push("/jeopardy")} size="lg" className="w-full">
              Start New Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-2 sm:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-lg sm:text-2xl",
              gameState.score >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            )}>
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              {gameState.score >= 0 ? "+" : ""}{gameState.score}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleEndGame}>
            End Game
          </Button>
        </div>

        {/* Game Board */}
        <Card className="border-2 overflow-hidden">
          <CardContent className="p-0">
            {/* Category Headers */}
            <div className={cn(
              "grid gap-px bg-border",
              gameState.boardSize === 3 ? "grid-cols-3" : "grid-cols-5"
            )}>
              {gameState.categories.map((category) => (
                <div
                  key={category}
                  className="bg-primary text-primary-foreground p-2 sm:p-4 text-center font-bold text-xs sm:text-sm md:text-base truncate"
                  title={category}
                >
                  {category}
                </div>
              ))}
            </div>

            {/* Point Rows */}
            {POINT_VALUES.map((points) => (
              <div
                key={points}
                className={cn(
                  "grid gap-px bg-border",
                  gameState.boardSize === 3 ? "grid-cols-3" : "grid-cols-5"
                )}
              >
                {gameState.categories.map((category) => {
                  const cellKey = getCellKey(category, points);
                  const cellState = gameState.boardState[cellKey];
                  const isAnswered = cellState?.answered;

                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleCellClick(category, points)}
                      disabled={isAnswered || isLoadingQuestion}
                      className={cn(
                        "aspect-[4/3] sm:aspect-[3/2] flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-bold transition-all",
                        isAnswered
                          ? cellState.correct
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                          : "bg-card hover:bg-primary/10 hover:text-primary cursor-pointer"
                      )}
                    >
                      {isAnswered ? (
                        cellState.correct ? (
                          <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />
                        ) : (
                          <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                        )
                      ) : (
                        `$${points}`
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Question Modal */}
        <Dialog open={isLoadingQuestion || !!activeQuestion} onOpenChange={() => handleCloseQuestion()}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            {isLoadingQuestion ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating question...</p>
              </div>
            ) : activeQuestion ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{activeQuestion.category}</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      ${activeQuestion.points}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Question */}
                  <p className="text-lg font-medium leading-relaxed">
                    {activeQuestion.prompt}
                  </p>

                  {/* Choices */}
                  <div className="space-y-2">
                    {activeQuestion.type === "multiple_choice" && activeQuestion.choices ? (
                      activeQuestion.choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => !showResult && setSelectedAnswer(choice.id)}
                          disabled={showResult}
                          className={cn(
                            "w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all text-sm sm:text-base",
                            getChoiceClass(choice.id)
                          )}
                        >
                          <span className="font-medium mr-2">{choice.id}.</span>
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
                          className={cn(
                            "w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all",
                            getChoiceClass("true")
                          )}
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
                          className={cn(
                            "w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all",
                            getChoiceClass("false")
                          )}
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

                  {/* Result */}
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-lg",
                        isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-bold text-green-500">+{pointsEarned}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-500" />
                            <span className="font-bold text-red-500">{pointsEarned}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm">{explanation}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  {!showResult ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer || isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCloseQuestion}
                      className="w-full"
                      size="lg"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
