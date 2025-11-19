"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Trophy, Target, Flame, Clock, Award, Edit2, Check, X } from "lucide-react";
import type { UserStats, UserAchievement, DailyStreak, QuizSession, Achievement } from "@/lib/supabase-types";

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
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");

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
          setNewUsername(data.user.username || "");
        }
      }

      // Fetch stats
      const statsRes = await fetch(`/api/user/stats?echo_user_id=${echo.user.id}`);
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!echo.user?.id || !newUsername.trim()) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          username: newUsername.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUsername(data.user.username);
        setEditingUsername(false);
      } else {
        alert('Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
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
          {/* Header with Username Edit */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
              <div className="flex items-center gap-2">
                {editingUsername ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      className="max-w-[200px] sm:max-w-xs"
                    />
                    <Button size="sm" onClick={handleUsernameUpdate}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUsername(false);
                        setNewUsername(currentUsername);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg text-muted-foreground">
                      {currentUsername || "Set your username"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingUsername(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Total Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold">{stats?.total_quizzes || 0}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Accuracy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-green-600">
                  {stats?.accuracy_rate.toFixed(1) || 0}%
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <span className="text-3xl font-bold text-orange-500">
                    {streak?.current_streak || 0}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {streak?.longest_streak || 0} days
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-blue-600">
                  {formatTime(stats?.total_time_played || 0)}
                </span>
              </CardContent>
            </Card>
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
                    <Tooltip
                      formatter={(value: any) => value}
                      contentStyle={{ fontSize: '12px' }}
                    />
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
                    <Tooltip
                      cursor={false}
                      contentStyle={{ fontSize: '12px' }}
                    />
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
                <CardTitle className="text-base sm:text-lg">Category Performance</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Average scores by category
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {categoryPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={categoryPerformance.slice(0, 5).map((cat, index) => ({
                        ...cat,
                        fill: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5],
                      }))}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        minAngle={15}
                        background
                        clockWise
                        dataKey="score"
                        cornerRadius={10}
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-sm">{data.category}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Avg Score: {data.score.toFixed(1)}%
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
                <CardTitle className="text-base sm:text-lg">Category Mastery</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your skill level across {categoryMastery.length} categories
                </CardDescription>
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
                            className={`${masteryColors[cat.mastery as keyof typeof masteryColors]} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`}
                            title={`${cat.category}: ${cat.avgScore.toFixed(1)}% avg (${cat.count} quizzes)`}
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
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" fontSize={11} />
                      <YAxis fontSize={10} label={{ value: 'Quizzes', angle: -90, position: 'insideLeft', fontSize: 10 }} />
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
                <CardTitle className="text-base sm:text-lg">Performance Metrics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your trivia skills across dimensions
                </CardDescription>
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
                <CardTitle className="text-base sm:text-lg">Score Progression</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Last {scoreTrend.length} quiz scores over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {scoreTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={scoreTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="session" fontSize={10} />
                      <YAxis domain={[0, 100]} fontSize={10} />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-sm">Quiz #{data.session}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Score: {data.score.toFixed(1)}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {data.category}
                              </p>
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
                      margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="difficulty" fontSize={11} />
                      <YAxis domain={[0, 100]} fontSize={10} label={{ value: 'Avg Score %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
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
                </div>
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-xs sm:text-sm">Favorite Category</span>
                      <Badge variant="secondary" className="text-xs w-fit">
                        {stats?.favorite_category || 'None yet'}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-xs sm:text-sm">Best Category</span>
                      <Badge variant="default" className="text-xs w-fit">
                        {stats?.best_category || 'None yet'}
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
                  Achievements ({userAchievements.length}/{allAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {allAchievements.map((achievement) => {
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
                        className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border ${tierColors[achievement.tier as keyof typeof tierColors]} ${!isUnlocked && 'opacity-50'}`}
                      >
                        <div className={`text-2xl sm:text-3xl flex-shrink-0 ${!isUnlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-sm sm:text-base leading-tight">
                              {achievement.name}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Badge variant="outline" className="text-xs leading-none">
                                {achievement.tier}
                              </Badge>
                              {!isUnlocked && (
                                <Badge variant="secondary" className="text-xs leading-none">
                                  🔒
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
              <CardTitle className="text-lg sm:text-xl">All Categories Played</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats?.categories_played.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs sm:text-sm">
                    {cat}
                  </Badge>
                ))}
                {(!stats?.categories_played || stats.categories_played.length === 0) && (
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Start playing to explore categories
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
