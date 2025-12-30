"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, AlertCircle, TrendingUp, Award, Cloud, HardDrive, Flame, Swords, LayoutGrid, Calendar, PlayCircle, Castle } from "lucide-react";
import { storage } from "@/lib/storage";
import type { Session } from "@/lib/types";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// Type for cloud sessions from Supabase
interface CloudSession {
  id: string;
  category: string;
  num_questions: number;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  difficulty: string | null;
  quiz_type: string | null;
  is_daily: boolean;
  daily_date: string | null;
  title: string | null;
  completed_at: string;
  time_taken: number | null;
  game_mode: string | null;
  jeopardy_score?: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const echo = useEcho();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [cloudSessions, setCloudSessions] = useState<CloudSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud');
  const [totalCloudSessions, setTotalCloudSessions] = useState(0);

  const loadLocalSessions = async () => {
    const allSessions = await storage.getSessions();
    setSessions(allSessions);
  };

  const loadCloudSessions = async () => {
    if (!echo.user?.id) return;

    setCloudLoading(true);
    try {
      const response = await fetch(`/api/quiz/history?echo_user_id=${echo.user.id}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setCloudSessions(data.sessions || []);
        setTotalCloudSessions(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading cloud sessions:', error);
    } finally {
      setCloudLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadLocalSessions();
      if (echo.user?.id) {
        await loadCloudSessions();
      }
      setLoading(false);
    };
    load();
  }, [echo.user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Render cloud session card
  const renderCloudSessionCard = (session: CloudSession, idx: number) => {
    const percentage = Math.round(session.score_percentage);
    const timeElapsed = session.time_taken || 0;
    const isSurvival = session.game_mode === "endless";
    const isJeopardy = session.game_mode === "jeopardy";
    const isFaceoff = session.game_mode === "faceoff";
    const isCampaign = session.game_mode === "campaign";

    let resultsUrl: string;
    if (isSurvival) {
      resultsUrl = `/survival/results/${session.id}`;
    } else if (isJeopardy) {
      resultsUrl = `/jeopardy/results/${session.id}`;
    } else if (isCampaign) {
      resultsUrl = `/campaign/levels`; // Campaign results go back to levels page
    } else {
      resultsUrl = `/results/${session.id}?cloud=true`;
    }

    const isDaily = session.is_daily;

    // Get game mode info
    const gameModeInfo = isSurvival
      ? { icon: Flame, label: "Survival" }
      : isJeopardy
      ? { icon: LayoutGrid, label: "Jeopardy" }
      : isFaceoff
      ? { icon: Swords, label: "Face-Off" }
      : isCampaign
      ? { icon: Castle, label: "Campaign" }
      : isDaily
      ? { icon: Calendar, label: "Daily" }
      : { icon: PlayCircle, label: "Freeplay" };
    const GameModeIcon = gameModeInfo.icon;

    // Get the title based on game mode
    const getTitle = () => {
      if (isSurvival) return session.category;
      if (isJeopardy) return session.title || "Jeopardy";
      if (isFaceoff) return session.category;
      if (isCampaign) return session.category;
      return session.category;
    };

    // Get the subtitle based on game mode
    const getSubtitle = () => {
      if (isSurvival) return "Endless Mode";
      if (isJeopardy) return `${session.correct_answers}/${session.total_questions} correct`;
      if (isFaceoff) return session.title || 'Quiz';
      if (isCampaign) return session.title || "The Wizard's Tower";
      return session.title || 'Quiz';
    };

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
        onClick={() => router.push(resultsUrl)}
        className="cursor-pointer"
      >
        <Card className={`group relative overflow-hidden backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
          isCampaign
            ? "border-indigo-500/30 bg-indigo-950/20 hover:border-indigo-500/50"
            : "border-border/50 bg-card/50 hover:border-border"
        }`}>
          {/* Gradient overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isCampaign
              ? "bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent"
              : "bg-gradient-to-br from-primary/5 via-transparent to-transparent"
          }`} />

          <CardHeader className="space-y-2 pb-3">
            <div className={`flex items-center gap-1.5 text-xs ${isCampaign ? "text-indigo-400" : "text-muted-foreground"}`}>
              <GameModeIcon className={`h-3 w-3 ${isCampaign ? "text-indigo-400" : ""}`} />
              <span>{gameModeInfo.label}</span>
              <span className="mx-1">·</span>
              <span>{formatDate(session.completed_at)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-0.5">
                <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {getTitle()}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1">
                  {getSubtitle()}
                </CardDescription>
              </div>
              {isSurvival ? (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-2.5 py-1 text-sm font-semibold shrink-0"
                >
                  <Flame className="h-3 w-3" />
                  {session.correct_answers}
                </Badge>
              ) : isJeopardy ? (
                <Badge
                  variant={(session.jeopardy_score ?? 0) >= 0 ? "default" : "destructive"}
                  className="flex items-center gap-1 px-2.5 py-1 text-sm font-semibold shrink-0"
                >
                  <LayoutGrid className="h-3 w-3" />
                  {(session.jeopardy_score ?? 0) >= 0 ? "+" : ""}{session.jeopardy_score ?? 0}
                </Badge>
              ) : isFaceoff ? (
                <Badge
                  variant={percentage >= 70 ? "default" : "secondary"}
                  className="flex items-center gap-1 px-2.5 py-1 text-sm font-semibold shrink-0"
                >
                  <Swords className="h-3 w-3" />
                  {percentage}%
                </Badge>
              ) : isCampaign ? (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-2.5 py-1 text-sm font-semibold shrink-0 bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                >
                  <Castle className="h-3 w-3" />
                  {session.correct_answers}/5
                </Badge>
              ) : (
                <Badge
                  variant={percentage >= 70 ? "default" : "secondary"}
                  className="flex items-center gap-1 px-2.5 py-1 text-sm font-semibold shrink-0"
                >
                  {percentage >= 70 && <Award className="h-3 w-3" />}
                  {percentage}%
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy className={`h-3.5 w-3.5 ${isCampaign ? "text-indigo-400" : "text-primary"}`} />
                <span className="font-medium">
                  {isSurvival ? session.correct_answers : `${session.correct_answers}/${session.total_questions}`}
                </span>
              </div>
              {timeElapsed > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeElapsed}s</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`w-full mt-auto transition-colors pointer-events-none md:pointer-events-auto ${
                isCampaign
                  ? "border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500"
                  : "group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                router.push(resultsUrl);
              }}
            >
              {isCampaign ? "View Tower" : "View Results"}
              <TrendingUp className="ml-2 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render local session card
  const renderLocalSessionCard = (session: Session, idx: number) => {
    const score = session.submissions.filter((s) => s.correct).length;
    const percentage = Math.round((score / session.quiz.questions.length) * 100);
    const timeElapsed = session.endedAt && session.startedAt
      ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
      : 0;

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
        onClick={() => router.push(`/results/${session.id}`)}
        className="cursor-pointer"
      >
        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              <span>Local</span>
              <span className="mx-1">·</span>
              <span>{formatDate(session.startedAt)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-0.5">
                <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {session.quiz.category}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1">
                  {session.quiz.title || 'Quiz'}
                </CardDescription>
              </div>
              <Badge
                variant={percentage >= 70 ? "default" : "secondary"}
                className="flex items-center gap-1 px-2.5 py-1 text-sm font-semibold shrink-0"
              >
                {percentage >= 70 && <Award className="h-3 w-3" />}
                {percentage}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{score}/{session.quiz.questions.length}</span>
              </div>
              {timeElapsed > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeElapsed}s</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors pointer-events-none md:pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/results/${session.id}`);
              }}
            >
              View Results
              <TrendingUp className="ml-2 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-8">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight pb-1">
              Quiz History
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mt-2">
              {echo.user ? 'Your quiz sessions synced across devices' : 'View your recent quiz sessions'}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          )}

          {/* Not signed in - show local only */}
          {!loading && !echo.user && (
            <>
              {sessions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Quiz History</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      You haven't completed any quizzes yet. Sign in to sync your history across devices!
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => router.push("/daily")}>
                        Daily Quiz
                      </Button>
                      <Button onClick={() => router.push("/freeplay")} variant="outline">
                        Freeplay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((session, idx) => renderLocalSessionCard(session, idx))}
                </div>
              )}
            </>
          )}

          {/* Signed in - show tabs for cloud/local */}
          {!loading && echo.user && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'cloud' | 'local')}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="cloud" className="gap-2">
                  <Cloud className="h-4 w-4" />
                  Cloud ({totalCloudSessions})
                </TabsTrigger>
                <TabsTrigger value="local" className="gap-2">
                  <HardDrive className="h-4 w-4" />
                  This Device ({sessions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cloud" className="mt-6">
                {cloudLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading cloud sessions...</p>
                  </div>
                ) : cloudSessions.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Cloud History</h3>
                      <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Complete a quiz while signed in to sync your history to the cloud!
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={() => router.push("/daily")}>
                          Daily Quiz
                        </Button>
                        <Button onClick={() => router.push("/freeplay")} variant="outline">
                          Freeplay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cloudSessions.map((session, idx) => renderCloudSessionCard(session, idx))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="local" className="mt-6">
                {sessions.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <HardDrive className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Local History</h3>
                      <p className="text-muted-foreground mb-6 text-center max-w-md">
                        No sessions stored on this device. Your cloud history is synced above!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session, idx) => renderLocalSessionCard(session, idx))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
