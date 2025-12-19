"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  RotateCcw,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JeopardyQuestionAttempt } from "@/lib/supabase-types";

interface GameData {
  id: string;
  echo_user_id: string;
  board_size: 3 | 5;
  categories: string[];
  score: number;
  questions_answered: number;
  questions_correct: number;
  board_state: Record<string, boolean>;
  questions_attempted: JeopardyQuestionAttempt[];
  time_played_seconds: number;
  completed: boolean;
  ended_at: string;
  created_at: string;
}

export default function JeopardyResultsPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/jeopardy/game/${gameId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch game");
        }
        const data = await res.json();
        setGame(data.game);
        setRank(data.rank);
      } catch (error) {
        console.error("Failed to fetch game:", error);
        setError("Game not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAccuracy = () => {
    if (!game || game.questions_answered === 0) return 0;
    return Math.round((game.questions_correct / game.questions_answered) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !game) {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Game Complete!</CardTitle>
              <Badge variant="outline" className="mx-auto mt-2">
                {game.board_size} Categories
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className={cn(
                  "flex items-center justify-center gap-2 text-4xl font-bold mb-2",
                  game.score >= 0 ? "text-primary" : "text-destructive"
                )}>
                  <Zap className="h-8 w-8" />
                  {game.score >= 0 ? "+" : ""}{game.score}
                </div>
                <p className="text-sm text-muted-foreground">Final Score</p>
              </div>

              {/* Categories */}
              <div>
                <p className="text-sm font-medium mb-2">Categories Played</p>
                <div className="flex flex-wrap gap-1.5">
                  {game.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-bold">{getAccuracy()}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-bold">{game.questions_correct}/{game.questions_answered}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-bold">{formatTime(game.time_played_seconds)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>

              {/* Rank */}
              {rank && (
                <div className="p-4 bg-primary/5 rounded-lg flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">#{rank}</span>
                  <span className="text-sm text-muted-foreground">on the {game.board_size}-category leaderboard</span>
                </div>
              )}

              {/* Questions Attempted - Collapsible */}
              {game.questions_attempted && game.questions_attempted.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowQuestions(!showQuestions)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      Questions ({game.questions_attempted.length})
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
                        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
                          {game.questions_attempted.map((q, index) => (
                            <div
                              key={q.question_id}
                              className={cn(
                                "p-3 rounded-lg text-left text-sm",
                                q.is_correct
                                  ? "bg-green-500/10 border border-green-500/30"
                                  : "bg-red-500/10 border border-red-500/30"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-muted-foreground shrink-0">
                                  {index + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium mb-1.5 leading-snug">{q.prompt}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <Badge variant="outline" className="text-xs">
                                      {q.category}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      ${q.points}
                                    </Badge>
                                    {q.is_correct ? (
                                      <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        +{q.points_earned}
                                      </span>
                                    ) : (
                                      <span className="text-red-600 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {q.points_earned}
                                      </span>
                                    )}
                                  </div>
                                  {q.explanation && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {q.explanation}
                                    </p>
                                  )}
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

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => router.push("/jeopardy")} className="flex-1" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button
                  onClick={() => router.push("/jeopardy")}
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
    </div>
  );
}
