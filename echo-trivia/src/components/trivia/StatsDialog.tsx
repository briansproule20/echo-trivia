"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Zap, Check } from "lucide-react";

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizStats: {
    score: number;
    totalQuestions: number;
    percentage: number;
    earnedTitle: string;
    earnedTier: string;
    newAchievements?: Array<{
      achievement: {
        name: string;
        description: string;
      };
    }>;
    streak?: {
      current_streak: number;
      longest_streak: number;
    };
  };
}

export function StatsDialog({
  open,
  onOpenChange,
  quizStats,
}: StatsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Quiz Stats</DialogTitle>
          <DialogDescription>
            Your performance summary for this quiz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Score */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">
                    {quizStats.score}/{quizStats.totalQuestions}
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {quizStats.percentage}%
                </Badge>
              </div>

              {/* Earned Title */}
              <div className="text-center space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">You earned the rank</p>
                <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {quizStats.earnedTitle}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {quizStats.earnedTier}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* New Achievements */}
          {quizStats.newAchievements && quizStats.newAchievements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>New Achievements</span>
              </div>
              <div className="space-y-1.5">
                {quizStats.newAchievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm p-3 bg-muted/50 rounded-md"
                  >
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{achievement.achievement.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streak */}
          {quizStats.streak && quizStats.streak.current_streak > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">Current Streak</div>
                <div className="text-xs text-muted-foreground">
                  {quizStats.streak.current_streak} days
                  {quizStats.streak.longest_streak > quizStats.streak.current_streak && (
                    <span className="ml-2">• Best: {quizStats.streak.longest_streak}</span>
                  )}
                </div>
              </div>
              <Badge variant="secondary">
                {quizStats.streak.current_streak} 🔥
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
