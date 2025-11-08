"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Zap, Lock } from "lucide-react";
import { CATEGORIES, type Category, type Difficulty, type QuestionType, type Quiz, type Session } from "@/lib/types";
import { usePlayStore } from "@/lib/store";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/quiz-utils";
import { useEcho } from "@merit-systems/echo-react-sdk";

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Load settings from URL parameters
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlNumQuestions = searchParams.get("numQuestions");
    const urlDifficulty = searchParams.get("difficulty");
    const urlType = searchParams.get("type");

    if (urlCategory) {
      // Check if it's a preset category
      const isPresetCategory = CATEGORIES.includes(urlCategory as Category);
      if (isPresetCategory) {
        setCategory(urlCategory as Category);
      } else {
        // It's a custom category
        setCategory("custom");
        setCustomCategory(urlCategory);
      }
    }

    if (urlNumQuestions) {
      const num = parseInt(urlNumQuestions);
      if (!isNaN(num)) {
        setNumQuestions(num);
      }
    }

    if (urlDifficulty) {
      setDifficulty(urlDifficulty as Difficulty | "mixed");
    }

    if (urlType) {
      setQuestionType(urlType as QuestionType | "mixed");
    }
  }, [searchParams]);

  const handleStartPractice = async () => {
    if (generating) return;

    // Check if user is signed in
    if (!user) {
      setError("Please sign in to use AI-powered quiz generation");
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

      // Customize title/description and ensure category is preserved
      quiz.title = `${finalCategory} Practice`;
      quiz.description = `${numQuestions} questions • ${difficulty === "mixed" ? "Mixed" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty`;
      quiz.category = finalCategory; // Explicitly set the category to ensure custom categories are preserved

      const session: Session = {
        id: generateId(),
        quiz,
        startedAt: new Date().toISOString(),
        submissions: [],
      };

      setSession(session);
      await storage.saveSession(session);
      router.push(`/play/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz. Please try again.");
      setGenerating(false);
    }
  };

  const handleSignIn = () => {
    setIsSigningIn(true);
    signIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-12 space-y-2 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight pb-1">
              Practice Mode
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground">
              Customize and play instantly
            </p>
          </div>

          {/* Practice Configuration Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-3xl">Configure Your Practice</CardTitle>
                  <CardDescription className="text-base">
                    AI-powered custom quiz generation
                  </CardDescription>
                </div>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sign-in Prompt */}
              {!user && !echoLoading && (
                <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Sign In Required</h3>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Connect your Echo account to unlock AI-powered trivia generation
                  </p>
                  <Button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="w-full"
                    size="lg"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Sign In with Echo
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Category Selection */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-base font-semibold">
                  Category
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Preset Category Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="presetCategory" className="text-sm text-muted-foreground">
                      Preset Categories
                    </Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as Category | "custom")} disabled={!user}>
                      <SelectTrigger id="presetCategory" className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {[...CATEGORIES].sort().map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Category Input - Always Visible */}
                  <div className="space-y-2">
                    <Label htmlFor="customCategory" className="text-sm text-muted-foreground">
                      Or Create Your Own
                    </Label>
                    <Input
                      id="customCategory"
                      type="text"
                      placeholder="e.g., Star Wars, Marvel..."
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        // Auto-select "custom" when user types
                        if (e.target.value.trim() && category !== "custom") {
                          setCategory("custom");
                        }
                      }}
                      disabled={!user}
                      className="w-full"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {category === "custom" && customCategory.trim()
                    ? `Quiz will be generated on: ${customCategory}`
                    : `Using ${category === "custom" ? "custom category" : category}`}
                </p>
              </div>

              {/* Number of Questions */}
              <div className="space-y-3">
                <Label htmlFor="numQuestions" className="text-base font-semibold">
                  Number of Questions
                </Label>
                <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))} disabled={!user}>
                  <SelectTrigger id="numQuestions" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label htmlFor="difficulty" className="text-base font-semibold">
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty | "mixed")} disabled={!user}>
                  <SelectTrigger id="difficulty" className="w-full">
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
              <div className="space-y-3">
                <Label htmlFor="questionType" className="text-base font-semibold">
                  Question Type
                </Label>
                <Select value={questionType} onValueChange={(value) => setQuestionType(value as QuestionType | "mixed")} disabled={!user}>
                  <SelectTrigger id="questionType" className="w-full">
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

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="text-sm font-semibold text-muted-foreground">Practice Summary</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {category === "custom" ? (customCategory || "Custom Category") : category}
                  </Badge>
                  <Badge variant="secondary">{numQuestions} questions</Badge>
                  <Badge variant="secondary">{difficulty === "mixed" ? "Mixed" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Badge>
                  <Badge variant="secondary">
                    {questionType === "mixed" ? "Mixed types" : questionType === "multiple_choice" ? "Multiple Choice" : questionType === "true_false" ? "True/False" : "Short Answer"}
                  </Badge>
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartPractice}
                size="lg"
                className="w-full"
                disabled={generating || !user}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Practice Quiz...
                  </>
                ) : !user ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In to Start
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Practice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}

