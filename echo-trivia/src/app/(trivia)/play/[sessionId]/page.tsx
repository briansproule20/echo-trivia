"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/trivia/QuestionCard";
import { Timer } from "@/components/trivia/Timer";
import { usePlayStore } from "@/lib/store";
import { storage } from "@/lib/storage";
import { getRandomTitle, calculateScore } from "@/lib/quiz-utils";
import { submitWithRetry } from "@/lib/sync-queue";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Submission, Session } from "@/lib/types";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const echo = useEcho();

  const { currentSession, currentQuestionIndex, isPaused, setSession, setQuestionIndex, addSubmission, togglePause, endSession } = usePlayStore();

  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Load session from storage if not in state
    const loadSession = async () => {
      if (!currentSession || currentSession.id !== sessionId) {
        const session = await storage.getSession(sessionId);
        if (session) {
          // Check if quiz is already complete (all questions answered)
          if (session.submissions.length >= session.quiz.questions.length) {
            // If quiz is complete but not finalized (no endedAt), finalize it now
            if (!session.endedAt) {
              console.log('Quiz complete but not finalized, finalizing now...');
              await finalizeSession(session);
            }
            // Quiz is complete, redirect to results
            router.push(`/results/${sessionId}`);
            return;
          }
          setSession(session);
        } else {
          router.push("/");
        }
      }
    };
    loadSession();
  }, [sessionId, currentSession]);

  useEffect(() => {
    // Reset timer when question changes
    setStartTime(Date.now());
    setCurrentSubmission(null);
  }, [currentQuestionIndex]);

  if (!currentSession) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentQuestion = currentSession.quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentSession.quiz.questions.length - 1;
  const hasTimeLimit = currentSession.quiz.questions[0]?.type && currentSession.quiz.questions.length > 0;
  const timePerQuestion = 20; // Default for speedrun

  const handleSubmit = async (response: string) => {
    setIsEvaluating(true);

    try {
      const evalResponse = await fetch("/api/trivia/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          response,
          // Pass auth state - use session's isAuthenticated flag, or check current echo user
          isAuthenticated: currentSession.isAuthenticated ?? !!echo.user,
        }),
      });

      if (!evalResponse.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const result = await evalResponse.json();
      const timeMs = Date.now() - startTime;

      const submission: Submission = {
        questionId: currentQuestion.id,
        response,
        correct: result.correct,
        timeMs,
      };

      addSubmission(submission);
      setCurrentSubmission(submission);

      // Update storage
      const updatedSession = {
        ...currentSession,
        submissions: [...currentSession.submissions, submission],
      };
      await storage.saveSession(updatedSession);
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestionIndex(currentQuestionIndex - 1);
      // Load previous submission if exists
      const prevSubmission = currentSession.submissions.find(
        (s) => s.questionId === currentSession.quiz.questions[currentQuestionIndex - 1].id
      );
      setCurrentSubmission(prevSubmission || null);
    }
  };

  // Helper function to finalize a session (calculate score, save, submit)
  const finalizeSession = async (session: Session) => {
    try {
      // Calculate score and generate title
      const correct = session.submissions.filter((s) => s.correct).length;
      const percentage = calculateScore(session.quiz, session.submissions);
      const { title, tier } = getRandomTitle(percentage);

      const finalSession = {
        ...session,
        endedAt: new Date().toISOString(),
        score: correct,
        earnedTitle: title,
        earnedTier: tier,
      };
      await storage.saveSession(finalSession);

      // Track category performance locally
      await storage.trackCategoryPerformance(finalSession.quiz.category, correct, finalSession.quiz.questions.length);

      // Submit to Supabase in background with retry logic
      // This happens asynchronously - user doesn't wait for it
      if (echo.user?.id) {
        submitWithRetry(finalSession, echo.user.id, echo.user.name || null, sessionId);
      }
    } catch (error) {
      console.error('Error finalizing quiz:', error);
    }
  };

  const handleFinish = async () => {
    // Prevent double submission
    if (isSubmittingQuiz) {
      console.log('Quiz submission already in progress, ignoring duplicate request');
      return;
    }

    setIsSubmittingQuiz(true);
    endSession();

    try {
      await finalizeSession(currentSession);

      // Navigate immediately to results page (don't wait for submission)
      router.push(`/results/${sessionId}`);
    } catch (error) {
      console.error('Error finishing quiz:', error);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleTimeExpire = () => {
    if (!currentSubmission) {
      // Auto-submit as incorrect
      const submission: Submission = {
        questionId: currentQuestion.id,
        response: "",
        correct: false,
        timeMs: timePerQuestion * 1000,
      };
      addSubmission(submission);
      setCurrentSubmission(submission);
      
      // Auto-advance after a second
      setTimeout(() => {
        handleNext();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Bar - Timer for speedrun mode only */}
          {currentSession.quiz.questions.some(() => false) && !currentSubmission && (
            <div className="flex items-center justify-end">
              <Timer
                seconds={timePerQuestion}
                onExpire={handleTimeExpire}
                isPaused={isPaused}
              />
            </div>
          )}

          {/* Question Card */}
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentSession.quiz.questions.length}
            onSubmit={handleSubmit}
            disabled={isEvaluating || isPaused || !!currentSubmission}
            submitted={!!currentSubmission}
            isCorrect={currentSubmission?.correct}
            explanation={currentQuestion.explanation}
          />

          {/* Navigation */}
          {currentSubmission && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleNext} size="lg" disabled={isSubmittingQuiz}>
                {isLastQuestion ? (isSubmittingQuiz ? "Submitting..." : "Finish Quiz") : "Next Question"}
                {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

