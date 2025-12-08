"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Zap, DollarSign, CheckCircle2, ArrowRight, Wallet, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DotBackground } from "@/components/ui/dot-background";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { Logo } from "@/components/logo";
import { useState } from "react";

export default function GettingStartedPage() {
  const router = useRouter();
  const echo = useEcho();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isAuthenticated = !!echo.user;

  const handleSignIn = () => {
    setIsSigningIn(true);
    echo.signIn();
  };

  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="mb-2">
            Getting Started
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Trivia Wizard
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate unlimited AI-powered trivia quizzes with Echo's pay-per-use model. Only pay for what you use.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 mb-8">
          {/* Echo Account Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Easy Echo Account Setup</CardTitle>
                  <CardDescription>Get started in seconds</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Sign in with Google, Email, or GitHub</p>
                    <p className="text-sm text-muted-foreground">Quick authentication, no complex forms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Add credits to your account</p>
                    <p className="text-sm text-muted-foreground">Get $1 free when you sign up! Then add more as you need it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Start generating quizzes</p>
                    <p className="text-sm text-muted-foreground">Instantly create trivia on any topic you want</p>
                  </div>
                </div>
              </div>

              {/* Sign Up CTA */}
              {!isAuthenticated && (
                <div className="pt-4 mt-4 border-t">
                  <div className="relative">
                    {/* Animated glow ring */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/60 to-primary rounded-lg blur-sm opacity-75 animate-pulse" />
                    <Button
                      size="lg"
                      onClick={handleSignIn}
                      disabled={isSigningIn || echo.isLoading}
                      className="relative w-full text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {isSigningIn ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Logo className="mr-2 h-5 w-5" />
                          Sign Up with Echo
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Get $1 free credits when you sign up!
                  </p>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">You're signed in! Ready to play.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Incredible Value</CardTitle>
                  <CardDescription>$1 generates 25 quizzes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">$1.00</p>
                      <p className="text-xs text-muted-foreground">One-time credit</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-right">
                    <p className="font-semibold text-primary">25 Quizzes</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-primary">$5</p>
                  <p className="text-sm text-muted-foreground mt-1">125 quizzes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-primary">$10</p>
                  <p className="text-sm text-muted-foreground mt-1">250 quizzes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-primary">$20</p>
                  <p className="text-sm text-muted-foreground mt-1">500 quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>How LLM Tokens & Billing Work</CardTitle>
                  <CardDescription>Transparent, usage-based pricing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      1
                    </div>
                    What are LLM Tokens?
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    Tokens are pieces of text that AI models process. Roughly, 1 token = 4 characters or 0.75 words.
                    When you generate a quiz, the AI reads your request (input tokens) and creates questions (output tokens).
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      2
                    </div>
                    Pay-Per-Use Model
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    You're only charged for the tokens used to generate your quizzes. No subscriptions, no recurring fees.
                    Generate 1 quiz or 100 - you only pay for what you actually create.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      3
                    </div>
                    Your Credits Never Expire
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    Add credits whenever you want. Use them at your own pace. No expiration dates or pressure to use them quickly.
                    Your balance stays with you until you're ready to create more quizzes.
                  </p>
                  <p className="text-xs text-muted-foreground/80 pl-8 pt-2">
                    Want to know more about our billing process and where your money is going?{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-muted-foreground/80 hover:text-primary underline"
                      onClick={() => router.push("/faqs-and-docs")}
                    >
                      Check out our FAQs and docs
                    </Button>
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Example Cost</p>
                    <p className="text-sm text-muted-foreground">
                      A typical daily quiz costs about $0.04 USD (4 cents). That's 25 quizzes per dollar!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sign in, add credits, and start generating unlimited trivia quizzes on any topic you can imagine.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" onClick={() => router.push("/freeplay")}>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Quiz
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DotBackground>
  );
}
