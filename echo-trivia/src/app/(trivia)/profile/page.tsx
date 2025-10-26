"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Flame, Clock, Award, Edit2, Check, X } from "lucide-react";
import type { UserStats, UserAchievement, DailyStreak } from "@/lib/supabase-types";

export default function ProfilePage() {
  const echo = useEcho();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [streak, setStreak] = useState<DailyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");

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
          setNewUsername(data.user.username || "");
        }
      }

      // Fetch stats
      const statsRes = await fetch(`/api/user/stats?echo_user_id=${echo.user.id}`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
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
    } catch (error) {
      console.error('Error fetching user data:', error);
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
          {/* Header with Username */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2">
              {editingUsername ? (
                <div className="flex items-center gap-2 flex-wrap justify-center">
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
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    {currentUsername || "Set your username"}
                  </h1>
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
            <p className="text-sm sm:text-base text-muted-foreground">Track your trivia journey</p>
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

          {/* Tabs */}
          <Tabs defaultValue="stats" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats" className="text-sm sm:text-base">Statistics</TabsTrigger>
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
                  <CardTitle className="text-lg sm:text-xl">Category Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">Favorite Category</div>
                      <Badge variant="secondary" className="text-sm sm:text-base">
                        {stats?.favorite_category || 'None yet'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Most played</p>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">Best Category</div>
                      <Badge variant="default" className="text-sm sm:text-base">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
