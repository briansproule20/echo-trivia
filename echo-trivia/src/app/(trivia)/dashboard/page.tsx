"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipProps } from "recharts";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { Trophy, Target, Flame, Clock, Award, HelpCircle, Shuffle, Zap, ChevronDown, Castle, Grid3X3, Swords } from "lucide-react";
import type { UserStats, UserAchievement, DailyStreak, QuizSession, Achievement, SurvivalStats } from "@/lib/supabase-types";
import { CATEGORIES } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ActivityHeatmap } from "@/components/trivia/ActivityHeatmap";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

// Custom tooltip component for Recharts that matches shadcn UI theme
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border bg-popover p-2.5 shadow-md text-popover-foreground">
      <div className="grid gap-1.5">
        {label && (
          <p className="text-[0.7rem] sm:text-xs font-medium">{label}</p>
        )}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-[0.7rem] sm:text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-[0.7rem] sm:text-xs font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const echo = useEcho();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<DailyStreak | null>(null);
  const [recentSessions, setRecentSessions] = useState<QuizSession[]>([]);
  const [categoryCount, setCategoryCount] = useState<Record<string, number>>({});
  const [categoryPerformance, setCategoryPerformance] = useState<Array<{ category: string; score: number; count: number }>>([]);
  const [categoryMastery, setCategoryMastery] = useState<Array<{ category: string; avgScore: number; count: number; mastery: string; lastPlayed: string | null }>>([]);
  const [dayOfWeekActivity, setDayOfWeekActivity] = useState<Record<number, { count: number; avgScore: number; totalScore: number }>>({});
  const [radarData, setRadarData] = useState<Array<{ metric: string; value: number }>>([]);
  const [scoreTrend, setScoreTrend] = useState<Array<{ session: number; score: number; date: string; category: string }>>([]);
  const [difficultyPerformance, setDifficultyPerformance] = useState<Array<{ difficulty: string; score: number; category: string; timeTaken: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState("");
  const [showRandomCategories, setShowRandomCategories] = useState(false);
  const [shuffledCategories, setShuffledCategories] = useState<typeof categoryPerformance>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryQuizzes, setCategoryQuizzes] = useState<QuizSession[]>([]);
  const [dailyActivityMap, setDailyActivityMap] = useState<Record<string, { count: number; avgScore: number; totalScore: number }>>({});
  const [survivalStats, setSurvivalStats] = useState<SurvivalStats | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [towerAchievements, setTowerAchievements] = useState<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
    category: string;
    unlocked: boolean;
  }>>([]);
  const [towerProgress, setTowerProgress] = useState<{
    currentFloor: number;
    highestFloor: number;
    tier: number;
    tierName: string;
    difficulty: string;
    category: string;
    totalFloors: number;
    perfectFloors: number;
    totalQuestions: number;
    totalCorrect: number;
    accuracy: number;
    hasStarted: boolean;
  } | null>(null);
  const [jeopardyStats, setJeopardyStats] = useState<{
    best_score_3: number | null;
    best_score_5: number | null;
    rank_3: number | null;
    rank_5: number | null;
    total_games: number;
    total_questions_answered: number;
    total_questions_correct: number;
    total_time_played: number;
  } | null>(null);
  const [faceoffStats, setFaceoffStats] = useState<{
    challenges_played: number;
    challenges_created: number;
    total_plays_received: number;
    avg_score: number;
  } | null>(null);

  useEffect(() => {
    if (echo.user?.id) {
      fetchDashboardData();
    }
  }, [echo.user?.id]);

  const fetchDashboardData = async () => {
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
      let faceoffCount = 0;
      let faceoffAvgScore = 0;
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        setCategoryCount(data.categoryCount || {});
        setCategoryPerformance(data.categoryPerformance || []);
        setCategoryMastery(data.categoryMastery || []);
        setDayOfWeekActivity(data.dayOfWeekActivity || {});
        setRadarData(data.radarData || []);
        setScoreTrend(data.scoreTrend || []);
        setDifficultyPerformance(data.difficultyPerformance || []);
        setDailyActivityMap(data.dailyActivityMap || {});
        faceoffCount = data.faceoffCount || 0;
        faceoffAvgScore = data.faceoffAvgScore || 0;
      }

      // Fetch all achievements
      const allAchievementsRes = await fetch('/api/achievements');
      if (allAchievementsRes.ok) {
        const data = await allAchievementsRes.json();
        setAllAchievements(data.achievements || []);
      }

      // Fetch user achievements
      const userAchievementsRes = await fetch(`/api/achievements/user?echo_user_id=${echo.user.id}`);
      if (userAchievementsRes.ok) {
        const data = await userAchievementsRes.json();
        setUserAchievements(data.achievements);
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

      // Fetch tower progress
      const towerRes = await fetch(`/api/tower/progress?echo_user_id=${echo.user.id}`);
      if (towerRes.ok) {
        const data = await towerRes.json();
        setTowerProgress(data);
      }

      // Fetch tower achievements
      const towerAchievementsRes = await fetch(`/api/tower/achievements?echo_user_id=${echo.user.id}`);
      if (towerAchievementsRes.ok) {
        const data = await towerAchievementsRes.json();
        setTowerAchievements(data.achievements || []);
      }

      // Fetch jeopardy stats
      const jeopardyRes = await fetch(`/api/jeopardy/stats?echo_user_id=${echo.user.id}`);
      if (jeopardyRes.ok) {
        const data = await jeopardyRes.json();
        setJeopardyStats(data);
      }

      // Fetch faceoff stats - challenges created
      const faceoffRes = await fetch(`/api/faceoff/my-challenges?echo_user_id=${echo.user.id}&filter=mine&limit=100`);

      let challengesCreated = 0;
      let totalPlaysReceived = 0;

      if (faceoffRes.ok) {
        const data = await faceoffRes.json();
        const challenges = data.challenges || [];
        challengesCreated = challenges.length;
        totalPlaysReceived = challenges.reduce((sum: number, c: { times_played: number }) => sum + (c.times_played || 0), 0);
      }

      // Set faceoff stats with data from both endpoints
      setFaceoffStats({
        challenges_played: faceoffCount,
        challenges_created: challengesCreated,
        total_plays_received: totalPlaysReceived,
        avg_score: faceoffAvgScore,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
            <p className="text-muted-foreground">Please sign in to view your dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
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

  // Prepare chart data - sort by count and take top 8
  const categoryData = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat, count], index) => ({
      name: cat,
      size: count,
      fill: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'][index % 8],
    }));

  const performanceData = [
    { name: 'Correct', value: stats?.correct_answers || 0, fill: '#22c55e' },
    { name: 'Incorrect', value: (stats?.total_questions || 0) - (stats?.correct_answers || 0), fill: '#ef4444' },
  ];

  // Journey stats for radial chart
  const journeyData = [
    { name: 'Quizzes', value: stats?.total_quizzes || 0, fill: '#3b82f6' },
    { name: 'Categories', value: stats?.categories_played.length || 0, fill: '#8b5cf6' },
    { name: 'Perfect Scores', value: stats?.perfect_scores || 0, fill: '#22c55e' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center mb-6 space-y-4">
            <Badge variant="secondary" className="mb-2">
              Dashboard
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Welcome back,{' '}
              <AnimatedGradientText>
                {currentUsername || 'Traveler'}
              </AnimatedGradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your detailed trivia analytics and insights
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quizzes</p>
              <p className="text-4xl font-bold tabular-nums">{stats?.total_quizzes || 0}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Accuracy</p>
              <p className="text-4xl font-bold tabular-nums">{stats?.accuracy_rate.toFixed(1) || 0}%</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Streak</p>
              <p className="text-4xl font-bold tabular-nums text-orange-500">{streak?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Best: {streak?.longest_streak || 0} days</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time Played</p>
              <p className="text-4xl font-bold tabular-nums">{formatTime(stats?.total_time_played || 0)}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Answer Accuracy - Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Answer Accuracy</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {stats?.correct_answers} of {stats?.total_questions} questions
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs sm:text-sm">Correct</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs sm:text-sm">Incorrect</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journey Overview - Radial Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Journey Overview</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your trivia milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={journeyData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} fontSize={11} />
                    <Tooltip cursor={false} content={<CustomChartTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {journeyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Categories - Treemap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Top Categories</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {stats?.categories_played.length ? `${stats.categories_played.length} categories played` : 'No categories yet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <Treemap
                      data={categoryData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#8884d8"
                      content={({ x, y, width, height, name, fill }) => {
                        if (width < 40 || height < 30) {
                          return <g />;
                        }

                        const fontSize = Math.min(width / 8, height / 4, 12);
                        const displayName = name.length > 15 ? name.substring(0, 12) + '...' : name;

                        return (
                          <g>
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              style={{
                                fill,
                                stroke: '#fff',
                                strokeWidth: 2,
                                opacity: 0.9,
                                cursor: 'pointer',
                              }}
                            />
                            <text
                              x={x + width / 2}
                              y={y + height / 2}
                              textAnchor="middle"
                              dominantBaseline="central"
                              style={{
                                fill: '#fff',
                                fontSize: `${fontSize}px`,
                                fontWeight: 600,
                                pointerEvents: 'none',
                              }}
                            >
                              {displayName}
                            </text>
                          </g>
                        );
                      }}
                    >
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-sm">{data.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Played {data.size} times
                              </p>
                            </div>
                          );
                        }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Start playing to see your categories
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Radial Bar Chart - Category Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Category Performance</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {showRandomCategories ? 'Random 5 categories' : 'Top 5 categories by score'}
                    </CardDescription>
                  </div>
                  {categoryPerformance.length > 5 && (
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => {
                        if (!showRandomCategories) {
                          // Shuffle and store
                          const shuffled = [...categoryPerformance]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 5);
                          setShuffledCategories(shuffled);
                        }
                        setShowRandomCategories(!showRandomCategories);
                      }}
                      className="rounded-full p-2 hover:bg-accent transition-colors"
                      aria-label="Shuffle categories"
                    >
                      <Shuffle className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {categoryPerformance.length > 0 ? (
                  <motion.div
                    key={showRandomCategories ? 'random' : 'top'}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResponsiveContainer width="100%" height={240}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="10%"
                        outerRadius="80%"
                        barSize={10}
                        data={(() => {
                          // Use stored shuffled categories or top 5
                          const categories = showRandomCategories
                            ? shuffledCategories
                            : categoryPerformance.slice(0, 5);

                          // Map to chart format - only return the 5 categories
                          return categories.map((cat, index) => ({
                            name: cat.category,
                            value: cat.score,
                            category: cat.category,
                            count: cat.count,
                            fill: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5],
                          }));
                        })()}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar
                          dataKey="value"
                          angleAxisId={0}
                        />
                        <Tooltip
                          content={({ payload }) => {
                            if (!payload || !payload[0]) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                                <p className="font-semibold text-sm">{data.category}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Avg Score: {data.value.toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Played {data.count} times
                                </p>
                              </div>
                            );
                          }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Play more quizzes to see performance
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Mastery Heatmap */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Category Mastery</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your skill level across {categoryMastery.length} categories
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full p-1.5 hover:bg-accent transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Category Mastery Levels</DialogTitle>
                        <DialogDescription>
                          Your mastery level is determined by quiz count and average score
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">👑</div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Master</h4>
                            <p className="text-xs text-muted-foreground">
                              5+ quizzes with 90%+ average score. You've mastered this category!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">⭐</div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Advanced</h4>
                            <p className="text-xs text-muted-foreground">
                              3+ quizzes with 75%+ average score. Strong performance in this area.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">📈</div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Intermediate</h4>
                            <p className="text-xs text-muted-foreground">
                              2+ quizzes with 60%+ average score. You're improving!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🌱</div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Beginner</h4>
                            <p className="text-xs text-muted-foreground">
                              50%+ average score. Keep practicing to level up!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">⚠️</div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Struggling</h4>
                            <p className="text-xs text-muted-foreground">
                              Below 50% average score. This category needs more practice.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {categoryMastery.length > 0 ? (
                  <div className="h-[240px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-2">
                      {categoryMastery.map((cat, index) => {
                        const masteryColors = {
                          master: 'bg-purple-500/90 border-purple-600',
                          advanced: 'bg-blue-500/90 border-blue-600',
                          intermediate: 'bg-green-500/90 border-green-600',
                          beginner: 'bg-yellow-500/90 border-yellow-600',
                          struggling: 'bg-red-500/90 border-red-600'
                        };
                        const masteryIcons = {
                          master: '👑',
                          advanced: '⭐',
                          intermediate: '📈',
                          beginner: '🌱',
                          struggling: '⚠️'
                        };

                        return (
                          <div
                            key={index}
                            onClick={() => handleCategoryClick(cat.category)}
                            className={`${masteryColors[cat.mastery as keyof typeof masteryColors]} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`}
                            title={`Click to view quiz history`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-white font-semibold text-xs leading-tight line-clamp-2">
                                {cat.category.length > 18 ? cat.category.substring(0, 18) + '...' : cat.category}
                              </span>
                              <span className="text-sm flex-shrink-0">
                                {masteryIcons[cat.mastery as keyof typeof masteryIcons]}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-white text-xs font-bold">
                                {cat.avgScore.toFixed(0)}%
                              </span>
                              <span className="text-white/80 text-xs">
                                x{cat.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex flex-wrap gap-2 justify-center text-xs">
                        <div className="flex items-center gap-1">
                          <span>👑</span>
                          <span className="text-muted-foreground">Master</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          <span className="text-muted-foreground">Advanced</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📈</span>
                          <span className="text-muted-foreground">Intermediate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🌱</span>
                          <span className="text-muted-foreground">Beginner</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⚠️</span>
                          <span className="text-muted-foreground">Struggling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Complete quizzes to see category mastery
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Heatmap - Activity by Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Weekly Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Performance by day of week
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {Object.keys(dayOfWeekActivity).length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={[0, 1, 2, 3, 4, 5, 6].map(day => ({
                        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
                        count: dayOfWeekActivity[day]?.count || 0,
                        avgScore: dayOfWeekActivity[day]?.avgScore || 0,
                        fill: dayOfWeekActivity[day]?.count
                          ? `hsl(${Math.min(dayOfWeekActivity[day].avgScore * 1.2, 120)}, 70%, 50%)`
                          : '#e5e7eb'
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" fontSize={11} />
                      <YAxis fontSize={10} />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-sm">{data.day}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Quizzes: {data.count}
                              </p>
                              {data.count > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Avg Score: {data.avgScore.toFixed(1)}%
                                </p>
                              )}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {[0, 1, 2, 3, 4, 5, 6].map((day, index) => (
                          <Cell key={`cell-${index}`} fill={
                            dayOfWeekActivity[day]?.count
                              ? `hsl(${Math.min(dayOfWeekActivity[day].avgScore * 1.2, 120)}, 70%, 50%)`
                              : '#e5e7eb'
                          } />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Play quizzes to see weekly activity
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Advanced Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Radar Chart - Multi-dimensional Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Performance Metrics</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your trivia skills across dimensions
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full p-1.5 hover:bg-accent transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Performance Metrics</DialogTitle>
                        <DialogDescription>
                          How we calculate your performance across 5 dimensions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <span className="text-blue-500">●</span> Speed
                            </h4>
                            <p className="text-xs text-muted-foreground pl-4">
                              Based on your average time per quiz. Faster completion times earn higher scores. Calculated as: 100 - (average seconds ÷ 60 × 10), capped at 100.
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <span className="text-green-500">●</span> Accuracy
                            </h4>
                            <p className="text-xs text-muted-foreground pl-4">
                              Percentage of questions answered correctly across all quizzes. Calculated as: (correct answers ÷ total questions) × 100.
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <span className="text-purple-500">●</span> Consistency
                            </h4>
                            <p className="text-xs text-muted-foreground pl-4">
                              How stable your scores are. Measures score variance - the less your scores fluctuate, the higher this metric. Calculated as: 100 - standard deviation of scores.
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <span className="text-orange-500">●</span> Diversity
                            </h4>
                            <p className="text-xs text-muted-foreground pl-4">
                              How varied your quiz categories are. Higher when you explore more categories. Calculated as: (unique categories ÷ total quizzes) × 100.
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <span className="text-cyan-500">●</span> Avg Score
                            </h4>
                            <p className="text-xs text-muted-foreground pl-4">
                              Your overall average quiz score across all completed quizzes. Simple average of all score percentages.
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground italic">
                            All metrics are scored from 0-100, with higher values indicating better performance.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        tickCount={3}
                      />
                      <Radar
                        name="Your Performance"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-sm">{data.metric}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Score: {data.value.toFixed(1)}/100
                              </p>
                            </div>
                          );
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Play quizzes to see metrics
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Area Chart - Score Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Score Progression</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Last {scoreTrend.length} quiz scores over time
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full p-1.5 hover:bg-accent transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Score Progression</DialogTitle>
                        <DialogDescription>
                          Track your performance improvement over time
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        <p className="text-sm text-muted-foreground">
                          This chart shows your quiz scores from your most recent sessions, displayed in chronological order from oldest to newest.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">What it shows:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                            <li>Your last {scoreTrend.length > 0 ? scoreTrend.length : 20} completed quizzes</li>
                            <li>Score percentage for each quiz (0-100%)</li>
                            <li>Category for each quiz (visible on hover)</li>
                            <li>Trend line showing improvement or decline</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">How to use it:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                            <li>Hover over any point to see quiz details</li>
                            <li>Look for upward trends showing improvement</li>
                            <li>Identify categories where you score consistently high or low</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {scoreTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={scoreTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="session"
                        fontSize={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[20, 40, 60, 80, 100]}
                        fontSize={10}
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          const date = new Date(data.date);
                          const formattedDate = date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
                              <p className="font-semibold text-sm mb-1.5">Quiz #{data.session}</p>
                              <div className="space-y-0.5">
                                <p className="text-xs text-muted-foreground flex justify-between">
                                  <span>Score:</span>
                                  <span className="font-semibold text-foreground">{data.score.toFixed(1)}%</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">{data.category}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border/50">
                                  {formattedDate}
                                </p>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#colorScore)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Complete quizzes to see progression
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart - Difficulty Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Performance by Difficulty</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Average score for each difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {difficultyPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={(() => {
                        const difficulties = ['easy', 'medium', 'hard'];
                        return difficulties.map(diff => {
                          const filtered = difficultyPerformance.filter(d => d.difficulty === diff);
                          const avgScore = filtered.length > 0
                            ? filtered.reduce((sum, d) => sum + d.score, 0) / filtered.length
                            : 0;
                          const count = filtered.length;
                          return {
                            difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
                            score: avgScore,
                            count: count,
                            fill: diff === 'easy' ? '#22c55e' : diff === 'medium' ? '#f59e0b' : '#ef4444'
                          };
                        }).filter(d => d.count > 0);
                      })()}
                      margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="difficulty" fontSize={11} />
                      <YAxis domain={[0, 100]} ticks={[20, 40, 60, 80, 100]} fontSize={10} />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-sm">{data.difficulty}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Avg Score: {data.score.toFixed(1)}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Quizzes: {data.count}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {(() => {
                          const difficulties = ['easy', 'medium', 'hard'];
                          return difficulties.map(diff => {
                            const filtered = difficultyPerformance.filter(d => d.difficulty === diff);
                            if (filtered.length === 0) return null;
                            return (
                              <Cell
                                key={diff}
                                fill={diff === 'easy' ? '#22c55e' : diff === 'medium' ? '#f59e0b' : '#ef4444'}
                              />
                            );
                          }).filter(Boolean);
                        })()}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                    Play quizzes to see difficulty analysis
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Average Score</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats?.average_score.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Perfect Scores</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {stats?.perfect_scores || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Daily Quizzes</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                      {stats?.daily_quizzes_completed || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Longest Streak</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-500">
                      {streak?.longest_streak || 0} days
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Favorite Category</span>
                      <Badge variant="secondary" className="text-xs">
                        {stats?.favorite_category || 'None yet'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Best Category</span>
                      <Badge variant="default" className="text-xs">
                        {stats?.best_category || 'None yet'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Best Day</span>
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const bestDay = Object.entries(dayOfWeekActivity)
                            .filter(([_, data]) => data.count > 0)
                            .sort((a, b) => b[1].avgScore - a[1].avgScore)[0];
                          return bestDay ? days[parseInt(bestDay[0])] : 'None yet';
                        })()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Categories Explored</span>
                      <Badge variant="secondary" className="text-xs">
                        {stats?.categories_played.filter(cat => CATEGORIES.includes(cat as typeof CATEGORIES[number])).length || 0} / {CATEGORIES.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Custom Categories</span>
                      <Badge variant="outline" className="text-xs">
                        {stats?.categories_played.filter(cat => !CATEGORIES.includes(cat as typeof CATEGORIES[number])).length || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="h-5 w-5" />
                  Achievements ({userAchievements.length + towerAchievements.filter(a => a.unlocked).length}/{allAchievements.length + towerAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {/* Regular Achievements */}
                  {allAchievements.length > 0 && allAchievements.map((achievement) => {
                    const userAchievement = userAchievements.find(
                      (ua) => ua.achievement_id === achievement.id
                    );
                    const isUnlocked = !!userAchievement;

                    const tierColors = {
                      bronze: isUnlocked ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      silver: isUnlocked ? 'border-gray-400 bg-gray-50 dark:bg-gray-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      gold: isUnlocked ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      platinum: isUnlocked ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                    };

                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${tierColors[achievement.tier as keyof typeof tierColors]} ${!isUnlocked && 'opacity-50'}`}
                      >
                        <div className={`text-xl flex-shrink-0 ${!isUnlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-sm leading-tight">
                              {achievement.name}
                            </h4>
                            <Badge variant="outline" className="text-xs leading-none">
                              {achievement.tier}
                            </Badge>
                            {!isUnlocked && (
                              <Badge variant="secondary" className="text-xs leading-none">
                                🔒
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Subtle divider */}
                  {allAchievements.length > 0 && towerAchievements.length > 0 && (
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">Tower</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  {/* Tower Achievements */}
                  {towerAchievements.map((achievement) => {
                    const tierColors = {
                      bronze: achievement.unlocked ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      silver: achievement.unlocked ? 'border-gray-400 bg-gray-50 dark:bg-gray-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      gold: achievement.unlocked ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      platinum: achievement.unlocked ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                      diamond: achievement.unlocked ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-900',
                    };

                    // Progress for lifetime achievements
                    let progress: number | null = null;
                    if (!achievement.unlocked && achievement.id === 'pattern_seeker') {
                      progress = Math.min(100, ((stats?.correct_answers || 0) / 1000) * 100);
                    } else if (!achievement.unlocked && achievement.id === 'fog_dispeller') {
                      progress = Math.min(100, ((stats?.correct_answers || 0) / 5000) * 100);
                    }

                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${tierColors[achievement.tier as keyof typeof tierColors] || tierColors.bronze} ${!achievement.unlocked && 'opacity-50'}`}
                      >
                        <div className={`text-xl flex-shrink-0 ${!achievement.unlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-sm leading-tight">
                              {achievement.name}
                            </h4>
                            <Badge variant="outline" className="text-xs leading-none capitalize">
                              {achievement.tier}
                            </Badge>
                            {!achievement.unlocked && (
                              <Badge variant="secondary" className="text-xs leading-none">
                                🔒
                              </Badge>
                            )}
                            {progress !== null && (
                              <span className="text-xs text-muted-foreground">
                                {progress.toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">All Categories Played ({categoryMastery.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryMastery.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {(categoriesExpanded ? categoryMastery : categoryMastery.slice(0, 8)).map((cat, index) => {
                      const masteryColors = {
                        master: 'border-purple-500/50 bg-purple-500/10',
                        advanced: 'border-blue-500/50 bg-blue-500/10',
                        intermediate: 'border-green-500/50 bg-green-500/10',
                        beginner: 'border-yellow-500/50 bg-yellow-500/10',
                        struggling: 'border-red-500/50 bg-red-500/10'
                      };
                      const masteryIcons = {
                        master: '👑',
                        advanced: '⭐',
                        intermediate: '📈',
                        beginner: '🌱',
                        struggling: '⚠️'
                      };

                      return (
                        <motion.div
                          key={cat.category}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => handleCategoryClick(cat.category)}
                          className={`${masteryColors[cat.mastery as keyof typeof masteryColors]} border rounded-lg p-3 cursor-pointer hover:scale-[1.02] transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                              {cat.category}
                            </span>
                            <span className="text-base flex-shrink-0">
                              {masteryIcons[cat.mastery as keyof typeof masteryIcons]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{cat.avgScore.toFixed(0)}%</span>
                            <span>{cat.count} {cat.count === 1 ? 'quiz' : 'quizzes'}</span>
                          </div>
                          {cat.lastPlayed && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Last: {new Date(cat.lastPlayed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  {categoryMastery.length > 8 && (
                    <button
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>{categoriesExpanded ? 'Show less' : `Show all ${categoryMastery.length} categories`}</span>
                      <motion.div
                        animate={{ rotate: categoriesExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Start playing to explore categories
                </span>
              )}
            </CardContent>
          </Card>

          {/* Activity Heatmap */}
          <ActivityHeatmap dailyActivityMap={dailyActivityMap} />

          {/* Game Modes */}
          <div className="grid gap-4">
            {/* Faceoff */}
            <Link href="/faceoff">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-primary" />
                    Faceoff
                  </CardTitle>
                  <CardDescription>
                    Create and share challenges with friends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {faceoffStats && (faceoffStats.challenges_created > 0 || faceoffStats.challenges_played > 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {faceoffStats.challenges_played}
                        </div>
                        <div className="text-xs text-muted-foreground">Played</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {faceoffStats.challenges_created}
                        </div>
                        <div className="text-xs text-muted-foreground">Created</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {faceoffStats.total_plays_received}
                        </div>
                        <div className="text-xs text-muted-foreground">Plays</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {faceoffStats.avg_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Challenge friends to beat your score!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Survival Mode Stats */}
            <Link href="/survival">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Endless Survival
                  </CardTitle>
                  <CardDescription>Your survival mode performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {survivalStats && survivalStats.total_runs > 0 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                            <Flame className="h-5 w-5" />
                            {survivalStats.mixed_best_streak}
                          </div>
                          <div className="text-xs text-muted-foreground">Best Mixed Streak</div>
                          {survivalStats.mixed_rank && (
                            <div className="text-xs text-muted-foreground">Rank #{survivalStats.mixed_rank}</div>
                          )}
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{survivalStats.total_runs}</div>
                          <div className="text-xs text-muted-foreground">Total Runs</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{survivalStats.total_questions_survived}</div>
                          <div className="text-xs text-muted-foreground">Questions Survived</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                            <Clock className="h-5 w-5" />
                            {Math.floor(survivalStats.total_time_played / 60)}m
                          </div>
                          <div className="text-xs text-muted-foreground">Time Survived</div>
                        </div>
                      </div>
                      {survivalStats.category_bests.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Category Bests</h4>
                          <div className="flex flex-wrap gap-2">
                            {survivalStats.category_bests.slice(0, 5).map((cb) => (
                              <Badge key={cb.category} variant="secondary" className="text-xs">
                                {cb.category}: {cb.streak}
                                {cb.rank && <span className="ml-1 opacity-60">#{cb.rank}</span>}
                              </Badge>
                            ))}
                            {survivalStats.category_bests.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{survivalStats.category_bests.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Answer questions until you miss one!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Jeopardy */}
            <Link href="/jeopardy">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5 text-primary" />
                    Jeopardy
                  </CardTitle>
                  <CardDescription>
                    Classic board-style trivia with wagering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jeopardyStats && jeopardyStats.total_games > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {jeopardyStats.best_score_3 !== null ? jeopardyStats.best_score_3.toLocaleString() : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">Best (3-Cat)</div>
                        {jeopardyStats.rank_3 && (
                          <div className="text-xs text-muted-foreground">#{jeopardyStats.rank_3}</div>
                        )}
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {jeopardyStats.best_score_5 !== null ? jeopardyStats.best_score_5.toLocaleString() : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">Best (5-Cat)</div>
                        {jeopardyStats.rank_5 && (
                          <div className="text-xs text-muted-foreground">#{jeopardyStats.rank_5}</div>
                        )}
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">{jeopardyStats.total_games}</div>
                        <div className="text-xs text-muted-foreground">Games Played</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {jeopardyStats.total_questions_answered > 0
                            ? Math.round((jeopardyStats.total_questions_correct / jeopardyStats.total_questions_answered) * 100)
                            : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Pick categories and wager on your knowledge!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Wizard's Tower Campaign */}
            <Link href="/campaign">
              <Card className="border-2 border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Castle className="h-5 w-5 text-indigo-500" />
                      The Wizard&apos;s Tower
                    </CardTitle>
                    {towerProgress?.hasStarted && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {towerProgress.difficulty}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {towerProgress?.hasStarted
                      ? towerProgress.tierName
                      : "Ascend the tower by mastering trivia across all categories"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-indigo-500">
                        <Castle className="h-5 w-5" />
                        {towerProgress?.currentFloor || 1}
                      </div>
                      <div className="text-xs text-muted-foreground">Current Floor</div>
                      <div className="text-xs text-muted-foreground">
                        of {towerProgress?.totalFloors || 1008}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{towerProgress?.highestFloor || 1}</div>
                      <div className="text-xs text-muted-foreground">Highest Floor</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{towerProgress?.perfectFloors || 0}</div>
                      <div className="text-xs text-muted-foreground">Perfect Floors</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{towerProgress?.accuracy || 0}%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  {towerProgress?.hasStarted && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next Category:</span>
                        <Badge variant="outline">{towerProgress.category}</Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Tier {towerProgress.tier} Progress</span>
                          <span>
                            {((towerProgress.currentFloor - 1) % Math.ceil(towerProgress.totalFloors / 3)) + 1} / {Math.ceil(towerProgress.totalFloors / 3)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${((((towerProgress.currentFloor - 1) % Math.ceil(towerProgress.totalFloors / 3)) + 1) / Math.ceil(towerProgress.totalFloors / 3)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {!towerProgress?.hasStarted && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <p className="text-sm text-muted-foreground">
                        Complete 5-question floors to climb the tower.
                        <br />
                        Score 3/5 or better to advance!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
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
                  {categoryQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
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
                    </motion.div>
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
    </div>
  );
}
