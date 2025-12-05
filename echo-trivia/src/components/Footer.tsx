"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Sparkles, Trophy, BookOpen, Zap, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 mb-12">
          {/* Brand Section - Larger on desktop */}
          <div className="space-y-4 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/triviawizard favicon.png"
                alt="Trivia Wizard"
                width={40}
                height={40}
                className="size-10 group-hover:scale-110 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold">Trivia Wizard</span>
                <span className="text-xs text-muted-foreground">Summon Your Inner Genius</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered trivia quizzes for every mind. Challenge yourself, compete globally, and join the Wizard's Legion.
            </p>
            {/* Echo Attribution */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Powered by</p>
              <a
                href="https://echo.merit.systems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
              >
                <Image
                  src="https://echo.merit.systems/favicon.ico"
                  alt="Echo"
                  width={20}
                  height={20}
                  className="size-5 group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                  Echo by Merit
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Game Modes</h4>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/daily"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Daily Challenge
                </Link>
              </li>
              <li>
                <Link
                  href="/practice"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Practice Mode
                </Link>
              </li>
              <li>
                <Link
                  href="/faceoff"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Faceoff
                </Link>
              </li>
              <li>
                <Link
                  href="/game-modes"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  All Modes →
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Community</h4>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/leaderboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Quiz History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Resources</h4>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/getting-started"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs-and-docs"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQs & Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <MessageCircle className="h-3 w-3" />
                  The Wizard's Hat
                </Link>
              </li>
              <li>
                <Link
                  href="/lore"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Lore
                </Link>
              </li>
              <li>
                <a
                  href="https://echo.merit.systems/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Echo Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Quick Start</h4>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/practice"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  Start Quiz
                </Link>
              </li>
              <li>
                <Link
                  href="/daily"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors w-full sm:w-auto"
                >
                  Daily Challenge
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} Trivia Wizard</p>
            <span className="hidden sm:inline">•</span>
            <p className="text-center">All rights reserved</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/faqs-and-docs" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/faqs-and-docs" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
