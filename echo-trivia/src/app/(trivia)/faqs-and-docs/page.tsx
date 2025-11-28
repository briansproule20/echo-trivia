"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotBackground } from "@/components/ui/dot-background";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Coins, Users, BookOpen, ExternalLink, Heart, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function FaqsAndDocsPage() {
  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="mb-2">
            Help & Documentation
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              FAQs & Docs
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Trivia Wizard
          </p>
        </div>

        {/* FAQs Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">What is Trivia Wizard?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Trivia Wizard is an AI-powered quiz platform that generates unlimited trivia questions on any topic you choose.
                Built on Merit Systems' Echo infrastructure, it offers a subscription-free alternative to traditional quiz apps,
                where you only pay for what you use.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">How does pricing work?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                We use a pay-per-use model with no subscriptions. A typical 5-question quiz costs about $0.02 USD (2 cents),
                which means you get approximately 50 quizzes per dollar. Add credits to your account whenever you want, and
                they never expire. You're only charged for the AI tokens used to generate your quizzes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">Is my payment information secure?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Yes. All payments are processed securely through Merit Systems' Echo platform. We never store your payment
                information directly. Echo uses industry-standard encryption and security practices to protect your financial data.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">What is the referral program?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Our referral program allows you to earn 10% of the revenue from users YOU refer. The more users you bring
                in and the more they play, the more revenue you earn - it's that simple! Your referral link is automatically
                included when you share your quiz results, or you can get your personal referral link directly from the{" "}
                <Link href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                  Echo app page <ExternalLink className="h-3 w-3" />
                </Link>{" "}
                to share anywhere. When someone signs up using your referral link (either from your shared scores or direct link)
                and makes purchases, you receive 10% of their spending. More players = more revenue for you!
                Learn more about the{" "}
                <Link href="https://echo.merit.systems/docs/money/claiming-profits#referrals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Echo referral system <ExternalLink className="h-3 w-3" />
                </Link>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">Can I create quizzes on any topic?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Yes! You can generate quizzes on virtually any topic you can imagine - from history and science to pop culture
                and specialized subjects. Our AI adapts to your chosen category and difficulty level to create relevant, engaging questions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">Do my credits expire?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                No! Your credits never expire. Add funds whenever you want and use them at your own pace. There's no pressure
                to use credits quickly or maintain a subscription.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">What is Merit Systems and Echo?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Merit Systems is the company behind Echo, an infrastructure platform that enables pay-per-use AI applications.
                Echo handles authentication, payments, and usage tracking, allowing developers to build apps with transparent,
                usage-based pricing. Learn more at{" "}
                <Link href="https://www.merit.systems/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  merit.systems <ExternalLink className="h-3 w-3" />
                </Link>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6 bg-card overflow-visible">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">How is my data stored?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                <div className="space-y-3">
                  <p>
                    Trivia Wizard uses cloud storage to sync your data across all your devices:
                  </p>
                  <p>
                    <strong>Cloud Database (Supabase):</strong> When you're signed in, your complete quiz history, questions, answers,
                    achievements, daily streaks, and profile data are securely stored in Supabase (a PostgreSQL database). This means
                    you can access your quiz history from any device, compete on leaderboards, and never lose your progress. All cloud
                    data is protected with Row Level Security (RLS) policies and encrypted in transit and at rest.
                  </p>
                  <p>
                    <strong>Cross-Device Sync:</strong> Your quiz history automatically syncs across all devices where you're signed in.
                    Complete a quiz on your phone and review it later on your computer - it's all connected to your account.
                  </p>
                  <p>
                    <strong>Privacy First:</strong> Your quiz data is only accessible to you. We collect only essential information
                    needed to provide the service, and you can view your complete history anytime from the History page.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border rounded-lg px-6 bg-card overflow-visible" style={{ borderBottomWidth: '1px' }}>
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold">Where does my money go?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Your payments support an independent developer (a real human!), not a large corporation. The revenue covers
                AI usage costs and supports ongoing development of Trivia Wizard. This open-source project is built to provide
                a service people actually want to use, with fair and transparent pricing.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Documentation Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Documentation</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Security & Privacy */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Security & Privacy</CardTitle>
                </div>
                <CardDescription>Your data is protected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Built on Echo's secure infrastructure with industry-standard encryption for all data transmission and storage.
                </p>
                <p>
                  Your quiz history syncs securely to the cloud, protected by Row Level Security policies ensuring only you can access your data.
                </p>
                <p>
                  Authentication is handled securely through Echo, supporting Google, GitHub, and email sign-in options.
                </p>
              </CardContent>
            </Card>

            {/* Payment System */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Payment System</CardTitle>
                </div>
                <CardDescription>Transparent usage-based billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Powered by Echo's payment infrastructure - no credit card information is stored in Trivia Wizard.
                </p>
                <p>
                  Real-time balance tracking shows exactly how much each quiz costs. You always know what you're paying for.
                </p>
                <p>
                  Manage your account and view transaction history through your{" "}
                  <Link href="https://echo.merit.systems/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Echo dashboard <ExternalLink className="h-3 w-3" />
                  </Link>.
                </p>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Referral Program</CardTitle>
                </div>
                <CardDescription>Earn 10% from users you refer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Automatic Referrals:</strong> When you share your quiz results, your personal referral link is automatically
                  included. Anyone who signs up through your shared scores becomes your referral!
                </p>
                <p>
                  <strong>Direct Sharing:</strong> Get your personal referral link from the{" "}
                  <Link href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                    Echo app page <ExternalLink className="h-3 w-3" />
                  </Link>{" "}
                  to share on social media, with friends, or anywhere you'd like.
                </p>
                <p>
                  <strong>More Players = More Revenue:</strong> You earn 10% of the revenue from every user you refer. The more
                  people you bring in and the more they play, the more you earn. Echo automatically tracks all your referrals
                  and calculates your earnings.
                </p>
                <p>
                  Help us promote a healthier alternative to mindless scrolling while earning passive income. View the full{" "}
                  <Link href="https://echo.merit.systems/docs/money/claiming-profits#referrals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Echo referral documentation <ExternalLink className="h-3 w-3" />
                  </Link>.
                </p>
              </CardContent>
            </Card>

            {/* Merit Systems & Echo */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>Merit Systems & Echo</CardTitle>
                </div>
                <CardDescription>Infrastructure for usage-based pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>About Merit Systems:</strong> {" "}
                  <Link href="https://www.merit.systems/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Merit Systems <ExternalLink className="h-3 w-3" />
                  </Link>
                  {" "}is a fintech platform backed by a16z and Blockchain Capital. They build financial infrastructure for open-source software, enabling developers to monetize their work and compensate contributors globally with instant stablecoin payments.
                </p>
                <p>
                  <strong>Echo Platform:</strong> Echo is Merit's product for monetizing AI applications. It provides authentication, payment processing, usage tracking, and referral management - letting developers build pay-per-use AI apps in minutes without building payment infrastructure from scratch.
                </p>
                <p>
                  <strong>Usage-Based Pricing:</strong> No monthly subscriptions - pay only for what you use. Track your spending in real-time with your{" "}
                  <Link href="https://echo.merit.systems/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Echo dashboard <ExternalLink className="h-3 w-3" />
                  </Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">About Trivia Wizard</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This is an open source project building on Merit Systems' Echo infrastructure. I've chosen to build
              Trivia Wizard on this platform because it's a service I'd like to use: trivia practice on any topic I
              want with no subscription fees.
            </p>
            <p>
              The money you spend on Trivia Wizard goes to the independent developer of the app (me, a real human),
              not a large corporation. This allows me to maintain fair pricing and keep improving the service based
              on what users want and need.
            </p>
            <p>
              To help promote my trivia-based alternative to doom scrolling, I offer a user referral program.
              When you share your quiz results, your referral link is automatically included - or you can get your
              personal link from the{" "}
              <Link href="https://echo.merit.systems/app/135d6f0a-3ac9-4ff2-baba-fa1664a0bc65/referrals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Echo app page
              </Link>. Earn 10% of the revenue from every user you refer - the more players you bring in and the
              more they play, the more you earn. It's my way of building a community around learning and curiosity
              instead of mindless content consumption.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="https://www.merit.systems/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                Merit Systems Docs <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href="https://echo.merit.systems/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                Visit Echo Dashboard <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href="https://echo.merit.systems/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                Echo Documentation <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DotBackground>
  );
}
