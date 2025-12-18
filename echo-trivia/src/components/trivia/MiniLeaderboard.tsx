"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trophy, Medal, Award, TrendingUp, HelpCircle, User, Skull, Ghost, Cat, Swords, Shield, Target, Glasses, TreePine, Flame, Zap, Crown, Anchor, Bird, Bug, Snowflake, Cherry } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/supabase-types";
import Link from "next/link";

const AVATAR_ICONS: Record<string, typeof Ghost> = {
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
};

export function MiniLeaderboard() {
  const echo = useEcho();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?period=daily&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-700" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200";
    if (rank === 2) return "bg-gray-50 dark:bg-gray-950/20 border-gray-200";
    if (rank === 3) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200";
    return "bg-background";
  };

  const HeaderContent = () => (
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="text-lg flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Today's Top Players
      </CardTitle>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 hover:bg-muted rounded-full"
              aria-label="How leaderboards work"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[300px] sm:w-[360px]">
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm leading-none">How Leaderboards Work</h4>
                <p className="text-xs text-muted-foreground">
                  Compete with players around the world
                </p>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex gap-2">
                  <Trophy className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Daily Challenges Only</p>
                    <p className="text-xs text-muted-foreground">Only your daily challenge scores count toward leaderboard rankings</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Freeplay Tracking</p>
                    <p className="text-xs text-muted-foreground">Freeplay quizzes are tracked privately in your profile and dashboard</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Qualification</p>
                    <p className="text-xs text-muted-foreground">5 quizzes minimum for all-time leaderboards</p>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Link href="/leaderboard" className="text-xs text-primary hover:underline">
          View All
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <HeaderContent />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sm text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <HeaderContent />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sm text-muted-foreground">
            No entries yet. Be the first!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <HeaderContent />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = echo.user?.id === entry.echo_user_id;
            return (
              <div
                key={entry.echo_user_id}
                className={`flex items-center justify-between p-2 rounded-md border transition-colors ${getRankColor(entry.rank)} ${
                  isCurrentUser ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-[1.5rem] shrink-0">
                    {getRankIcon(entry.rank)}
                    {!getRankIcon(entry.rank) && (
                      <span className="text-sm font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {(() => {
                      const Icon = entry.avatar_id ? AVATAR_ICONS[entry.avatar_id] || Ghost : Ghost;
                      return (
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        <span className="truncate">
                          {entry.username || `User ${entry.echo_user_id.slice(0, 8)}`}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="default" className="text-xs shrink-0 h-4 px-1">You</Badge>
                        )}
                      </div>
                      {entry.total_quizzes && (
                        <div className="text-xs text-muted-foreground">
                          {entry.total_quizzes} {entry.total_quizzes === 1 ? 'quiz' : 'quizzes'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Badge variant="secondary" className="text-sm font-bold shrink-0">
                  {entry.score.toFixed(1)}%
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
