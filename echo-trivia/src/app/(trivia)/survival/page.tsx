"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Shuffle, BookOpen, Trophy, Medal, Award, Flame, Clock, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import type { SurvivalStats, SurvivalLeaderboardEntry } from "@/lib/supabase-types";

export default function SurvivalHubPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useEcho();
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [stats, setStats] = useState<SurvivalStats | null>(null);
  const [mixedLeaderboard, setMixedLeaderboard] = useState<SurvivalLeaderboardEntry[]>([]);
  const [categoryLeaderboard, setCategoryLeaderboard] = useState<SurvivalLeaderboardEntry[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<"mixed" | "category">("mixed");
  const [leaderboardCategory, setLeaderboardCategory] = useState<string>(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user stats and leaderboards
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch mixed leaderboard
        const mixedRes = await fetch("/api/survival/leaderboard?mode=mixed&limit=10");
        if (mixedRes.ok) {
          const data = await mixedRes.json();
          setMixedLeaderboard(data.leaderboard || []);
        }

        // Fetch user stats if authenticated
        if (user?.id) {
          const statsRes = await fetch(`/api/survival/stats?echo_user_id=${user.id}`);
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch survival data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  // Fetch category leaderboard when tab or category changes
  useEffect(() => {
    async function fetchCategoryLeaderboard() {
      if (leaderboardTab !== "category") return;

      try {
        const res = await fetch(`/api/survival/leaderboard?mode=category&category=${encodeURIComponent(leaderboardCategory)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setCategoryLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error("Failed to fetch category leaderboard:", error);
      }
    }

    fetchCategoryLeaderboard();
  }, [leaderboardTab, leaderboardCategory]);

  const handleStartMixed = () => {
    if (!user) {
      router.push("/sign-in?redirect=/survival/ready?mode=mixed");
      return;
    }
    router.push("/survival/ready?mode=mixed");
  };

  const handleStartCategory = () => {
    if (!user) {
      router.push(`/sign-in?redirect=/survival/ready?mode=category&category=${encodeURIComponent(selectedCategory)}`);
      return;
    }
    router.push(`/survival/ready?mode=category&category=${encodeURIComponent(selectedCategory)}`);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm text-muted-foreground">#{rank}</span>;
  };

  const currentLeaderboard = leaderboardTab === "mixed" ? mixedLeaderboard : categoryLeaderboard;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Endless Survival</h1>
            <Badge variant="default" className="text-xs">Beta</Badge>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            How long can you survive? Answer questions until you get one wrong. One mistake ends your run.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Mixed Mode Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shuffle className="h-6 w-6 text-primary" />
                <CardTitle>Mixed Mode</CardTitle>
              </div>
              <CardDescription>
                Random categories test your knowledge across all topics. The ultimate challenge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStartMixed} className="w-full" size="lg">
                <Zap className="mr-2 h-4 w-4" />
                Start Mixed Run
              </Button>
            </CardContent>
          </Card>

          {/* Category Mode Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <CardTitle>Category Mode</CardTitle>
              </div>
              <CardDescription>
                Master one category. How deep does your knowledge go?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {[...CATEGORIES].sort().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleStartCategory} className="w-full" size="lg">
                <Zap className="mr-2 h-4 w-4" />
                Start Category Run
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Stats */}
        {user && stats && stats.total_runs > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                    <Flame className="h-5 w-5" />
                    {stats.mixed_best_streak}
                  </div>
                  <div className="text-xs text-muted-foreground">Best Mixed Streak</div>
                  {stats.mixed_rank && (
                    <div className="text-xs text-muted-foreground">Rank #{stats.mixed_rank}</div>
                  )}
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{stats.total_runs}</div>
                  <div className="text-xs text-muted-foreground">Total Runs</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{stats.total_questions_survived}</div>
                  <div className="text-xs text-muted-foreground">Questions Survived</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Clock className="h-5 w-5" />
                    {Math.floor(stats.total_time_played / 60)}m
                  </div>
                  <div className="text-xs text-muted-foreground">Time Played</div>
                </div>
              </div>

              {/* Category Bests */}
              {stats.category_bests.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Category Bests</h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.category_bests.slice(0, 5).map((cb) => (
                      <Badge key={cb.category} variant="secondary" className="text-xs">
                        {cb.category}: {cb.streak}
                        {cb.rank && <span className="ml-1 opacity-60">#{cb.rank}</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leaderboards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leaderboards</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={leaderboardTab} onValueChange={(v) => setLeaderboardTab(v as "mixed" | "category")}>
              <div className="flex items-center gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="mixed">Mixed Global</TabsTrigger>
                  <TabsTrigger value="category">By Category</TabsTrigger>
                </TabsList>

                {leaderboardTab === "category" && (
                  <Select value={leaderboardCategory} onValueChange={setLeaderboardCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {[...CATEGORIES].sort().map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <TabsContent value="mixed" className="mt-0">
                <LeaderboardList entries={currentLeaderboard} getRankIcon={getRankIcon} />
              </TabsContent>

              <TabsContent value="category" className="mt-0">
                <LeaderboardList entries={currentLeaderboard} getRankIcon={getRankIcon} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardList({
  entries,
  getRankIcon,
}: {
  entries: SurvivalLeaderboardEntry[];
  getRankIcon: (rank: number) => React.ReactNode;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No runs yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.echo_user_id}
          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {entry.username || "Anonymous Wizard"}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(entry.ended_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            <Flame className="h-4 w-4" />
            {entry.streak}
          </div>
        </div>
      ))}
    </div>
  );
}
