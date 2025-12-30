"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Target, Flame, Clock, Award, BarChart3, ArrowRight, Swords, Zap, Star, Castle, HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { UserStats, UserAchievement, DailyStreak, SurvivalStats, QuizSession } from "@/lib/supabase-types";
import type { JeopardyStats } from "@/app/api/jeopardy/stats/route";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export default function ProfilePage() {
  const echo = useEcho();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [streak, setStreak] = useState<DailyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState("");
  const [faceoffStats, setFaceoffStats] = useState({ played: 0 });
  const [survivalStats, setSurvivalStats] = useState<SurvivalStats | null>(null);
  const [jeopardyStats, setJeopardyStats] = useState<JeopardyStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryQuizzes, setCategoryQuizzes] = useState<QuizSession[]>([]);
  const [towerProgress, setTowerProgress] = useState<{
    currentFloor: number;
    highestFloor: number;
    tier: number;
    tierName: string;
    totalFloors: number;
    hasStarted: boolean;
  } | null>(null);
  const [towerAchievements, setTowerAchievements] = useState<{
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      lore_text: string;
      category: string;
      icon: string;
      tier: string;
      is_hidden: boolean;
      unlocked: boolean;
      earned_at: string | null;
      floor_earned: number | null;
    }>;
    unlockedCount: number;
    totalCount: number;
  } | null>(null);
  const [towerAchievementsExpanded, setTowerAchievementsExpanded] = useState(false);

  useEffect(() => {
    if (echo.user?.id) {
      fetchUserData();
    }
  }, [echo.user?.id]);

  const fetchUserData = async () => {
    if (!echo.user?.id) return;

    setLoading(true);
    try {
      // Fetch user profile
      const profileRes = await fetch(`/api/user/profile?echo_user_id=${echo.user.id}`);
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.user) {
          setCurrentUsername(data.user.username || "");
        }
      }

      // Fetch stats
      const statsRes = await fetch(`/api/user/stats?echo_user_id=${echo.user.id}`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        setFaceoffStats({ played: data.faceoffCount || 0 });
      }

      // Fetch achievements
      const achievementsRes = await fetch(`/api/achievements/user?echo_user_id=${echo.user.id}`);
      if (achievementsRes.ok) {
        const data = await achievementsRes.json();
        setAchievements(data.achievements);
      }

      // Fetch streak
      const streakRes = await fetch(`/api/streak?echo_user_id=${echo.user.id}`);
      if (streakRes.ok) {
        const data = await streakRes.json();
        setStreak(data.streak);
      }

      // Fetch survival stats
      const survivalRes = await fetch(`/api/survival/stats?echo_user_id=${echo.user.id}`);
      if (survivalRes.ok) {
        const data = await survivalRes.json();
        setSurvivalStats(data);
      }

      // Fetch jeopardy stats
      const jeopardyRes = await fetch(`/api/jeopardy/stats?echo_user_id=${echo.user.id}`);
      if (jeopardyRes.ok) {
        const data = await jeopardyRes.json();
        setJeopardyStats(data);
      }

      // Fetch tower progress
      const towerRes = await fetch(`/api/tower/progress?echo_user_id=${echo.user.id}`);
      if (towerRes.ok) {
        const data = await towerRes.json();
        setTowerProgress(data);
      }

      // Sync and fetch tower achievements
      await fetch('/api/tower/sync-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ echo_user_id: echo.user.id }),
      });

      const towerAchievementsRes = await fetch(`/api/tower/achievements?echo_user_id=${echo.user.id}`);
      if (towerAchievementsRes.ok) {
        const data = await towerAchievementsRes.json();
        setTowerAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category: string) => {
    if (!echo.user?.id) return;

    setSelectedCategory(category);

    try {
      const response = await fetch(`/api/user/category-history?echo_user_id=${echo.user.id}&category=${encodeURIComponent(category)}`);
      if (response.ok) {
        const data = await response.json();
        setCategoryQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Error fetching category quizzes:', error);
    }
  };

  if (!echo.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please sign in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="text-center mb-6 space-y-4">
            <Badge variant="secondary" className="mb-2">
              Profile
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Welcome back,{' '}
              <AnimatedGradientText>
                {currentUsername || 'Traveler'}
              </AnimatedGradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your trivia journey and achievements
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.total_quizzes || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Accuracy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.accuracy_rate.toFixed(1) || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  <span className="text-2xl sm:text-3xl font-bold">{streak?.current_streak || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Best: {streak?.longest_streak || 0} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Time Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <span className="text-2xl sm:text-3xl font-bold">
                    {formatTime(stats?.total_time_played || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Mode Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Faceoffs Played
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Beta</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <span className="text-2xl sm:text-3xl font-bold">{faceoffStats.played}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Challenges completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Survival Best
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Beta</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-2xl sm:text-3xl font-bold">
                    {survivalStats?.mixed_best_streak || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {survivalStats?.total_runs ? `${survivalStats.total_runs} runs` : 'Best streak'}
                  {survivalStats?.mixed_rank && ` · Rank #${survivalStats.mixed_rank}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Jeopardy Best
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Beta</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  <span className="text-2xl sm:text-3xl font-bold">
                    {jeopardyStats?.best_score_5 !== null
                      ? jeopardyStats?.best_score_5
                      : jeopardyStats?.best_score_3 !== null
                        ? jeopardyStats?.best_score_3
                        : 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {jeopardyStats?.total_games ? `${jeopardyStats.total_games} games` : 'Best score'}
                  {(jeopardyStats?.rank_5 || jeopardyStats?.rank_3) && ` · Rank #${jeopardyStats?.rank_5 || jeopardyStats?.rank_3}`}
                </p>
              </CardContent>
            </Card>

            <Link href="/campaign">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Tower Floor
                    </CardTitle>
                    {towerProgress?.hasStarted && (
                      <Badge variant="secondary" className="text-xs">
                        Tier {towerProgress.tier}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Castle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                    <span className="text-2xl sm:text-3xl font-bold">
                      {towerProgress?.highestFloor || 1}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {towerProgress?.hasStarted
                      ? towerProgress.tierName
                      : "Start your ascent"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Dashboard CTA */}
          <Link href="/dashboard" className="block">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-2 sm:gap-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-primary">
                  View detailed analytics and visualizations
                </span>
              </div>
              <Button variant="outline" size="sm" className="pointer-events-none">
                Dashboard
              </Button>
            </div>
          </Link>

          {/* Tabs */}
          <Tabs defaultValue="stats" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="stats" className="text-sm sm:text-base">
                Statistics
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-sm sm:text-base">
                Achievements ({achievements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4 sm:space-y-6">
              {/* Detailed Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span>Average Score</span>
                      <span className="font-medium">{stats?.average_score.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats?.average_score || 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t">
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Perfect Scores</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {stats?.perfect_scores || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Questions Answered</div>
                      <div className="text-xl sm:text-2xl font-bold">{stats?.total_questions || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Correct Answers</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {stats?.correct_answers || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl">Category Insights</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="rounded-full p-1.5 hover:bg-accent transition-colors">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>About Category Insights</DialogTitle>
                          <DialogDescription>
                            Understanding your category statistics
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4 text-sm text-muted-foreground">
                          <p>
                            Categories are tracked across all game modes, including Freeplay sessions and Daily Challenges.
                          </p>
                          <p>
                            If you notice duplicate entries, this may occur when the same category appears in both modes—each is recorded separately to preserve your complete quiz history.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">Recent Category</div>
                      <Badge
                        variant="outline"
                        className={`text-sm sm:text-base ${stats?.recent_category ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
                        onClick={() => stats?.recent_category && handleCategoryClick(stats.recent_category)}
                      >
                        {stats?.recent_category || 'None yet'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Last played</p>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">Favorite Category</div>
                      <Badge
                        variant="secondary"
                        className={`text-sm sm:text-base ${stats?.favorite_category ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
                        onClick={() => stats?.favorite_category && handleCategoryClick(stats.favorite_category)}
                      >
                        {stats?.favorite_category || 'None yet'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Most played</p>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">Best Category</div>
                      <Badge
                        variant="default"
                        className={`text-sm sm:text-base ${stats?.best_category ? 'cursor-pointer hover:bg-primary/80 transition-colors' : ''}`}
                        onClick={() => stats?.best_category && handleCategoryClick(stats.best_category)}
                      >
                        {stats?.best_category || 'None yet'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Highest accuracy</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                      Categories Explored
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stats?.categories_played.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-xs sm:text-sm cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => handleCategoryClick(cat)}
                        >
                          {cat}
                        </Badge>
                      ))}
                      {(!stats?.categories_played || stats.categories_played.length === 0) && (
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Start playing to explore categories
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Your Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm sm:text-base">No achievements yet. Complete quizzes to earn them!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {achievements.map((userAchievement) => {
                        const achievement = userAchievement.achievement;
                        if (!achievement) return null;

                        const tierColors = {
                          bronze: 'border-amber-700 bg-amber-50 dark:bg-amber-950/20',
                          silver: 'border-gray-400 bg-gray-50 dark:bg-gray-950/20',
                          gold: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                          platinum: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
                        };

                        return (
                          <div
                            key={userAchievement.id}
                            className={`p-3 sm:p-4 rounded-lg border ${tierColors[achievement.tier as keyof typeof tierColors]}`}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="text-2xl sm:text-3xl">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-sm sm:text-base">{achievement.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {achievement.tier}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                  {achievement.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Earned{' '}
                                  {new Date(userAchievement.earned_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lifetime Achievements - from tower achievements */}
              {towerAchievements?.achievements && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">Lifetime Achievements</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Based on total correct answers across all game modes
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {towerAchievements.achievements
                        .filter((a) => a.category === 'lifetime')
                        .map((achievement) => {
                          const tierColors = {
                            bronze: achievement.unlocked
                              ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20'
                              : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                            silver: achievement.unlocked
                              ? 'border-gray-400 bg-gray-100 dark:bg-gray-800/40'
                              : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                            gold: achievement.unlocked
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                              : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                            platinum: achievement.unlocked
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                              : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                          };

                          return (
                            <div
                              key={achievement.id}
                              className={`p-3 sm:p-4 rounded-lg border ${
                                tierColors[achievement.tier as keyof typeof tierColors]
                              } ${!achievement.unlocked && 'opacity-60'}`}
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className={`text-2xl sm:text-3xl ${!achievement.unlocked && 'grayscale'}`}>
                                  {achievement.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-sm sm:text-base">{achievement.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {achievement.tier}
                                    </Badge>
                                    {!achievement.unlocked && (
                                      <Badge variant="secondary" className="text-xs">
                                        🔒
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                    {achievement.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground/70 italic">
                                    &quot;{achievement.lore_text}&quot;
                                  </p>
                                  {achievement.unlocked && achievement.earned_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Campaign Achievements Dropdown */}
          <Card className="border-indigo-500/20">
            <button
              onClick={() => setTowerAchievementsExpanded(!towerAchievementsExpanded)}
              className="w-full"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Castle className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-lg sm:text-xl">
                      Campaign Achievements
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {towerAchievements?.unlockedCount || 0}/{towerAchievements?.totalCount || 25}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      towerAchievementsExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CardHeader>
            </button>
            {towerAchievementsExpanded && (
              <CardContent className="pt-0">
                {towerAchievements?.achievements && towerAchievements.achievements.length > 0 ? (
                  <div className="space-y-6">
                    {/* Group by category */}
                    {(['milestone', 'performance', 'mastery', 'special'] as const).map((category) => {
                      const categoryAchievements = towerAchievements.achievements.filter(
                        (a) => a.category === category
                      );
                      if (categoryAchievements.length === 0) return null;

                      const categoryLabels = {
                        milestone: { title: 'Milestone Achievements', subtitle: 'Markers of your ascent through the Archive' },
                        performance: { title: 'Performance Achievements', subtitle: 'Proof of precision in the work' },
                        mastery: { title: 'Category Mastery', subtitle: 'Deep knowledge in the specialized stacks' },
                        special: { title: 'Special Condition', subtitle: 'Achievements for the dedicated and the daring' },
                      };

                      return (
                        <div key={category}>
                          <div className="mb-3">
                            <h3 className="text-sm font-semibold text-foreground">
                              {categoryLabels[category].title}
                            </h3>
                            <p className="text-xs text-muted-foreground italic">
                              {categoryLabels[category].subtitle}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryAchievements.map((achievement) => {
                              const tierColors = {
                                bronze: achievement.unlocked
                                  ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20'
                                  : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                                silver: achievement.unlocked
                                  ? 'border-gray-400 bg-gray-100 dark:bg-gray-800/40'
                                  : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                                gold: achievement.unlocked
                                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                                  : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                                platinum: achievement.unlocked
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                                  : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                              };

                              return (
                                <div
                                  key={achievement.id}
                                  className={`p-3 rounded-lg border ${
                                    tierColors[achievement.tier as keyof typeof tierColors]
                                  } ${!achievement.unlocked && 'opacity-60'}`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`text-2xl ${!achievement.unlocked && 'grayscale'}`}>
                                      {achievement.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {achievement.tier}
                                        </Badge>
                                        {!achievement.unlocked && (
                                          <Badge variant="secondary" className="text-xs">
                                            🔒
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {achievement.description}
                                      </p>
                                      <p className="text-xs text-muted-foreground/70 italic">
                                        &quot;{achievement.lore_text}&quot;
                                      </p>
                                      {achievement.unlocked && achievement.earned_at && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Earned {new Date(achievement.earned_at).toLocaleDateString()}
                                          {achievement.floor_earned && ` on Floor ${achievement.floor_earned}`}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Castle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      Start climbing the Tower to earn campaign achievements!
                    </p>
                    <Link href="/campaign">
                      <Button variant="outline" size="sm" className="mt-3">
                        Begin Your Ascent
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Category Quiz History Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedCategory}</DialogTitle>
            <DialogDescription className="text-sm">
              Your quiz history for this category
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {categoryQuizzes.length > 0 ? (
              <div className="space-y-3">
                {categoryQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={quiz.score_percentage === 100 ? "default" : quiz.score_percentage >= 70 ? "secondary" : "outline"}
                            className="font-mono text-sm"
                          >
                            {quiz.score_percentage.toFixed(0)}%
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {quiz.correct_answers}/{quiz.total_questions} correct
                          </span>
                          {quiz.title && (
                            <span className="text-xs text-muted-foreground">• {quiz.title}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>
                            {new Date(quiz.completed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>{quiz.num_questions} questions</span>
                          {quiz.time_taken && (
                            <>
                              <span>•</span>
                              <span>{Math.floor(quiz.time_taken / 60)}:{(quiz.time_taken % 60).toString().padStart(2, '0')}</span>
                            </>
                          )}
                          {quiz.difficulty && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{quiz.difficulty}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl flex-shrink-0">
                        {quiz.score_percentage === 100 ? '💯' :
                         quiz.score_percentage >= 90 ? '🌟' :
                         quiz.score_percentage >= 70 ? '👍' :
                         quiz.score_percentage >= 50 ? '📈' : '💪'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No quizzes found for this category
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
