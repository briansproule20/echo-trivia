"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Swords,
  Trophy,
  Medal,
  Award,
  Users,
  Clock,
  Share2,
  Play,
  ChevronDown,
  ChevronUp,
  Plus,
  Copy,
  Check,
  Loader2,
  User,
  Skull,
  Ghost,
  Cat,
  Shield,
  Target,
  Glasses,
  TreePine,
  Flame,
  Zap,
  Crown,
  Anchor,
  Bird,
  Bug,
  Snowflake,
  Cherry,
} from "lucide-react";
import type { FaceoffChallengeSummary } from "@/app/api/faceoff/my-challenges/route";

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

interface FaceoffLeaderboardEntry {
  echo_user_id: string;
  username: string | null;
  avatar_id: string | null;
  score: number;
  score_percentage: number;
  time_taken: number | null;
  completed_at: string;
  rank: number;
}

function ChallengeCard({
  challenge,
  currentUserId,
  onCopy,
}: {
  challenge: FaceoffChallengeSummary;
  currentUserId?: string;
  onCopy: (shareCode: string) => void;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<FaceoffLeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = currentUserId === challenge.creator_echo_user_id;
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/faceoff/${challenge.share_code}`;

  const fetchLeaderboard = async () => {
    if (leaderboard.length > 0) return; // Already loaded
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(`/api/faceoff/${challenge.share_code}/leaderboard?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchLeaderboard();
    }
    setIsOpen(!isOpen);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onCopy(challenge.share_code);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-700" />;
    return null;
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={`overflow-hidden ${isOwner ? "border-primary/30" : ""}`}>
      <Collapsible open={isOpen} onOpenChange={handleToggle}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg truncate">
                  {challenge.settings.category}
                </CardTitle>
                {isOwner && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Yours
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-3 text-xs">
                <span>{challenge.settings.num_questions} questions</span>
                <span className="capitalize">{challenge.settings.difficulty}</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {challenge.times_played} plays
                </span>
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Creator info */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>
                Created by{" "}
                <span className="font-medium text-foreground">
                  {challenge.creator_username || "Anonymous"}
                </span>
              </span>
              {challenge.creator_score !== null && (
                <Badge variant="outline" className="text-xs">
                  Score: {challenge.creator_score}/{challenge.settings.num_questions}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(challenge.created_at)}
            </span>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Leaderboard */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Leaderboard</span>
              </div>

              {loadingLeaderboard ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No challengers yet. Be the first!
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const Icon = entry.avatar_id
                      ? AVATAR_ICONS[entry.avatar_id] || Ghost
                      : Ghost;
                    const isCurrentUser = currentUserId === entry.echo_user_id;
                    return (
                      <div
                        key={entry.echo_user_id}
                        className={`flex items-center justify-between p-2 rounded-md border ${
                          isCurrentUser ? "ring-1 ring-primary bg-primary/5" : "bg-background"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 text-center">
                            {getRankIcon(entry.rank) || (
                              <span className="text-xs font-bold text-muted-foreground">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[120px]">
                            {entry.username || "Anonymous"}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="default" className="text-xs h-4 px-1">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(entry.time_taken)}
                          </span>
                          <Badge variant="secondary" className="font-bold">
                            {entry.score_percentage}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => router.push(`/faceoff/${challenge.share_code}`)}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Play Challenge
              </Button>
              <Button variant="outline" onClick={handleCopy} className="shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function FaceoffHubPage() {
  const echo = useEcho();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [challenges, setChallenges] = useState<FaceoffChallengeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [filter, echo.user?.id]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "mine" && echo.user?.id) {
        params.set("filter", "mine");
        params.set("echo_user_id", echo.user.id);
      }
      params.set("limit", "50");

      const response = await fetch(`/api/faceoff/my-challenges?${params}`);
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shareCode: string) => {
    setCopiedCode(shareCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Swords className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">Faceoff Hub</h1>
              <Badge variant="default" className="ml-2">Beta</Badge>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Browse all challenges, compete on leaderboards, or create your own
            </p>
          </div>

          {/* Create New Challenge CTA */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold">Ready to challenge your friends?</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom quiz and share it with anyone
                </p>
              </div>
              <Link href="/faceoff">
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Challenge
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto">
              <TabsTrigger value="all">All Challenges</TabsTrigger>
              <TabsTrigger value="mine" disabled={!echo.user}>
                My Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : challenges.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">
                      {filter === "mine" ? "No challenges yet" : "No challenges found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {filter === "mine"
                        ? "Create your first challenge and share it with friends!"
                        : "Be the first to create a challenge!"}
                    </p>
                    <Link href="/faceoff">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Challenge
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={echo.user?.id}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
