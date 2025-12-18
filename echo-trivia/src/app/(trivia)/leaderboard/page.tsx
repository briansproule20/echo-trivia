"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trophy, Medal, Award, User, HelpCircle, Zap, Swords, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/supabase-types";

interface EloEntry {
  echo_user_id: string
  username: string | null
  avatar_url: string | null
  skill_rating: number
  total_quizzes: number
  avg_score: number
  rank: number
}

export default function LeaderboardPage() {
  const echo = useEcho();
  const [period, setPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [rankBy, setRankBy] = useState<'avg_score' | 'total_correct' | 'total_quizzes'>('avg_score');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'elo'>('leaderboard');
  const [eloLeaderboard, setEloLeaderboard] = useState<EloEntry[]>([]);
  const [eloUserPosition, setEloUserPosition] = useState<EloEntry | null>(null);
  const [eloLoading, setEloLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else {
      fetchEloLeaderboard();
    }
  }, [period, rankBy, echo.user?.id, activeTab]);

  const fetchEloLeaderboard = async () => {
    setEloLoading(true);
    try {
      const echoUserIdParam = echo.user?.id ? `&echo_user_id=${echo.user.id}` : '';
      const response = await fetch(`/api/leaderboard/elo?limit=25${echoUserIdParam}`);
      if (!response.ok) throw new Error('Failed to fetch ELO leaderboard');

      const data = await response.json();
      setEloLeaderboard(data.leaderboard || []);
      setEloUserPosition(data.userPosition || null);
    } catch (error) {
      console.error('Error fetching ELO leaderboard:', error);
    } finally {
      setEloLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const echoUserIdParam = echo.user?.id ? `&echo_user_id=${echo.user.id}` : '';
      const response = await fetch(`/api/leaderboard?period=${period}&rank_by=${rankBy}&limit=25${echoUserIdParam}`);
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
            {activeTab === 'leaderboard' && period !== 'daily' && (
              <p className="text-xs sm:text-sm text-muted-foreground/80">
                Not seeing yourself? Ensure you have played 5 quizzes to appear on the global leaderboards.
              </p>
            )}
            {activeTab === 'elo' && (
              <p className="text-xs sm:text-sm text-muted-foreground/80">
                Skill Index based on quiz difficulty and performance. 5 quizzes minimum to qualify.
              </p>
            )}
          </div>

          {/* Main Tab Switcher */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-auto p-1">
              <TabsTrigger value="leaderboard" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="elo" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Skill Index</span>
                <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">BETA</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Standard Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-6 space-y-6">
              {/* Ranking Method Selector */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Rank by:</span>
                <Select value={rankBy} onValueChange={(value) => setRankBy(value as typeof rankBy)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avg_score">Average Score</SelectItem>
                    <SelectItem value="total_correct">Total Correct</SelectItem>
                    <SelectItem value="total_quizzes">Total Quizzes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Period Tabs */}
              <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                  <TabsTrigger value="all" className="text-xs sm:text-sm py-1.5 sm:py-2">All Time</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs sm:text-sm py-1.5 sm:py-2">Monthly</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs sm:text-sm py-1.5 sm:py-2">Weekly</TabsTrigger>
                  <TabsTrigger value="daily" className="text-xs sm:text-sm py-1.5 sm:py-2">Daily</TabsTrigger>
                </TabsList>

            <TabsContent value={period} className="mt-4 sm:mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl">
                      {period === 'all' && 'All Time Leaders (Top 25)'}
                      {period === 'monthly' && 'Top 25 This Month'}
                      {period === 'weekly' && 'Top 25 This Week'}
                      {period === 'daily' && 'Top 25 Today'}
                    </CardTitle>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 hover:bg-muted rounded-full"
                          aria-label="How leaderboards work"
                        >
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[320px] sm:w-[380px]">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-base leading-none">How Leaderboards Work</h4>
                            <p className="text-sm text-muted-foreground">
                              Compete with players around the world
                            </p>
                          </div>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex gap-2">
                              <Trophy className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Daily Challenges Only</p>
                                <p className="text-xs text-muted-foreground">Only your daily challenge scores count toward leaderboard rankings</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Freeplay Tracking</p>
                                <p className="text-xs text-muted-foreground">Freeplay quizzes are tracked privately in your profile and dashboard</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Qualification</p>
                                <p className="text-xs text-muted-foreground">Minimum 5 daily challenges required for All Time, Monthly, and Weekly boards</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
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
                                {rankBy === 'avg_score'
                                  ? `${entry.score.toFixed(1)}%`
                                  : rankBy === 'total_correct'
                                  ? entry.total_correct?.toLocaleString() || '0'
                                  : `${entry.total_quizzes} ${entry.total_quizzes === 1 ? 'quiz' : 'quizzes'}`
                                }
                              </Badge>
                              {rankBy === 'avg_score' && entry.total_correct !== undefined && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {entry.total_correct.toLocaleString()} correct
                                </span>
                              )}
                              {rankBy === 'total_correct' && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {entry.score.toFixed(1)}% avg
                                </span>
                              )}
                              {rankBy === 'total_quizzes' && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {entry.score.toFixed(1)}% avg
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
                                {rankBy === 'avg_score'
                                  ? `${userPosition.score.toFixed(1)}%`
                                  : rankBy === 'total_correct'
                                  ? userPosition.total_correct?.toLocaleString() || '0'
                                  : `${userPosition.total_quizzes} ${userPosition.total_quizzes === 1 ? 'quiz' : 'quizzes'}`
                                }
                              </Badge>
                              {rankBy === 'avg_score' && userPosition.total_correct !== undefined && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {userPosition.total_correct.toLocaleString()} correct
                                </span>
                              )}
                              {rankBy === 'total_correct' && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {userPosition.score.toFixed(1)}% avg
                                </span>
                              )}
                              {rankBy === 'total_quizzes' && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {userPosition.score.toFixed(1)}% avg
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
            </TabsContent>

            {/* Skill Index (ELO) Tab */}
            <TabsContent value="elo" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        Skill Index Rankings
                        <Badge variant="outline" className="text-xs">All Time</Badge>
                      </CardTitle>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 hover:bg-muted rounded-full"
                          aria-label="How Skill Index works"
                        >
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[320px] sm:w-[400px]">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-base leading-none">Skill Index Algorithm</h4>
                            <p className="text-sm text-muted-foreground">
                              An ELO-inspired rating system for trivia
                            </p>
                          </div>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex gap-2">
                              <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Starting Rating: 1000</p>
                                <p className="text-xs text-muted-foreground">Everyone begins at 1000 points</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Difficulty Matters</p>
                                <p className="text-xs text-muted-foreground">Hard quizzes: expected 45% (more points for beating it). Medium: 60%. Easy: 75%</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Trophy className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Performance vs Expected</p>
                                <p className="text-xs text-muted-foreground">Beat expectations = gain points. Underperform = lose points</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">All Quizzes Count</p>
                                <p className="text-xs text-muted-foreground">Unlike the leaderboard, freeplay and daily quizzes both affect your Skill Index</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  {eloLoading ? (
                    <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                      Loading Skill Index...
                    </div>
                  ) : eloLeaderboard.length === 0 ? (
                    <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                      No entries yet. Complete 5 quizzes to appear!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eloLeaderboard.map((entry) => {
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
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {entry.total_quizzes} quizzes · {entry.avg_score.toFixed(1)}% avg
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <Badge variant="secondary" className="text-sm sm:text-lg font-bold font-mono">
                                {entry.skill_rating}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                skill rating
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* User Position if not in top 25 */}
                      {eloUserPosition && (
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
                                  #{eloUserPosition.rank}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                  <span className="truncate">
                                    {eloUserPosition.username || `User ${eloUserPosition.echo_user_id.slice(0, 8)}`}
                                  </span>
                                  <Badge variant="default" className="text-xs shrink-0">You</Badge>
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {eloUserPosition.total_quizzes} quizzes · {eloUserPosition.avg_score.toFixed(1)}% avg
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <Badge variant="secondary" className="text-sm sm:text-lg font-bold font-mono">
                                {eloUserPosition.skill_rating}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                skill rating
                              </span>
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

          {/* Other Leaderboards Section */}
          <div className="mt-8 pt-8 border-t">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Looking for other leaderboards?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/faceoff/hub">
                    <Swords className="mr-2 h-4 w-4" />
                    Face-Off Leaderboards
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/survival">
                    <Flame className="mr-2 h-4 w-4" />
                    Survival Leaderboards
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
