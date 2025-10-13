"use client";

import { Card } from "@/components/ui/card";
import { Trophy, Target, Clock } from "lucide-react";

interface ScoreBannerProps {
  score: number;
  totalQuestions: number;
  timeElapsed?: number;
}

export function ScoreBanner({ score, totalQuestions, timeElapsed }: ScoreBannerProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const accuracy = percentage;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: "A+", color: "text-green-600", emoji: "🏆" };
    if (pct >= 80) return { grade: "A", color: "text-green-500", emoji: "🌟" };
    if (pct >= 70) return { grade: "B", color: "text-blue-500", emoji: "✨" };
    if (pct >= 60) return { grade: "C", color: "text-yellow-500", emoji: "👍" };
    return { grade: "D", color: "text-orange-500", emoji: "📚" };
  };

  const { grade, color, emoji } = getGrade(accuracy);

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="space-y-6">
        <div className="text-6xl">{emoji}</div>
        <div>
          <div className={`text-6xl font-bold ${color} mb-2`}>{percentage}%</div>
          <div className="text-2xl font-semibold text-muted-foreground mb-1">
            Grade: {grade}
          </div>
        </div>

        <div className="flex justify-center gap-8 text-sm">
          <div className="flex flex-col items-center">
            <Target className="h-5 w-5 text-muted-foreground mb-1" />
            <div className="font-semibold">
              {score} / {totalQuestions}
            </div>
            <div className="text-muted-foreground">Correct</div>
          </div>

          {timeElapsed && (
            <div className="flex flex-col items-center">
              <Clock className="h-5 w-5 text-muted-foreground mb-1" />
              <div className="font-semibold">{Math.round(timeElapsed / 1000)}s</div>
              <div className="text-muted-foreground">Time</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

