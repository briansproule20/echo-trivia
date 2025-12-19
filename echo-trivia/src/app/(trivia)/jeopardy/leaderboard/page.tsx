"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Trophy,
  Medal,
  Award,
  Loader2,
  ArrowLeft,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  echo_user_id: string;
  username: string | null;
  avatar_url: string | null;
  score: number;
  questions_correct: number;
  questions_answered: number;
  categories: string[];
  ended_at: string;
  rank: number;
}

export default function JeopardyLeaderboardPage() {
  const router = useRouter();
  const echo = useEcho();
  const [boardSize, setBoardSize] = useState<3 | 5>(5);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [boardSize, echo.user?.id]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const userParam = echo.user?.id ? `&echo_user_id=${echo.user.id}` : "";
      const res = await fetch(`/api/jeopardy/leaderboard?board_size=${boardSize}${userParam}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setUserPosition(data.userPosition || null);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200";
    if (rank === 2) return "bg-gray-50 dark:bg-gray-950/20 border-gray-200";
    if (rank === 3) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200";
    return "bg-background";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/jeopardy")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Badge variant="default" className="text-xs">Beta</Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <LayoutGrid className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">Jeopardy Leaderboard</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Top scores across all players
            </p>
          </div>

          {/* Board Size Tabs */}
          <Tabs value={String(boardSize)} onValueChange={(v) => setBoardSize(parseInt(v) as 3 | 5)}>
            <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto">
              <TabsTrigger value="3">3 Categories</TabsTrigger>
              <TabsTrigger value="5">5 Categories</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* User's Position */}
          {userPosition && !leaderboard.find(e => e.echo_user_id === echo.user?.id) && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground w-8">
                    #{userPosition.rank}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {userPosition.avatar_url ? (
                      <img src={userPosition.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {userPosition.username || "Anonymous"} (You)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {userPosition.questions_correct}/{userPosition.questions_answered} correct
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-lg font-bold",
                    userPosition.score >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    <Zap className="h-4 w-4" />
                    {userPosition.score >= 0 ? "+" : ""}{userPosition.score}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No games completed yet</p>
                  <p className="text-sm">Be the first to set a high score!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.echo_user_id === echo.user?.id;
                    return (
                      <motion.div
                        key={entry.echo_user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          getRankColor(entry.rank),
                          isCurrentUser && "ring-2 ring-primary"
                        )}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank) || (
                            <span className="text-sm font-medium text-muted-foreground">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {entry.username || "Anonymous"}
                            {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.questions_correct}/{entry.questions_answered} correct
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-lg font-bold",
                          entry.score >= 0 ? "text-primary" : "text-destructive"
                        )}>
                          <Zap className="h-4 w-4" />
                          {entry.score >= 0 ? "+" : ""}{entry.score}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Play Button */}
          <Button onClick={() => router.push("/jeopardy")} className="w-full" size="lg">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Play Jeopardy
          </Button>
        </div>
      </div>
    </div>
  );
}
