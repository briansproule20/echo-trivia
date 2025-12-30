"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Trophy, Target, Flame, Clock, Award, BarChart3, Swords, Zap, Star, Castle, HelpCircle, Lock, CheckCircle2,
  Skull, Ghost, Cat, Shield, Glasses, TreePine, Crown, Anchor, Bird, Bug, Snowflake, Cherry, Pencil
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import type { UserStats, UserAchievement, DailyStreak, SurvivalStats, QuizSession } from "@/lib/supabase-types";
import type { JeopardyStats } from "@/app/api/jeopardy/stats/route";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

interface TowerAchievement {
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
}

const AVATAR_ICONS = {
  skull: Skull,
  ghost: Ghost,
  cat: Cat,
  swords: Swords,
  shield: Shield,
  target: Target,
  glasses: Glasses,
  tree: TreePine,
  flame: Flame,
  zap: Zap,
  crown: Crown,
  anchor: Anchor,
  bird: Bird,
  bug: Bug,
  snowflake: Snowflake,
  cherry: Cherry,
} as const;

type AvatarId = keyof typeof AVATAR_ICONS;

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
    achievements: TowerAchievement[];
    unlockedCount: number;
    totalCount: number;
  } | null>(null);
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState<string>("all");
  const [avatarId, setAvatarId] = useState<AvatarId>("ghost");
  const [avatarOpen, setAvatarOpen] = useState(false);

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
          if (data.user.avatar_id && data.user.avatar_id in AVATAR_ICONS) {
            setAvatarId(data.user.avatar_id as AvatarId);
          }
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

  const handleAvatarUpdate = async (newAvatarId: AvatarId) => {
    if (!echo.user?.id) return;

    setAvatarId(newAvatarId);
    setAvatarOpen(false);

    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          avatar_id: newAvatarId,
        }),
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
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

  // Combine regular achievements and tower achievements
  const allAchievements = [
    // Regular achievements (from daily/freeplay)
    ...achievements.map(ua => ({
      id: ua.id,
      name: ua.achievement?.name || '',
      description: ua.achievement?.description || '',
      lore_text: '',
      category: 'general',
      icon: ua.achievement?.icon || '🏆',
      tier: ua.achievement?.tier || 'bronze',
      unlocked: true,
      earned_at: ua.earned_at,
      floor_earned: null,
      is_hidden: false,
    })),
    // Tower achievements
    ...(towerAchievements?.achievements || []),
  ];

  // Achievement categories for filtering
  const achievementCategories = [
    { id: 'all', label: 'All', count: allAchievements.length },
    { id: 'unlocked', label: 'Unlocked', count: allAchievements.filter(a => a.unlocked).length },
    { id: 'general', label: 'General', count: allAchievements.filter(a => a.category === 'general').length },
    { id: 'milestone', label: 'Milestone', count: allAchievements.filter(a => a.category === 'milestone').length },
    { id: 'performance', label: 'Performance', count: allAchievements.filter(a => a.category === 'performance').length },
    { id: 'mastery', label: 'Mastery', count: allAchievements.filter(a => a.category === 'mastery').length },
    { id: 'special', label: 'Special', count: allAchievements.filter(a => a.category === 'special').length },
    { id: 'lifetime', label: 'Lifetime', count: allAchievements.filter(a => a.category === 'lifetime').length },
  ].filter(c => c.count > 0 || c.id === 'all' || c.id === 'unlocked');

  // Filter achievements based on selected category
  const filteredAchievements = selectedAchievementCategory === 'all'
    ? allAchievements
    : selectedAchievementCategory === 'unlocked'
      ? allAchievements.filter(a => a.unlocked)
      : allAchievements.filter(a => a.category === selectedAchievementCategory);

  // Sort: unlocked first, then by tier
  const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return (tierOrder[a.tier as keyof typeof tierOrder] || 4) - (tierOrder[b.tier as keyof typeof tierOrder] || 4);
  });

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="text-center mb-6 space-y-4">
            <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
              <PopoverTrigger asChild>
                <button className="group relative mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                  {(() => {
                    const Icon = AVATAR_ICONS[avatarId];
                    return <Icon className="h-8 w-8 text-primary" />;
                  })()}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-4 w-4 text-white" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Choose your icon</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(AVATAR_ICONS) as AvatarId[]).map((id) => {
                      const Icon = AVATAR_ICONS[id];
                      return (
                        <button
                          key={id}
                          onClick={() => handleAvatarUpdate(id)}
                          className={`p-2 rounded-lg hover:bg-accent transition-colors ${
                            avatarId === id ? 'ring-2 ring-primary bg-primary/10' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

          {/* Tabs for Statistics and Achievements */}
          <Tabs defaultValue="statistics" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="statistics" className="space-y-6 mt-6">
              {/* Game Mode Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Game Mode Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Swords className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Faceoffs</div>
                          <div className="text-xs text-muted-foreground">Games played</div>
                        </div>
                      </div>
                      <span className="text-xl font-bold">{faceoffStats.played}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">Survival</div>
                          <div className="text-xs text-muted-foreground">Best streak</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold">{survivalStats?.mixed_best_streak || 0}</span>
                        {survivalStats?.mixed_rank && (
                          <span className="text-xs text-muted-foreground ml-1">#{survivalStats.mixed_rank}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-amber-500" />
                        <div>
                          <div className="font-medium">Jeopardy</div>
                          <div className="text-xs text-muted-foreground">Best score</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold">
                          {jeopardyStats?.best_score_5 ?? jeopardyStats?.best_score_3 ?? 0}
                        </span>
                        {(jeopardyStats?.rank_5 || jeopardyStats?.rank_3) && (
                          <span className="text-xs text-muted-foreground ml-1">
                            #{jeopardyStats?.rank_5 || jeopardyStats?.rank_3}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href="/campaign" className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Castle className="h-5 w-5 text-indigo-500" />
                          <div>
                            <div className="font-medium">Tower</div>
                            <div className="text-xs text-muted-foreground">Current floor</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-indigo-400">{towerProgress?.highestFloor || 1}</span>
                          <span className="text-xs text-muted-foreground">/ {towerProgress?.totalFloors || 1008}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium">{stats?.average_score.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats?.average_score || 0} className="h-2" />

                  <div className="grid grid-cols-3 gap-4 pt-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats?.perfect_scores || 0}</div>
                      <div className="text-xs text-muted-foreground">Perfect Scores</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats?.total_questions || 0}</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats?.correct_answers || 0}</div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Insights */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Category Insights</CardTitle>
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
                            Categories are tracked across all game modes: Freeplay, Daily Challenges, Faceoff, and Campaign.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Recent</div>
                      <Badge
                        variant="outline"
                        className={`text-xs w-full justify-center ${stats?.recent_category ? 'cursor-pointer hover:bg-accent' : ''}`}
                        onClick={() => stats?.recent_category && handleCategoryClick(stats.recent_category)}
                      >
                        {stats?.recent_category?.slice(0, 12) || 'None'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Favorite</div>
                      <Badge
                        variant="secondary"
                        className={`text-xs w-full justify-center ${stats?.favorite_category ? 'cursor-pointer hover:bg-accent' : ''}`}
                        onClick={() => stats?.favorite_category && handleCategoryClick(stats.favorite_category)}
                      >
                        {stats?.favorite_category?.slice(0, 12) || 'None'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Best</div>
                      <Badge
                        variant="default"
                        className={`text-xs w-full justify-center ${stats?.best_category ? 'cursor-pointer hover:bg-primary/80' : ''}`}
                        onClick={() => stats?.best_category && handleCategoryClick(stats.best_category)}
                      >
                        {stats?.best_category?.slice(0, 12) || 'None'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">
                      {stats?.categories_played.length || 0} categories explored
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stats?.categories_played.slice(0, 8).map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-accent"
                          onClick={() => handleCategoryClick(cat)}
                        >
                          {cat.length > 15 ? cat.slice(0, 15) + '...' : cat}
                        </Badge>
                      ))}
                      {(stats?.categories_played.length || 0) > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{(stats?.categories_played.length || 0) - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Link */}
              <Link href="/dashboard" className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <span>View detailed analytics</span>
                    </div>
                    <Button variant="outline" size="sm" className="pointer-events-none">
                      Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      All Achievements
                    </CardTitle>
                    <Badge variant="secondary">
                      {unlockedCount}/{totalCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                      {/* Category Filter */}
                      <div className="flex flex-wrap gap-2 pb-4 border-b">
                        {achievementCategories.map(cat => (
                          <Button
                            key={cat.id}
                            variant={selectedAchievementCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedAchievementCategory(cat.id)}
                          >
                            {cat.label}
                            <span className="ml-1 opacity-60">({cat.count})</span>
                          </Button>
                        ))}
                      </div>

                      {/* Achievements Grid */}
                      {sortedAchievements.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No achievements in this category yet.</p>
                          <p className="text-sm mt-1">Keep playing to unlock more!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {sortedAchievements.map((achievement) => {
                            const tierColors = {
                              bronze: achievement.unlocked
                                ? 'border-amber-700/50 bg-amber-50 dark:bg-amber-950/20'
                                : 'border-muted bg-muted/30',
                              silver: achievement.unlocked
                                ? 'border-gray-400/50 bg-gray-100 dark:bg-gray-800/40'
                                : 'border-muted bg-muted/30',
                              gold: achievement.unlocked
                                ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20'
                                : 'border-muted bg-muted/30',
                              platinum: achievement.unlocked
                                ? 'border-purple-500/50 bg-purple-50 dark:bg-purple-950/20'
                                : 'border-muted bg-muted/30',
                            };

                            const categoryColors: Record<string, string> = {
                              general: 'text-blue-500',
                              milestone: 'text-indigo-500',
                              performance: 'text-emerald-500',
                              mastery: 'text-amber-500',
                              special: 'text-purple-500',
                              lifetime: 'text-rose-500',
                            };

                            return (
                              <div
                                key={achievement.id}
                                className={`p-3 rounded-lg border transition-all ${
                                  tierColors[achievement.tier as keyof typeof tierColors]
                                } ${!achievement.unlocked && 'opacity-50'}`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`text-2xl flex-shrink-0 ${!achievement.unlocked && 'grayscale'}`}>
                                    {achievement.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                      <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                                      {achievement.unlocked ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                      ) : (
                                        <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {achievement.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                      <Badge variant="outline" className="text-xs h-5">
                                        {achievement.tier}
                                      </Badge>
                                      <span className={`text-xs ${categoryColors[achievement.category] || 'text-muted-foreground'}`}>
                                        {achievement.category}
                                      </span>
                                      {achievement.unlocked && achievement.earned_at && (
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(achievement.earned_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    {achievement.lore_text && (
                                      <p className="text-xs text-muted-foreground/70 italic mt-1 line-clamp-1">
                                        &quot;{achievement.lore_text}&quot;
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>
                            {new Date(quiz.completed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {quiz.time_taken && (
                            <span>{Math.floor(quiz.time_taken / 60)}:{(quiz.time_taken % 60).toString().padStart(2, '0')}</span>
                          )}
                          {quiz.difficulty && (
                            <span className="capitalize">{quiz.difficulty}</span>
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
