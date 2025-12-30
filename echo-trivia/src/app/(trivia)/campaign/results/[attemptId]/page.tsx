"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Castle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Home,
  RotateCcw,
  Trophy,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface QuestionResult {
  question_id: string;
  prompt: string;
  choices: { id: string; text: string }[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

interface FloorResult {
  id: string;
  floorNumber: number;
  category: string;
  difficulty: string;
  score: number;
  passed: boolean;
  questions: QuestionResult[];
  timeTaken: number | null;
  completedAt: string;
  tier: number;
  tierName: string;
}

export default function CampaignResultsPage() {
  const params = useParams();
  const router = useRouter();
  const echo = useEcho();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<FloorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!echo.user?.id || !attemptId) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `/api/tower/results/${attemptId}?echo_user_id=${echo.user?.id}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, echo.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-stone-950 flex items-center justify-center">
        <div className="text-indigo-300 animate-pulse">Loading results...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-stone-950 flex items-center justify-center">
        <Card className="max-w-md border-indigo-500/30 bg-indigo-950/50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">{error || "Results not found"}</p>
            <Button
              onClick={() => router.push("/campaign/levels")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Tower
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = Math.round((result.score / 5) * 100);

  // Get choice text by ID
  const getChoiceText = (question: QuestionResult, choiceId: string) => {
    const choice = question.choices?.find((c) => c.id === choiceId);
    return choice?.text || choiceId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-stone-950 to-stone-950">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/campaign/levels"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 backdrop-blur-sm border border-indigo-500/30 text-indigo-200 hover:bg-indigo-950/80 hover:border-indigo-500/50 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tower</span>
            </Link>
          </motion.div>

          {/* Score Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              className={`border-2 ${
                result.passed
                  ? "border-emerald-500/50 bg-gradient-to-br from-emerald-950/50 to-indigo-950/50"
                  : "border-red-500/50 bg-gradient-to-br from-red-950/50 to-indigo-950/50"
              }`}
            >
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Castle className="w-6 h-6 text-indigo-400" />
                    <Badge
                      variant="outline"
                      className="border-indigo-500/50 text-indigo-300"
                    >
                      Floor {result.floorNumber}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-indigo-500/50 text-indigo-300 capitalize"
                    >
                      {result.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-indigo-100">
                      {result.category}
                    </h1>
                    <p className="text-sm text-indigo-300/70">
                      {result.tierName}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div
                        className={`text-5xl sm:text-6xl font-bold ${
                          result.passed ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {result.score}/5
                      </div>
                      <div className="text-sm text-indigo-300/70 mt-1">
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {result.passed ? (
                      <Badge className="bg-emerald-600/80 text-emerald-100 border-emerald-500/50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Floor Cleared
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-red-600/80 border-red-500/50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Floor Failed
                      </Badge>
                    )}
                    {result.score === 5 && (
                      <Badge className="bg-amber-600/80 text-amber-100 border-amber-500/50">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Perfect!
                      </Badge>
                    )}
                  </div>

                  {result.timeTaken && (
                    <div className="flex items-center justify-center gap-1 text-sm text-indigo-300/60">
                      <Clock className="w-4 h-4" />
                      <span>
                        {Math.floor(result.timeTaken / 60)}:
                        {(result.timeTaken % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Question Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-indigo-500/30 bg-indigo-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-100">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  Review Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.questions && result.questions.length > 0 ? (
                  result.questions.map((question, idx) => (
                    <motion.div
                      key={question.question_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        question.is_correct
                          ? "border-emerald-500/50 bg-emerald-950/30"
                          : "border-red-500/50 bg-red-950/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {question.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-indigo-100">
                              {idx + 1}. {question.prompt}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={question.is_correct ? "default" : "destructive"}
                          className={
                            question.is_correct
                              ? "bg-emerald-600/50 border-emerald-500/50"
                              : "bg-red-600/50 border-red-500/50"
                          }
                        >
                          {question.is_correct ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>

                      {/* Your Answer Summary */}
                      {question.choices && question.choices.length > 0 && (
                        <div className="ml-8 mb-3 space-y-1">
                          <p className={`text-sm ${question.is_correct ? "text-emerald-300" : "text-red-300"}`}>
                            <span className="text-indigo-400">Your answer:</span>{" "}
                            <span className="font-medium">
                              {question.user_answer} - {question.choices.find(c => c.id === question.user_answer)?.text || "Unknown"}
                            </span>
                          </p>
                          {!question.is_correct && (
                            <p className="text-sm text-emerald-300">
                              <span className="text-indigo-400">Correct answer:</span>{" "}
                              <span className="font-medium">
                                {question.correct_answer} - {question.choices.find(c => c.id === question.correct_answer)?.text || "Unknown"}
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* All Choices */}
                      {question.choices && question.choices.length > 0 && (
                        <div className="ml-8 space-y-2 mb-3">
                          {question.choices.map((choice) => {
                            const isUserAnswer =
                              choice.id === question.user_answer;
                            const isCorrectAnswer =
                              choice.id === question.correct_answer;

                            let choiceStyle = "border-indigo-500/20 bg-indigo-950/20";
                            if (isCorrectAnswer) {
                              choiceStyle =
                                "border-emerald-500/50 bg-emerald-950/30";
                            } else if (isUserAnswer && !question.is_correct) {
                              choiceStyle = "border-red-500/50 bg-red-950/30";
                            }

                            return (
                              <div
                                key={choice.id}
                                className={`flex items-center gap-2 p-2 rounded border ${choiceStyle}`}
                              >
                                <span
                                  className={`font-mono text-sm ${
                                    isCorrectAnswer
                                      ? "text-emerald-400"
                                      : isUserAnswer && !question.is_correct
                                      ? "text-red-400"
                                      : "text-indigo-400"
                                  }`}
                                >
                                  {choice.id}.
                                </span>
                                <span
                                  className={
                                    isCorrectAnswer
                                      ? "text-emerald-200"
                                      : isUserAnswer && !question.is_correct
                                      ? "text-red-200"
                                      : "text-indigo-200"
                                  }
                                >
                                  {choice.text}
                                </span>
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                                )}
                                {isUserAnswer && !question.is_correct && (
                                  <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Answer summary for questions without choices displayed */}
                      {(!question.choices || question.choices.length === 0) && (
                        <div className="ml-8 space-y-1 text-sm">
                          <p className="text-indigo-300">
                            <span className="text-indigo-400">Your answer:</span>{" "}
                            {question.user_answer}
                          </p>
                          <p className="text-emerald-300">
                            <span className="text-emerald-400">
                              Correct answer:
                            </span>{" "}
                            {question.correct_answer}
                          </p>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="ml-8 mt-3 p-3 rounded bg-indigo-950/50 border border-indigo-500/20">
                          <p className="text-sm text-indigo-200">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-indigo-300/60 text-center py-8">
                    Question details are not available for this attempt.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                router.push(`/campaign/play/${result.floorNumber}`)
              }
              className="border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/50 text-indigo-200"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Floor
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/campaign/levels")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Castle className="mr-2 h-4 w-4" />
              Back to Tower
            </Button>
          </motion.div>

          {/* Home link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-indigo-400 hover:text-indigo-300"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
