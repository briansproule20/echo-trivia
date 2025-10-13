"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/trivia/QuestionCard";
import { ProgressBar } from "@/components/trivia/ProgressBar";
import { Timer } from "@/components/trivia/Timer";
import { usePlayStore } from "@/lib/store";
import { storage } from "@/lib/storage";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Submission } from "@/lib/types";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const { currentSession, currentQuestionIndex, isPaused, setSession, setQuestionIndex, addSubmission, togglePause, endSession } = usePlayStore();
  
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Load session from storage if not in state
    const loadSession = async () => {
      if (!currentSession || currentSession.id !== sessionId) {
        const session = await storage.getSession(sessionId);
        if (session) {
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

  const handleFinish = async () => {
    endSession();
    const finalSession = {
      ...currentSession,
      endedAt: new Date().toISOString(),
      score: currentSession.submissions.filter((s) => s.correct).length,
    };
    await storage.saveSession(finalSession);
    
    // Track category performance
    const correct = finalSession.submissions.filter((s) => s.correct).length;
    await storage.trackCategoryPerformance(finalSession.quiz.category, correct, finalSession.quiz.questions.length);
    
    router.push(`/results/${sessionId}`);
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
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={currentSession.quiz.questions.length}
            />
            
            <div className="flex items-center space-x-3">
              {/* Timer for speedrun */}
              {currentSession.quiz.questions.some(() => false) && !currentSubmission && (
                <Timer
                  seconds={timePerQuestion}
                  onExpire={handleTimeExpire}
                  isPaused={isPaused}
                />
              )}
              
              {/* Pause button */}
              <Button
                variant="outline"
                size="icon"
                onClick={togglePause}
                className="h-10 w-10"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          </div>

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

              <Button onClick={handleNext} size="lg">
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
                {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

