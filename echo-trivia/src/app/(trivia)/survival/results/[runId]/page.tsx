"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Clock,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BarChart3,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

interface QuestionAttempt {
  question_id: string;
  prompt: string;
  category: string;
  user_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  explanation: string | null;
}

interface SurvivalRun {
  id: string;
  mode: "mixed" | "category";
  category: string | null;
  streak: number;
  categories_seen: string[];
  time_played_seconds: number;
  ended_at: string;
  questions_attempted: QuestionAttempt[];
}

export default function SurvivalResultsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;

  const [run, setRun] = useState<SurvivalRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRun = async () => {
      try {
        const res = await fetch(`/api/survival/run/${runId}`);
        if (!res.ok) {
          throw new Error("Run not found");
        }
        const data = await res.json();
        setRun(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load run");
      } finally {
        setLoading(false);
      }
    };

    if (runId) {
      fetchRun();
    }
  }, [runId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Run Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || "This survival run could not be found."}</p>
            <Button onClick={() => router.push("/survival")}>
              Back to Survival
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/history")}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <CardTitle className="text-2xl">Survival Run</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(run.ended_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Awarded Rank */}
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold text-yellow-500">Highly Regarded</span>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                    <Flame className="h-6 w-6" />
                    {run.streak}
                  </div>
                  <p className="text-sm text-muted-foreground">Final Streak</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <Clock className="h-6 w-6" />
                    {formatTime(run.time_played_seconds)}
                  </div>
                  <p className="text-sm text-muted-foreground">Time Played</p>
                </div>
              </div>

              {/* Mode & Categories */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {run.mode === "mixed" ? "Mixed Mode" : `${run.category} Mode`}
                  </Badge>
                </div>
                {run.mode === "mixed" && run.categories_seen.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Categories Survived:</p>
                    <div className="flex flex-wrap gap-1">
                      {run.categories_seen.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => router.push(`/survival/play?mode=${run.mode}${run.category ? `&category=${run.category}` : ''}`)} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button onClick={() => router.push("/survival")} variant="outline" className="flex-1">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Section */}
        {run.questions_attempted && run.questions_attempted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Questions ({run.questions_attempted.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {run.questions_attempted.map((q, index) => (
                  <div
                    key={q.question_id}
                    className={`p-4 rounded-lg border ${
                      q.is_correct
                        ? "bg-green-500/5 border-green-500/30"
                        : "bg-red-500/5 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="font-medium">{q.prompt}</p>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {q.category}
                          </Badge>
                          {q.is_correct ? (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Correct
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              Incorrect
                            </span>
                          )}
                        </div>

                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-muted-foreground">Your answer:</span>{" "}
                            <span className={q.is_correct ? "text-green-600" : "text-red-600"}>
                              {q.user_answer || "—"}
                            </span>
                          </p>
                          {!q.is_correct && (
                            <p>
                              <span className="text-muted-foreground">Correct answer:</span>{" "}
                              <span className="text-green-600">{q.correct_answer}</span>
                            </p>
                          )}
                        </div>

                        {q.explanation && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
