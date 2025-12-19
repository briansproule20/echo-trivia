"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Grid3X3, Lock, LogIn, ArrowLeft, Shuffle, Dices, ChevronDown, Check, Pencil } from "lucide-react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategorySelection = string; // category name, "random", or custom value

export default function JeopardyPage() {
  const { user, signIn, isLoading: echoLoading } = useEcho();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<3 | 5 | null>(null);
  const [categories, setCategories] = useState<CategorySelection[]>([]);
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
      setError("Failed to sign in. Please try again.");
    }
  };

  const handleSelectMode = (categoryCount: 3 | 5) => {
    setMode(categoryCount);
    setCategories(Array(categoryCount).fill("random"));
    setSearchQueries(Array(categoryCount).fill(""));
  };

  const handleBack = () => {
    setMode(null);
    setCategories([]);
    setSearchQueries([]);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
    setOpenPopover(null);
    // Clear search when selection is made
    const newSearchQueries = [...searchQueries];
    newSearchQueries[index] = "";
    setSearchQueries(newSearchQueries);
  };

  const handleSearchChange = (index: number, value: string) => {
    const newSearchQueries = [...searchQueries];
    newSearchQueries[index] = value;
    setSearchQueries(newSearchQueries);
  };

  const handleRandomizeAll = () => {
    if (mode) {
      // Pick random unique categories
      const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5);
      const randomCats = shuffled.slice(0, mode);
      setCategories(randomCats);
      setSearchQueries(Array(mode).fill(""));
      setShuffleKey(prev => prev + 1);
    }
  };

  const getFilteredCategories = (searchQuery: string, currentIndex: number) => {
    // Get categories selected in other slots (exclude "random" and current slot)
    const selectedElsewhere = categories
      .filter((_, idx) => idx !== currentIndex)
      .filter(cat => cat !== "random" && CATEGORIES.includes(cat as any));

    const sorted = [...CATEGORIES]
      .filter(cat => !selectedElsewhere.includes(cat))
      .sort();

    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter(cat => cat.toLowerCase().includes(query));
  };

  const handleStartGame = () => {
    // TODO: Start the game with selected categories
    console.log("Starting game with categories:", categories);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <LayoutGrid className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <h1 className="text-2xl sm:text-4xl font-bold">Triv Wiz Jeopardy</h1>
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Dev
              </Badge>
            </div>
          </div>

          {/* Sign In Required */}
          {!user && !echoLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Sign In Required</CardTitle>
                <CardDescription>
                  You need to be signed in to play Jeopardy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSignIn} className="w-full" size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mode Selection or Category Selection */}
          {(user || echoLoading) && (
            <>
              {!mode ? (
                /* Mode Selection */
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Board Size</CardTitle>
                      <CardDescription>
                        Each category has 5 questions of increasing difficulty (200-1000 points)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          onClick={() => handleSelectMode(3)}
                          variant="outline"
                          size="lg"
                          className="h-24 flex-col gap-2"
                        >
                          <LayoutGrid className="h-6 w-6" />
                          <span>3 Categories</span>
                          <span className="text-xs text-muted-foreground">15 questions</span>
                        </Button>
                        <Button
                          onClick={() => handleSelectMode(5)}
                          variant="outline"
                          size="lg"
                          className="h-24 flex-col gap-2"
                        >
                          <Grid3X3 className="h-6 w-6" />
                          <span>5 Categories</span>
                          <span className="text-xs text-muted-foreground">25 questions</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* How It Works */}
                  <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 sm:px-5 sm:py-4">
                    <h3 className="text-xs font-medium mb-2.5">How It Works</h3>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-outside ml-4">
                      <li>A simplified version of the greatest trivia game of all time</li>
                      <li>5 questions per category, ranging from 200–1,000 points</li>
                      <li>Correct answers earn points, incorrect answers lose them</li>
                      <li>No Double Jeopardy, Daily Double, or Final Jeopardy—yet</li>
                    </ul>
                  </div>
                </>
              ) : (
                /* Category Selection */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Select Categories</CardTitle>
                        <CardDescription>
                          Choose {mode} categories or leave as random
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categories.map((cat, index) => (
                      <motion.div
                        key={index}
                        initial={false}
                        animate={{
                          x: 0,
                          opacity: 1,
                        }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">
                          Category {index + 1}
                        </span>
                        <Popover
                          open={openPopover === index}
                          onOpenChange={(open) => setOpenPopover(open ? index : null)}
                        >
                          <div className="flex-1 relative">
                            <motion.div
                              key={`${shuffleKey}-${index}`}
                              initial={{ rotateX: -90, opacity: 0 }}
                              animate={{ rotateX: 0, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                delay: index * 0.1
                              }}
                            >
                              <Input
                                value={focusedInput === index ? searchQueries[index] || "" : (cat === "random" ? "Random" : cat)}
                                onChange={(e) => {
                                  handleSearchChange(index, e.target.value);
                                  setOpenPopover(index);
                                }}
                                onClick={() => {
                                  setFocusedInput(index);
                                  handleSearchChange(index, "");
                                  setOpenPopover(index);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    if (focusedInput === index) {
                                      setFocusedInput(null);
                                      setOpenPopover(null);
                                    }
                                  }, 200);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && searchQueries[index]?.trim()) {
                                    e.preventDefault();
                                    const query = searchQueries[index].trim();
                                    const filtered = getFilteredCategories(query, index);
                                    // Use first match or custom
                                    if (filtered.length > 0) {
                                      handleCategoryChange(index, filtered[0]);
                                    } else {
                                      handleCategoryChange(index, query);
                                    }
                                  }
                                  if (e.key === "Escape") {
                                    setFocusedInput(null);
                                    setOpenPopover(null);
                                  }
                                }}
                                placeholder="Search or type custom..."
                                className={cn(
                                  "pr-10 cursor-pointer focus:cursor-text",
                                  focusedInput !== index && cat === "random" && "text-muted-foreground italic"
                                )}
                              />
                            </motion.div>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent z-10"
                              >
                                <ChevronDown className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform",
                                  openPopover === index && "rotate-180"
                                )} />
                              </Button>
                            </PopoverTrigger>
                          </div>
                          <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0"
                            align="start"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                          >
                            <div className="max-h-[250px] overflow-y-auto">
                              {/* Random option - only show when not searching */}
                              {!searchQueries[index] && (
                                <button
                                  onClick={() => handleCategoryChange(index, "random")}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors",
                                    cat === "random" && "bg-muted"
                                  )}
                                >
                                  <Shuffle className="h-4 w-4" />
                                  Random
                                  {cat === "random" && <Check className="h-4 w-4 ml-auto" />}
                                </button>
                              )}

                              {/* Filtered categories */}
                              {getFilteredCategories(searchQueries[index] || "", index).map((category) => (
                                <button
                                  key={category}
                                  onClick={() => handleCategoryChange(index, category)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left",
                                    cat === category && "bg-muted"
                                  )}
                                >
                                  {category}
                                  {cat === category && <Check className="h-4 w-4 ml-auto" />}
                                </button>
                              ))}

                              {/* Use as custom option - show when typing and no exact match */}
                              {searchQueries[index]?.trim() && !CATEGORIES.includes(searchQueries[index].trim() as any) && (
                                <button
                                  onClick={() => handleCategoryChange(index, searchQueries[index].trim())}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left border-t text-primary"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Use "{searchQueries[index].trim()}" as custom
                                </button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </motion.div>
                    ))}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleRandomizeAll}
                        className="flex-1"
                      >
                        <Dices className="mr-2 h-4 w-4" />
                        Randomize All
                      </Button>
                      <Button
                        onClick={handleStartGame}
                        className="flex-1"
                        disabled
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
