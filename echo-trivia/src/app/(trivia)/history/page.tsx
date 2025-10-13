"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Trash2, AlertCircle } from "lucide-react";
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
            <div className="space-y-4">
              {sessions.map((session) => {
                const score = session.submissions.filter((s) => s.correct).length;
                const percentage = Math.round((score / session.quiz.questions.length) * 100);
                const timeElapsed = session.endedAt && session.startedAt
                  ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
                  : 0;

                return (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl truncate">{session.quiz.title}</CardTitle>
                          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <span className="truncate">{session.quiz.category}</span>
                            <span className="hidden sm:inline text-xs">•</span>
                            <span className="text-xs truncate">{formatDate(session.startedAt)}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={percentage >= 70 ? "default" : "secondary"} className="text-base sm:text-lg px-2 sm:px-3 py-1 flex-shrink-0">
                          {percentage}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Trophy className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{score} / {session.quiz.questions.length} correct</span>
                          </div>
                          {timeElapsed > 0 && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="whitespace-nowrap">{timeElapsed}s</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/results/${session.id}`)}
                            className="flex-1 sm:flex-none"
                          >
                            View Results
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex-shrink-0">
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
