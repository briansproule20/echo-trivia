"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Trash2, AlertCircle, TrendingUp, Award } from "lucide-react";
import { storage } from "@/lib/storage";
import type { Session } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    const allSessions = await storage.getSessions();
    setSessions(allSessions);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = async (id: string) => {
    await storage.deleteSession(id);
    await loadSessions();
  };

  const handleDeleteAllSessions = async () => {
    await storage.deleteAllSessions();
    await loadSessions();
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-8">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight pb-1">
                Quiz History
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mt-2">
                View and manage your quiz sessions
              </p>
            </div>
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto flex-shrink-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {sessions.length} quiz sessions from your history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllSessions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && sessions.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Quiz History</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  You haven't completed any quizzes yet. Start playing to see your history here!
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push("/daily")}>
                    Daily Quiz
                  </Button>
                  <Button onClick={() => router.push("/practice")} variant="outline">
                    Practice Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessions List */}
          {!loading && sessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session, idx) => {
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

                      {/* Delete button */}
                      <div className="absolute top-3 right-3 z-10">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{session.quiz.title}" from your history. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSession(session.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <CardHeader className="space-y-3 pb-4">
                        <div className="flex items-start justify-between gap-3 pr-8">
                          <div className="flex-1 min-w-0 space-y-1">
                            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {session.quiz.title}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-1">
                              {session.quiz.category}
                            </CardDescription>
                            <CardDescription className="text-xs">
                              {formatDate(session.startedAt)}
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

                          {timeElapsed > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted text-muted-foreground">
                                <Clock className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Time</p>
                                <p className="text-sm font-semibold">{timeElapsed}s</p>
                              </div>
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
