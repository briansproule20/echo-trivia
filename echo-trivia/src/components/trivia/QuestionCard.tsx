"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CorrectAnswerFlurp } from "./CorrectAnswerFlurp";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (response: string) => void;
  disabled?: boolean;
  submitted?: boolean;
  isCorrect?: boolean;
  explanation?: string;
  correctAnswer?: string; // The correct answer, only available after submission
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  disabled = false,
  submitted = false,
  isCorrect,
  explanation,
  correctAnswer,
}: QuestionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [showFlurp, setShowFlurp] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedChoice("");
    setShortAnswer("");
    setShowFlurp(false);
  }, [question.id]);

  // Trigger flurp animation when answer is correct
  useEffect(() => {
    if (submitted && isCorrect) {
      setShowFlurp(true);
      // Hide after animation completes
      const timer = setTimeout(() => setShowFlurp(false), 1300);
      return () => clearTimeout(timer);
    }
  }, [submitted, isCorrect]);

  const handleSubmit = () => {
    if (question.type === "short_answer") {
      onSubmit(shortAnswer);
    } else {
      onSubmit(selectedChoice);
    }
  };

  const canSubmit =
    question.type === "short_answer" ? shortAnswer.trim() !== "" : selectedChoice !== "";

  return (
    <>
      <CorrectAnswerFlurp isVisible={showFlurp} />
      <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Question {questionNumber} of {totalQuestions}
          </Badge>
        </div>
        <CardTitle className="text-xl">{question.prompt}</CardTitle>
        <CardDescription>{question.category}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Multiple Choice */}
        {question.type === "multiple_choice" && question.choices && (
          <div className="space-y-2">
            {question.choices.map((choice) => (
              <Button
                key={choice.id}
                variant={selectedChoice === choice.id ? "default" : "outline"}
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-4 whitespace-normal",
                  // Highlight correct answer (from server) after submission
                  submitted &&
                    correctAnswer &&
                    choice.id === correctAnswer &&
                    "border-green-500 bg-green-50 dark:bg-green-950",
                  // Highlight user's incorrect selection
                  submitted &&
                    correctAnswer &&
                    choice.id === selectedChoice &&
                    choice.id !== correctAnswer &&
                    "border-red-500 bg-red-50 dark:bg-red-950"
                )}
                onClick={() => !disabled && setSelectedChoice(choice.id)}
                disabled={disabled}
              >
                <span className="font-semibold mr-2 shrink-0">{choice.id}.</span>
                <span className="break-words">{choice.text}</span>
              </Button>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.type === "true_false" && (
          <div className="flex gap-4">
            <Button
              variant={selectedChoice === "true" ? "default" : "outline"}
              className={cn(
                "flex-1 h-20 text-lg",
                // Highlight correct answer (from server) after submission
                submitted &&
                  correctAnswer &&
                  correctAnswer.toLowerCase() === "true" &&
                  "border-green-500 bg-green-50 dark:bg-green-950",
                submitted &&
                  correctAnswer &&
                  selectedChoice === "true" &&
                  correctAnswer.toLowerCase() !== "true" &&
                  "border-red-500 bg-red-50 dark:bg-red-950"
              )}
              onClick={() => !disabled && setSelectedChoice("true")}
              disabled={disabled}
            >
              True
            </Button>
            <Button
              variant={selectedChoice === "false" ? "default" : "outline"}
              className={cn(
                "flex-1 h-20 text-lg",
                // Highlight correct answer (from server) after submission
                submitted &&
                  correctAnswer &&
                  correctAnswer.toLowerCase() === "false" &&
                  "border-green-500 bg-green-50 dark:bg-green-950",
                submitted &&
                  correctAnswer &&
                  selectedChoice === "false" &&
                  correctAnswer.toLowerCase() !== "false" &&
                  "border-red-500 bg-red-50 dark:bg-red-950"
              )}
              onClick={() => !disabled && setSelectedChoice("false")}
              disabled={disabled}
            >
              False
            </Button>
          </div>
        )}

        {/* Short Answer */}
        {question.type === "short_answer" && (
          <div>
            <Input
              placeholder="Type answer here..."
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={disabled}
              className="text-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit && !disabled) {
                  handleSubmit();
                }
              }}
            />
          </div>
        )}

        {/* Feedback */}
        {submitted && (
          <div
            className={cn(
              "p-4 rounded-lg border",
              isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950"
            )}
          >
            <div className="flex items-center space-x-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>
            {question.type === "short_answer" && correctAnswer && (
              <p className="text-base font-medium mb-2">
                Answer: <span className="text-foreground">{correctAnswer}</span>
              </p>
            )}
            {explanation && (
              <p className="text-sm text-muted-foreground">{explanation}</p>
            )}
          </div>
        )}
      </CardContent>

      {!submitted && (
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || disabled}
            className="w-full"
            size="lg"
          >
            Submit Answer
          </Button>
        </CardFooter>
      )}
    </Card>
    </>
  );
}

