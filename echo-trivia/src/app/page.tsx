"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, PlayCircle, Trophy, Clock, TrendingUp, Award } from "lucide-react";
import { storage } from "@/lib/storage";
import type { Session } from "@/lib/types";
import { motion } from "framer-motion";
import { DotBackground } from "@/components/ui/dot-background";
import { MiniLeaderboard } from "@/components/trivia/MiniLeaderboard";
import { CommunityLoreSection } from "@/components/trivia/CommunityLoreSection";
import { Footer } from "@/components/Footer";
import { FlipText } from "@/components/ui/flip-text";
import { FinishQuizFlurp } from "@/components/trivia/FinishQuizFlurp";
import { ChatWidget } from "@/components/ChatWidget";

export default function HomePage() {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [showFlurp, setShowFlurp] = useState(false);
  const [pendingResultsId, setPendingResultsId] = useState<string | null>(null);

  const handleViewResults = (sessionId: string) => {
    setPendingResultsId(sessionId);
    setShowFlurp(true);
  };

  const handleFlurpComplete = () => {
    if (pendingResultsId) {
      router.push(`/results/${pendingResultsId}`);
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      const sessions = await storage.getSessions();
      setRecentSessions(sessions.slice(0, 3));
    };
    loadSessions();
  }, []);

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
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Trivia Wizard
              </span>
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-foreground/80 max-w-4xl mx-auto leading-relaxed">
            Summon Your Inner <FlipText words={["Ken Jennings", "Quiz Whiz", "Mastermind", "Pub Champion", "Genius", "Alex Trebek", "Know-It-All", "Scholar", "Trivia Master", "Champion"]} duration={3000} className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-semibold" />
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Daily trivia challenges, infinite customizable practice
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
              <Button className="w-full" variant="default">
                Play Today's Quiz
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full" onClick={() => router.push("/practice")}>
            <CardHeader className="flex-1">
              <PlayCircle className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-xl">Practice Mode</CardTitle>
              <CardDescription className="line-clamp-2">
                Unlimited quizzes on any topic you want
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start Practicing
              </Button>
            </CardContent>
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

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Recent Sessions</h2>
                <p className="text-sm text-muted-foreground">Your latest quiz performances</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/history")}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentSessions.map((session, idx) => {
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
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    onClick={() => handleViewResults(session.id)}
                    className="cursor-pointer"
                  >
                    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardHeader className="space-y-3 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-1">
                            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {session.quiz.title}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-1">
                              {session.quiz.category}
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

                      <CardContent className="space-y-3 pt-0 flex-1 flex flex-col">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                              <Trophy className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="text-sm font-semibold">
                                {score} / {session.quiz.questions.length}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted text-muted-foreground">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Time</p>
                              <p className="text-sm font-semibold">{timeElapsed}s</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors pointer-events-none md:pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewResults(session.id);
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
