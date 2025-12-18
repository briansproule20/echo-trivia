"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Skull, BarChart3, Shuffle, BookOpen, ArrowLeft, Loader2, LogIn } from "lucide-react";
import { Suspense } from "react";

function ReadyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const echo = useEcho();
  const { user, isLoading } = echo;

  const mode = searchParams.get("mode") || "mixed";
  const category = searchParams.get("category");

  const isMixedMode = mode === "mixed";

  const handleSignIn = async () => {
    try {
      await echo.signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleBegin = () => {
    if (isMixedMode) {
      router.push("/survival/play?mode=mixed");
    } else {
      router.push(`/survival/play?mode=category&category=${encodeURIComponent(category || "")}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/survival")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Survival Hub
        </Button>

        <Card className="border-2">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold">Endless Survival</h1>
              </div>
              <Badge variant="default" className="text-xs">Beta</Badge>
            </div>

            {/* Mode indicator */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {isMixedMode ? (
                  <>
                    <Shuffle className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Mixed Mode</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Category Mode</span>
                  </>
                )}
              </div>
              {isMixedMode ? (
                <p className="text-sm text-muted-foreground">
                  Random categories will test your knowledge across all topics.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All questions from: <span className="font-medium text-foreground">{category}</span>
                </p>
              )}
            </div>

            {/* Rules */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Answer correctly to survive</p>
                  <p className="text-sm text-muted-foreground">
                    Each correct answer increases your streak
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                  <Skull className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">One wrong answer ends it</p>
                  <p className="text-sm text-muted-foreground">
                    There are no second chances in survival mode
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Easy & medium difficulty</p>
                  <p className="text-sm text-muted-foreground">
                    Questions are fair but challenging
                  </p>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">
                {isMixedMode
                  ? "How long can you survive?"
                  : `How deep does your ${category} knowledge go?`}
              </p>

              {!user ? (
                <>
                  <Button onClick={handleSignIn} size="lg" className="w-full text-lg py-6">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In to Play
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Sign in required to play and save your run to the leaderboard
                  </p>
                </>
              ) : (
                <Button onClick={handleBegin} size="lg" className="w-full text-lg py-6">
                  <Zap className="mr-2 h-5 w-5" />
                  Begin Survival
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SurvivalReadyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ReadyContent />
    </Suspense>
  );
}
