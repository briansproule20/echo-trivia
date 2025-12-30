"use client";

import { useEffect, useState } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TowerLeaderboardEntry {
  echo_user_id: string;
  username: string | null;
  highest_floor: number;
  rank: number;
}

export default function TowerLeaderboardPage() {
  const echo = useEcho();
  const [leaderboard, setLeaderboard] = useState<TowerLeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<TowerLeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [echo.user?.id]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const echoUserIdParam = echo.user?.id ? `&echo_user_id=${echo.user.id}` : '';
      const response = await fetch(`/api/tower/leaderboard?limit=25${echoUserIdParam}`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setUserPosition(data.userPosition || null);
    } catch (error) {
      console.error('Error fetching tower leaderboard:', error);
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
    <div className="min-h-screen relative">
      {/* Mobile: Fixed background */}
      <div className="fixed md:hidden inset-0 bg-cover bg-top bg-no-repeat" style={{ backgroundImage: 'url(/trivwiztower.png)' }} />
      <div className="fixed md:hidden inset-0 bg-background/40 backdrop-blur-[2px]" />

      {/* Desktop: Scrollable image wrapper */}
      <div className="hidden md:block absolute inset-x-0 top-0">
        <div className="relative w-full">
          <img src="/trivwiztower.png" alt="" className="w-full h-auto" />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link href="/campaign">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="sm">
                All Leaderboards
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="secondary">Wizard&apos;s Tower</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold">Leaderboard</h1>
          </div>

          {/* Leaderboard Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Top Climbers</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-muted-foreground">No climbers yet.</p>
                  <Button asChild>
                    <Link href="/campaign/levels">Enter the Tower</Link>
                  </Button>
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
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-[3rem] shrink-0">
                            {getRankIcon(entry.rank)}
                            {!getRankIcon(entry.rank) && (
                              <span className="text-lg font-bold text-muted-foreground">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate">
                              {entry.username || `User ${entry.echo_user_id.slice(0, 8)}`}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="default" className="text-xs shrink-0">You</Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm font-bold shrink-0">
                          Floor {entry.highest_floor}
                        </Badge>
                      </div>
                    );
                  })}

                  {/* User Position if not in top 25 */}
                  {userPosition && (
                    <>
                      <div className="flex items-center justify-center py-2">
                        <div className="text-sm text-muted-foreground">• • •</div>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border ring-2 ring-primary bg-primary/5">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-[3rem] shrink-0">
                            <User className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold text-primary">
                              #{userPosition.rank}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate">
                              {userPosition.username || `User ${userPosition.echo_user_id.slice(0, 8)}`}
                            </span>
                            <Badge variant="default" className="text-xs shrink-0">You</Badge>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm font-bold shrink-0">
                          Floor {userPosition.highest_floor}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
