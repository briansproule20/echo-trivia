"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (response: string) => void;
  disabled?: boolean;
  submitted?: boolean;
  isCorrect?: boolean;
  explanation?: string;
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
}: QuestionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");

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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <Badge variant="secondary">{question.difficulty}</Badge>
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
                  "w-full justify-start text-left h-auto py-3 px-4",
                  submitted &&
                    choice.id === question.answer &&
                    "border-green-500 bg-green-50 dark:bg-green-950",
                  submitted &&
                    choice.id === selectedChoice &&
                    choice.id !== question.answer &&
                    "border-red-500 bg-red-50 dark:bg-red-950"
                )}
                onClick={() => !disabled && setSelectedChoice(choice.id)}
                disabled={disabled}
              >
                <span className="font-semibold mr-2">{choice.id}.</span>
                {choice.text}
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
                submitted &&
                  question.answer === "true" &&
                  "border-green-500 bg-green-50 dark:bg-green-950",
                submitted &&
                  selectedChoice === "true" &&
                  question.answer !== "true" &&
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
                submitted &&
                  question.answer === "false" &&
                  "border-green-500 bg-green-50 dark:bg-green-950",
                submitted &&
                  selectedChoice === "false" &&
                  question.answer !== "false" &&
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
  );
}

