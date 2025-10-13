"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Quiz } from "@/lib/types";
import { Calendar, Target, TrendingUp } from "lucide-react";

interface QuizCardProps {
  quiz: Quiz;
  onStart?: () => void;
  showDate?: boolean;
}

export function QuizCard({ quiz, onStart, showDate }: QuizCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription>{quiz.description}</CardDescription>
            )}
          </div>
          <Badge variant="secondary">{quiz.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Target className="mr-1 h-4 w-4" />
            {quiz.questions.length} questions
          </div>
          {quiz.seeded && (
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Daily
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}

