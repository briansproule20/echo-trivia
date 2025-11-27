"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotBackground } from "@/components/ui/dot-background";
import { Button } from "@/components/ui/button";
import { Users, Share2, Coins, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export default function ReferralsPage() {
  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="mb-2">
            Referral Program
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Grow the Legion
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Spread knowledge, earn rewards, and help others escape the doom scroll
          </p>
        </div>

        {/* CTA Card */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-2">Get Your Referral Link</h2>
                <p className="text-muted-foreground mb-4">
                  Visit the Echo referrals page to grab your unique link and start earning 10% from every user you bring to Trivia Wizard.
                </p>
                <Button asChild size="lg" className="gap-2">
                  <Link
                    href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Your Referral Link
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lore Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">The Legion Grows</h2>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The Wizard cannot fight Ignorance alone. From his Tower, he watches the creeping dark spread
                across the world—comfortable lies replacing inconvenient truths, curiosity withering into apathy,
                understanding fracturing into a thousand conflicting realities.
              </p>

              <p>
                So he built the Legion. Not through conscription or decree, but through the simple act of
                asking questions. Those who answer them—who feel that familiar pull of wanting to know more—they
                become part of something larger. Seekers. Truth-hunters. The chronically curious who refuse to
                accept ignorance as inevitable.
              </p>

              <p>
                You are already one of them. Every question you answer pushes back the dark. Every bit of
                knowledge you reclaim is a small victory. But the Wizard asks more of those who truly
                understand the stakes: bring others into the fold.
              </p>

              <p>
                When you share Trivia Wizard with friends, family, or strangers lost in the endless scroll,
                you're not just sharing a game. You're offering them a way out—a chance to feed their minds
                instead of numbing them. Each new seeker strengthens the Legion. Each question answered
                is another candle lit against the encroaching night.
              </p>

              <p className="italic">
                The Tower rewards those who grow the Legion—with treasure from the Wizard's vast reserves
                and a share of the knowledge economy itself. As your recruits learn and grow, so do you.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">How It Works</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Automatic Sharing */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Automatic Referrals</CardTitle>
                </div>
                <CardDescription>Share your results, grow your network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Every time you share your quiz results—whether you're celebrating a perfect score or
                  laughing at a spectacular failure—your personal referral code is automatically attached.
                </p>
                <p>
                  No extra steps. No remembering to add a link. Just play, share, and watch your Legion grow.
                  Anyone who signs up through your shared results becomes your referral permanently.
                </p>
              </CardContent>
            </Card>

            {/* Direct Sharing */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Direct Sharing</CardTitle>
                </div>
                <CardDescription>Spread the word anywhere</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Want to share Trivia Wizard on social media, in a group chat, or with someone who needs
                  a healthier alternative to doom scrolling? Grab your personal referral link directly.
                </p>
                <p>
                  Visit the{" "}
                  <Link
                    href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Echo referrals page <ExternalLink className="h-3 w-3" />
                  </Link>{" "}
                  to copy your unique link and share it anywhere you'd like.
                </p>
              </CardContent>
            </Card>

            {/* Earnings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Earn 10% Revenue</CardTitle>
                </div>
                <CardDescription>Your network, your earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  When someone signs up using your referral link and adds credits to play, you earn
                  10% of the revenue from their spending. Not just once—forever.
                </p>
                <p>
                  The more people you bring in and the more they play, the more you earn. It's that simple.
                  Echo automatically tracks all your referrals and calculates your earnings.
                </p>
              </CardContent>
            </Card>

            {/* Track Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Track Your Impact</CardTitle>
                </div>
                <CardDescription>Watch your Legion grow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Visit your Echo dashboard to see how many seekers you've recruited, how much they've
                  played, and how much you've earned from spreading knowledge.
                </p>
                <p>
                  View your referral stats and manage your account on the{" "}
                  <Link
                    href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Echo referrals page <ExternalLink className="h-3 w-3" />
                  </Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Grow the Legion?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Every seeker you bring into the fold makes the Legion stronger. Start sharing today
              and help others discover the joy of learning—while earning rewards for yourself.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link
                href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Your Referral Link
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DotBackground>
  );
}
