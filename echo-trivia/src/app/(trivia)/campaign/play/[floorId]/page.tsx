"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Sparkles, Loader2, XCircle, Trophy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { getFloorBackground } from "../../levels/page";
import { AdventureFlurp } from "@/components/trivia/AdventureFlurp";

interface Question {
  id: string;
  prompt: string;
  choices: { id: string; text: string }[];
  type: string;
  difficulty: string;
  category: string;
}

interface FloorData {
  floorNumber: number;
  tier: number;
  tierName: string;
  difficulty: string;
  category: string;
  quizId: string;
  questions: Question[];
}

interface SubmitResult {
  question_id: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export default function CampaignPlayPage() {
  const params = useParams();
  const router = useRouter();
  const echo = useEcho();
  const floorId = parseInt(params.floorId as string, 10);
  const [showFlurp, setShowFlurp] = useState(false);

  // Quiz state
  const [floorData, setFloorData] = useState<FloorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: string; user_answer: string }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    passed: boolean;
    score: number;
    isPerfect: boolean;
    results: SubmitResult[];
    nextFloorUnlocked: boolean;
  } | null>(null);
  const [startTime] = useState(Date.now());

  const username = echo.user?.name || echo.user?.email?.split("@")[0] || "Traveler";
  const background = getFloorBackground(floorId);

  // Fetch floor data on mount
  useEffect(() => {
    async function fetchFloor() {
      if (floorId === 0) {
        setLoading(false);
        return; // Prologue doesn't need quiz data
      }

      try {
        const res = await fetch("/api/tower/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ floorNumber: floorId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || err.error || "Failed to generate floor");
        }

        const data = await res.json();
        setFloorData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load floor");
      } finally {
        setLoading(false);
      }
    }

    fetchFloor();
  }, [floorId]);

  const handleSelectAnswer = (answerId: string) => {
    if (results) return; // Don't allow changes after submission
    setSelectedAnswer(answerId);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer || !floorData) return;

    const currentQuestion = floorData.questions[currentQuestionIndex];
    const newAnswers = [...answers, { question_id: currentQuestion.id, user_answer: selectedAnswer }];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex < floorData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit all answers
      submitFloor(newAnswers);
    }
  };

  const submitFloor = async (finalAnswers: { question_id: string; user_answer: string }[]) => {
    if (!floorData) return;
    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const res = await fetch("/api/tower/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floorNumber: floorId,
          quizId: floorData.quizId,
          answers: finalAnswers,
          timeTaken,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Failed to submit");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = () => {
    setShowFlurp(true);
  };

  const handleFlurpExpanded = () => {
    router.push("/campaign/levels");
  };

  const handleRetry = () => {
    // Reset state and refetch
    setFloorData(null);
    setLoading(true);
    setError(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setResults(null);

    // Trigger refetch
    fetch("/api/tower/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ floorNumber: floorId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setFloorData(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Floor 0 is the Prologue
  if (floorId === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-stone-950">
        {/* Background image */}
        <div className="fixed inset-0 z-0">
          <Image
            src={background}
            alt="The Tower - Prologue"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
        </div>

        {/* Back button */}
        <motion.div
          className="relative z-20 p-4 sm:p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/campaign/levels"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/60 backdrop-blur-sm border border-amber-500/30 text-amber-200 hover:bg-stone-950/80 hover:border-amber-500/50 transition-all text-sm"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif">Return to Tower</span>
          </Link>
        </motion.div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 pb-12">
          <motion.div
            className="max-w-2xl w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Wizard greeting card */}
            <div className="bg-stone-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 mb-2"
                >
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </motion.div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-amber-100"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                >
                  Welcome, {username}
                </h1>
                <p className="text-amber-300/70 font-serif text-sm tracking-wide uppercase">
                  The Wizard's Introduction
                </p>
              </div>

              {/* Wizard's message */}
              <div className="space-y-4 text-stone-200 font-serif leading-relaxed">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  You've found your way to the Tower. Good. The Archive needs more minds like yours.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  Each floor holds five questions. Answer at least three correctly to prove you've understood the texts, and the way upward will open.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  The Lower Archives test basic comprehension. As you climb, the questions grow harder. The Upper Sanctum will challenge even the sharpest minds.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="text-amber-200/90"
                >
                  There is no shame in falling. Return as many times as you need. The Tower is patient, and so am I.
                </motion.p>
              </div>

              {/* Rules summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50"
              >
                <h3 className="text-sm font-medium text-amber-400 mb-3 uppercase tracking-wide">
                  The Rules
                </h3>
                <ul className="space-y-2 text-sm text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>5 questions per floor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>Score 3/5 or higher to advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>Difficulty increases as you climb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>Retry any floor as many times as needed</span>
                  </li>
                </ul>
              </motion.div>

              {/* Acknowledge button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="pt-2"
              >
                <button
                  onClick={handleAcknowledge}
                  disabled={showFlurp}
                  className="w-full py-3 rounded-xl font-serif text-sm flex items-center justify-center gap-2 transition-all bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-500/60 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I Understand</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Adventure Flurp */}
        <AdventureFlurp
          isVisible={showFlurp}
          onExpanded={handleFlurpExpanded}
          onAnimationComplete={() => setShowFlurp(false)}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-stone-950">
        <div className="fixed inset-0 z-0">
          <Image src={background} alt={`Floor ${floorId}`} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-stone-950/70" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
          <p className="text-amber-200 font-serif">Preparing Floor {floorId}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-stone-950">
        <div className="fixed inset-0 z-0">
          <Image src={background} alt={`Floor ${floorId}`} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-stone-950/70" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-stone-900/90 border border-rose-500/30 rounded-2xl p-6 max-w-md text-center">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-serif text-stone-100 mb-2">Failed to Load</h2>
            <p className="text-stone-400 mb-4">{error}</p>
            <Link
              href="/campaign/levels"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-800 border border-amber-500/30 text-amber-200 hover:bg-stone-700 transition-all text-sm font-serif"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Tower
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (results) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-stone-950">
        <div className="fixed inset-0 z-0">
          <Image src={background} alt={`Floor ${floorId}`} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-stone-950/80" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <div className="p-4">
            <Link
              href="/campaign/levels"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/60 backdrop-blur-sm border border-amber-500/30 text-amber-200 hover:bg-stone-950/80 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-serif">Return to Tower</span>
            </Link>
          </div>

          {/* Results card */}
          <div className="flex-1 flex items-center justify-center px-4 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg bg-stone-900/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 space-y-6"
            >
              {/* Result header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    results.passed ? "bg-emerald-500/20 border-2 border-emerald-500/40" : "bg-rose-500/20 border-2 border-rose-500/40"
                  }`}
                >
                  {results.passed ? (
                    results.isPerfect ? (
                      <Trophy className="w-10 h-10 text-amber-400" />
                    ) : (
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    )
                  ) : (
                    <XCircle className="w-10 h-10 text-rose-400" />
                  )}
                </motion.div>
                <h2 className={`text-2xl font-serif font-bold ${results.passed ? "text-emerald-300" : "text-rose-300"}`}>
                  {results.passed ? (results.isPerfect ? "Perfect!" : "Floor Cleared!") : "Not Quite..."}
                </h2>
                <p className="text-stone-400 mt-1">
                  {results.passed
                    ? results.nextFloorUnlocked
                      ? `Floor ${floorId + 1} is now unlocked!`
                      : "Well done, maintainer."
                    : "The texts require more study."}
                </p>
              </div>

              {/* Score */}
              <div className="flex justify-center">
                <div className="bg-stone-800/50 rounded-xl px-8 py-4 text-center">
                  <div className="text-4xl font-mono font-bold text-amber-200">
                    {results.score}/5
                  </div>
                  <div className="text-xs text-stone-500 mt-1">SCORE</div>
                </div>
              </div>

              {/* Question results */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wide">Results</h3>
                {results.results.map((r, i) => (
                  <div
                    key={r.question_id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      r.is_correct ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      r.is_correct ? "bg-emerald-500/30" : "bg-rose-500/30"
                    }`}>
                      {r.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-stone-300">Question {i + 1}</div>
                      {!r.is_correct && (
                        <div className="text-xs text-stone-500">
                          Correct: {r.correct_answer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!results.passed && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 rounded-xl font-serif text-sm flex items-center justify-center gap-2 bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
                <Link
                  href="/campaign/levels"
                  className={`${results.passed ? "flex-1" : ""} py-3 px-6 rounded-xl font-serif text-sm flex items-center justify-center gap-2 bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700 transition-all`}
                >
                  {results.passed ? "Continue" : "Return"}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz gameplay
  const currentQuestion = floorData?.questions[currentQuestionIndex];

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950">
      <div className="fixed inset-0 z-0">
        <Image src={background} alt={`Floor ${floorId}`} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-stone-950/70" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link
            href="/campaign/levels"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/60 backdrop-blur-sm border border-amber-500/30 text-amber-200 hover:bg-stone-950/80 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif">Exit</span>
          </Link>

          <div className="text-center">
            <div className="text-amber-200 font-serif text-sm">Floor {floorId}</div>
            <div className="text-stone-500 text-xs">{floorData?.category}</div>
          </div>

          <div className="text-right">
            <div className="text-amber-200 font-mono text-sm">
              {currentQuestionIndex + 1}/{floorData?.questions.length || 5}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-stone-800 mx-4 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex) / (floorData?.questions.length || 5)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto w-full space-y-6"
              >
                {/* Question prompt */}
                <div className="bg-stone-900/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6">
                  <p className="text-lg sm:text-xl text-stone-100 font-serif leading-relaxed">
                    {currentQuestion.prompt}
                  </p>
                </div>

                {/* Answer choices */}
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice) => (
                    <motion.button
                      key={choice.id}
                      onClick={() => handleSelectAnswer(choice.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                        selectedAnswer === choice.id
                          ? "bg-amber-500/20 border-2 border-amber-500/60 text-amber-100"
                          : "bg-stone-900/60 border border-stone-700/50 text-stone-200 hover:bg-stone-800/60 hover:border-stone-600"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                        selectedAnswer === choice.id
                          ? "bg-amber-500/30 text-amber-200"
                          : "bg-stone-800 text-stone-400"
                      }`}>
                        {choice.id}
                      </div>
                      <span className="flex-1">{choice.text}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer || submitting}
                  className={`w-full py-4 rounded-xl font-serif text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedAnswer
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30"
                      : "bg-stone-800/50 text-stone-600 border border-stone-700/50 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : currentQuestionIndex === (floorData?.questions.length || 5) - 1 ? (
                    "Submit Answers"
                  ) : (
                    "Next Question"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Adventure Flurp */}
      <AdventureFlurp
        isVisible={showFlurp}
        onExpanded={handleFlurpExpanded}
        onAnimationComplete={() => setShowFlurp(false)}
      />
    </div>
  );
}
