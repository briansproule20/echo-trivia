"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, PlayCircle, Trophy, Clock } from "lucide-react";
import { storage } from "@/lib/storage";
import type { Session } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      const sessions = await storage.getSessions();
      setRecentSessions(sessions.slice(0, 3));
    };
    loadSessions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Trivia Wizard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test knowledge, challenge yourself, and learn something new every day
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <Card className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full" onClick={() => router.push("/daily")}>
            <CardHeader className="flex-1">
              <Calendar className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle>Daily Quiz</CardTitle>
              <CardDescription className="line-clamp-2">
                One curated quiz per day - test yourself with today's challenge
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
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription className="line-clamp-2">
                Choose category, difficulty, and style - play instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start Practicing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Recent Sessions</h2>
              <Button variant="outline" onClick={() => router.push("/history")}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSessions.map((session) => {
                const score = session.submissions.filter((s) => s.correct).length;
                const percentage = Math.round((score / session.quiz.questions.length) * 100);
                const timeElapsed = session.endedAt && session.startedAt
                  ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
                  : 0;
                
                return (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{session.quiz.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{session.quiz.category}</CardDescription>
                        </div>
                        <Badge variant={percentage >= 70 ? "default" : "secondary"} className="ml-2">
                          {percentage}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Trophy className="mr-2 h-4 w-4 flex-shrink-0" />
                        {score} / {session.quiz.questions.length} correct
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                        {timeElapsed}s
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-auto"
                        onClick={() => router.push(`/results/${session.id}`)}
                      >
                        View Results
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
