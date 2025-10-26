"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, User } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/supabase-types";

export default function LeaderboardPage() {
  const echo = useEcho();
  const [period, setPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, echo.user?.id]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const echoUserIdParam = echo.user?.id ? `&echo_user_id=${echo.user.id}` : '';
      const response = await fetch(`/api/leaderboard?period=${period}&limit=25${echoUserIdParam}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setUserPosition(data.userPosition || null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
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
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ranked by average quiz score
            </p>
          </div>

          {/* Period Tabs */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
            </TabsList>

            <TabsContent value={period} className="mt-4 sm:mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    {period === 'all' && 'All Time Leaders (Top 25)'}
                    {period === 'monthly' && 'Top 25 This Month'}
                    {period === 'weekly' && 'Top 25 This Week'}
                    {period === 'daily' && 'Top 25 Today'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                      Loading leaderboard...
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                      No entries yet. Be the first to compete!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((entry) => {
                        const isCurrentUser = echo.user?.id === entry.echo_user_id;
                        return (
                          <div
                            key={entry.echo_user_id}
                            className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border ${getRankColor(entry.rank)} ${isCurrentUser && 'ring-2 ring-primary'}`}
                          >
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2 min-w-[2.5rem] sm:min-w-[3rem] shrink-0">
                                {getRankIcon(entry.rank)}
                                {!getRankIcon(entry.rank) && (
                                  <span className="text-base sm:text-lg font-bold text-muted-foreground">
                                    #{entry.rank}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                  <span className="truncate">
                                    {entry.username || `User ${entry.echo_user_id.slice(0, 8)}`}
                                  </span>
                                  {isCurrentUser && (
                                    <Badge variant="default" className="text-xs shrink-0">You</Badge>
                                  )}
                                </div>
                                {entry.total_quizzes && (
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {entry.total_quizzes} {entry.total_quizzes === 1 ? 'quiz' : 'quizzes'}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <Badge variant="secondary" className="text-sm sm:text-lg font-bold">
                                {entry.score.toFixed(1)}%
                              </Badge>
                              {entry.total_correct !== undefined && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {entry.total_correct.toLocaleString()} correct
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* User Position if not in top 25 */}
                      {userPosition && (
                        <>
                          <div className="flex items-center justify-center py-2">
                            <div className="text-sm text-muted-foreground">• • •</div>
                          </div>
                          <div
                            className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border ring-2 ring-primary bg-primary/5`}
                          >
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2 min-w-[2.5rem] sm:min-w-[3rem] shrink-0">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="text-base sm:text-lg font-bold text-primary">
                                  #{userPosition.rank}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                  <span className="truncate">
                                    {userPosition.username || `User ${userPosition.echo_user_id.slice(0, 8)}`}
                                  </span>
                                  <Badge variant="default" className="text-xs shrink-0">You</Badge>
                                </div>
                                {userPosition.total_quizzes && (
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {userPosition.total_quizzes} {userPosition.total_quizzes === 1 ? 'quiz' : 'quizzes'}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <Badge variant="secondary" className="text-sm sm:text-lg font-bold">
                                {userPosition.score.toFixed(1)}%
                              </Badge>
                              {userPosition.total_correct !== undefined && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {userPosition.total_correct.toLocaleString()} correct
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
