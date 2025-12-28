"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, PlayCircle, Trophy, Clock, TrendingUp, Award, Cloud, Swords, Flame, LayoutGrid } from "lucide-react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { motion } from "framer-motion";
import { DotBackground } from "@/components/ui/dot-background";
import { MiniLeaderboard } from "@/components/trivia/MiniLeaderboard";
import { CommunityLoreSection } from "@/components/trivia/CommunityLoreSection";
import { Footer } from "@/components/Footer";
import { FlipText } from "@/components/ui/flip-text";
import { FinishQuizFlurp } from "@/components/trivia/FinishQuizFlurp";
import { ChatWidget } from "@/components/ChatWidget";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

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

export default function HomePage() {
  const router = useRouter();
  const echo = useEcho();
  const [recentSessions, setRecentSessions] = useState<CloudSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlurp, setShowFlurp] = useState(false);
  const [pendingResultsId, setPendingResultsId] = useState<string | null>(null);
  const [pendingGameMode, setPendingGameMode] = useState<string | null>(null);

  const handleViewResults = (sessionId: string, gameMode: string = "default") => {
    setPendingResultsId(sessionId);
    setPendingGameMode(gameMode);
    setShowFlurp(true);
  };

  const handleFlurpComplete = () => {
    if (pendingResultsId) {
      let url: string;
      if (pendingGameMode === "endless") {
        url = `/survival/results/${pendingResultsId}`;
      } else if (pendingGameMode === "jeopardy") {
        url = `/jeopardy/results/${pendingResultsId}`;
      } else {
        url = `/results/${pendingResultsId}?cloud=true`;
      }
      router.push(url);
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      if (!echo.user?.id) {
        setRecentSessions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/quiz/history?echo_user_id=${echo.user.id}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRecentSessions(data.sessions || []);
        }
      } catch (error) {
        console.error('Error loading cloud sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [echo.user?.id]);

  return (
    <>
    <FinishQuizFlurp isVisible={showFlurp} onExpanded={handleFlurpComplete} />
    <ChatWidget />
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <AnimatedGradientText>
                Trivia Wizard
              </AnimatedGradientText>
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-foreground/80 max-w-4xl mx-auto leading-relaxed">
            Summon Your Inner <FlipText words={["Ken Jennings", "Quiz Whiz", "Mastermind", "Pub Champion", "Genius", "Alex Trebek", "Know-It-All", "Scholar", "Trivia Master", "Champion"]} duration={3000} className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-semibold" />
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Daily trivia challenges,<br className="sm:hidden" /> infinite customizable freeplay, and more
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <Card className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full" onClick={() => router.push("/daily")}>
            <CardHeader className="flex-1">
              <Calendar className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-xl">Daily Quiz</CardTitle>
              <CardDescription className="line-clamp-2">
                One curated challenge every day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.button
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 text-primary-foreground shadow bg-[length:200%_100%] bg-gradient-to-r from-primary via-primary/60 via-50% to-primary"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 20px -10px var(--primary)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  scale: { duration: 0.2 },
                  boxShadow: { duration: 0.2 },
                }}
                onClick={() => router.push("/daily")}
              >
                Play Today's Quiz
              </motion.button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full" onClick={() => router.push("/freeplay")}>
            <CardHeader className="flex-1">
              <PlayCircle className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-xl">Freeplay</CardTitle>
              <CardDescription className="line-clamp-2">
                Unlimited quizzes on any topic you want
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start Playing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Beta Game Modes CTA */}
        <div className="max-w-3xl mx-auto mb-10">
          <Card className="relative px-6 py-4">
            <Badge className="absolute -top-2.5 left-4 text-xs">
              Beta
            </Badge>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium">
                Help me test new game modes!
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href="/faceoff">
                    <Swords className="mr-1.5 h-3.5 w-3.5" />
                    Face-Off
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/survival">
                    <Flame className="mr-1.5 h-3.5 w-3.5" />
                    Survival
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/jeopardy">
                    <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                    Jeopardy
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Mini Leaderboard */}
        <div className="max-w-3xl mx-auto mb-12">
          <MiniLeaderboard />
        </div>

        {/* Community Lore Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <CommunityLoreSection />
        </div>

        {/* Recent Sessions - Cloud History for signed-in users */}
        {echo.user && !loading && recentSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">Recent Sessions</h2>
                  <Cloud className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Your latest quiz performances, synced across devices</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/history")}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentSessions.map((session, idx) => {
                const percentage = Math.round(session.score_percentage);
                const timeElapsed = session.time_taken || 0;
                const isSurvival = session.game_mode === "endless";
                const isJeopardy = session.game_mode === "jeopardy";
                const isFaceoff = session.game_mode === "faceoff";
                const isDaily = session.is_daily;

                // Get game mode icon and label
                const gameModeInfo = isSurvival
                  ? { icon: Flame, label: "Survival" }
                  : isJeopardy
                  ? { icon: LayoutGrid, label: "Jeopardy" }
                  : isFaceoff
                  ? { icon: Swords, label: "Face-Off" }
                  : isDaily
                  ? { icon: Calendar, label: "Daily" }
                  : { icon: PlayCircle, label: "Freeplay" };
                const GameModeIcon = gameModeInfo.icon;

                // Format relative time
                const getRelativeTime = (dateString: string, dailyDate: string | null) => {
                  const date = new Date(dateString);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return "Just now";
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  // Only show "Yesterday" for daily quizzes from yesterday's date
                  if (diffDays === 1 && dailyDate) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    if (dailyDate === yesterdayStr) return "Yesterday";
                  }
                  if (diffDays < 7) return `${diffDays}d ago`;
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                };

                const handleClick = () => {
                  handleViewResults(session.id, session.game_mode || "default");
                };

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    onClick={handleClick}
                    className="cursor-pointer"
                  >
                    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardHeader className="space-y-2 pb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GameModeIcon className="h-3 w-3" />
                          <span>{gameModeInfo.label}</span>
                          <span className="mx-1">·</span>
                          <span>{getRelativeTime(session.completed_at, session.daily_date)}</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {isSurvival ? session.category : isJeopardy ? session.title : isFaceoff ? session.category : session.category}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-1">
                              {isSurvival ? "Endless Mode" : isJeopardy ? `${session.correct_answers}/${session.total_questions} correct` : isFaceoff ? session.title : session.title}
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
                            <Trophy className="h-3.5 w-3.5 text-primary" />
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
                          className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors pointer-events-none md:pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                          }}
                        >
                          View Results
                          <TrendingUp className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </DotBackground>
    </>
  );
}
