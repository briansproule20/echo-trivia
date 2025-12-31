"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Swords, Loader2, Share2, Info, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, type Category, type Difficulty, type QuestionType, type Quiz, type Session } from "@/lib/types";
import { usePlayStore } from "@/lib/store";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/quiz-utils";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Alert, AlertDescription } from "@/components/ui/alert";

function FaceoffContent() {
  const router = useRouter();
  const { setSession } = usePlayStore();
  const { user, signIn, isLoading: echoLoading } = useEcho();

  // Form state
  const [category, setCategory] = useState<Category | "custom">("General Knowledge");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty | "mixed">("mixed");
  const [questionType, setQuestionType] = useState<QuestionType | "mixed">("mixed");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateChallenge = async () => {
    if (generating) return;

    // Check if user is signed in
    if (!user) {
      setError("Please sign in to create a challenge");
      return;
    }

    // Validate custom category if selected
    if (category === "custom" && !customCategory.trim()) {
      setError("Please enter a custom category");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const finalCategory = category === "custom" ? customCategory.trim() : category;

      const response = await fetch("/api/trivia/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            category: finalCategory,
            numQuestions,
            difficulty,
            type: questionType,
            style: "classic",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const quiz: Quiz = await response.json();

      // Customize title/description
      quiz.title = `${finalCategory} Faceoff`;
      quiz.description = `${numQuestions} questions • ${difficulty === "mixed" ? "Mixed" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty`;
      quiz.category = finalCategory;
      // DO NOT set seeded - this is not a daily quiz
      quiz.seeded = false;

      const session: Session = {
        id: generateId(),
        quiz,
        startedAt: new Date().toISOString(),
        submissions: [],
        gameMode: 'faceoff',
      };

      setSession(session);
      await storage.saveSession(session);
      router.push(`/play/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz. Please try again.");
      setGenerating(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Swords className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Faceoff</h1>
            </div>
            <p className="text-muted-foreground">
              Create a custom challenge and share it with friends
            </p>
            <Link
              href="/faceoff/hub"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <LayoutGrid className="h-4 w-4" />
              Browse the Faceoff Hub
            </Link>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              After completing your challenge, you'll get a shareable link. Your friends will face the exact same questions!
            </AlertDescription>
          </Alert>

          {/* Sign In Required */}
          {!user && !echoLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Sign In Required</CardTitle>
                <CardDescription>
                  You need to be signed in to create challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSignIn} className="w-full" size="lg">
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quiz Settings Form */}
          {(user || echoLoading) && (
            <Card>
              <CardHeader>
                <CardTitle>Challenge Settings</CardTitle>
                <CardDescription>
                  Configure your challenge - all players will face these exact questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as Category | "custom")}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Category...</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Custom Category Input - Always Visible */}
                  <Input
                    placeholder="Enter custom category (e.g., 'SpongeBob Trivia')"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      // Auto-switch to custom when user types
                      if (e.target.value.trim() && category !== "custom") {
                        setCategory("custom");
                      }
                    }}
                    className="mt-2"
                  />
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <Label htmlFor="numQuestions">Number of Questions</Label>
                  <Select
                    value={numQuestions.toString()}
                    onValueChange={(value) => setNumQuestions(parseInt(value))}
                  >
                    <SelectTrigger id="numQuestions">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value) => setDifficulty(value as Difficulty | "mixed")}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Question Type</Label>
                  <Select
                    value={questionType}
                    onValueChange={(value) => setQuestionType(value as QuestionType | "mixed")}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Create Challenge Button */}
                <Button
                  onClick={handleCreateChallenge}
                  disabled={generating || !user}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Challenge...
                    </>
                  ) : (
                    <>
                      <Swords className="mr-2 h-4 w-4" />
                      Create Challenge
                    </>
                  )}
                </Button>

                {/* Faceoff Hub Link */}
                <div className="pt-4 border-t">
                  <Link href="/faceoff/hub" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Browse all challenges in the Faceoff Hub</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FaceoffPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-96" />}>
      <FaceoffContent />
    </Suspense>
  );
}
