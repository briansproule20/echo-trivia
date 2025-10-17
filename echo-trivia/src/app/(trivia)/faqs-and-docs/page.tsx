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
                Our referral program allows you to earn 10% of the app's revenue when you share Trivia Wizard with friends.
                When someone signs up using your referral link and makes purchases, you receive a 10% commission on their spending.
                This helps promote our trivia-based alternative to doom scrolling while rewarding our community. Learn more about the{" "}
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
                Your quiz history and progress are stored locally in your browser using IndexedDB, a secure client-side storage system.
                This means your quiz data stays on your device and is not sent to any external servers. IndexedDB provides fast,
                efficient storage that works offline and gives you complete control over your data. You can clear your quiz history
                at any time through your browser settings.
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
                  We collect only essential information needed to provide the service. Your quiz history and preferences stay private.
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
                <CardDescription>Earn by sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Share Trivia Wizard with friends and earn 10% of the app's revenue from users who sign up with your referral link.
                </p>
                <p>
                  Echo's built-in referral system automatically tracks your referrals and calculates your 10% commission earnings.
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
                <CardDescription>The platform powering this app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <Link href="https://www.merit.systems/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Merit Systems <ExternalLink className="h-3 w-3" />
                  </Link>
                  {" "}provides Echo, an infrastructure platform for building usage-based AI applications.
                </p>
                <p>
                  Echo handles authentication, payment processing, usage tracking, and referral management - letting developers
                  focus on building great apps.
                </p>
                <p>
                  This enables transparent, pay-per-use pricing without complex subscription tiers or hidden fees.
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
              We are an open source project building on the Merit Systems' Echo infrastructure. I've chosen to build
              Trivia Wizard on this platform because it's a service I'd like to use: trivia practice on any topic I
              want with no subscription fees.
            </p>
            <p>
              The money you spend on Trivia Wizard goes to the independent developer of the app (me, a real human),
              not a large corporation. This allows us to maintain fair pricing and keep improving the service based
              on what users actually need.
            </p>
            <p>
              To help promote our trivia-based alternative to doom scrolling, we offer a user referral program to
              anyone that shares the app with friends. Refer users and get paid 10% of the app's revenue -
              it's our way of building a community around learning and curiosity instead of mindless content consumption.
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
