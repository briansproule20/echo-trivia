"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Sparkles, Trophy, BookOpen, Zap, MessageCircle, Layers, X, Compass } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Custom X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom Discord icon
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export function Footer() {
  const [showSocialPopup, setShowSocialPopup] = useState<'x' | 'discord' | null>(null);
  const [compassSpinning, setCompassSpinning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleCompassClick = () => {
    setCompassSpinning(true);
    audioRef.current?.play();
    setTimeout(() => setCompassSpinning(false), 3000);
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-4">
          {/* Brand Section */}
          <div className="space-y-4 lg:w-64 lg:flex-shrink-0">
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
            {/* Built With - Desktop only */}
            <div className="pt-2 hidden lg:block">
              <p className="text-xs text-muted-foreground mb-2">Built with</p>
              <div className="flex flex-col gap-1.5">
                <a
                  href="https://echo.merit.systems"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="https://echo.merit.systems/favicon.ico"
                    alt="Echo"
                    width={18}
                    height={18}
                    className="size-[18px] group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium text-primary">Echo</span>
                </a>
                <a
                  href="https://merit.systems"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="https://merit.systems/favicon.ico"
                    alt="Merit Systems"
                    width={18}
                    height={18}
                    className="size-[18px] group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium text-[#E53935]">Merit Systems</span>
                </a>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://vercel.com/favicon.ico"
                    alt="Vercel"
                    width={18}
                    height={18}
                    className="size-[18px] group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium text-foreground">Vercel</span>
                </a>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://supabase.com/favicon/favicon-32x32.png"
                    alt="Supabase"
                    width={18}
                    height={18}
                    className="size-[18px] group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium text-[#3ECF8E]">Supabase</span>
                </a>
                <a
                  href="https://anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://anthropic.com/favicon.ico"
                    alt="Anthropic"
                    width={18}
                    height={18}
                    className="size-[18px] group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium text-[#D4A574]">Anthropic</span>
                </a>
                <a
                  href="https://cursor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://cursor.com/favicon.ico"
                    alt="Cursor"
                    width={18}
                    height={18}
                    className="size-[18px] group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium text-muted-foreground">Cursor</span>
                </a>
              </div>
            </div>

            {/* Quick Start - Mobile only */}
            <div className="lg:hidden space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Quick Start</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/daily"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Daily
                </Link>
                <Link
                  href="/freeplay"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Freeplay
                </Link>
                <Link
                  href="/survival"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Survival
                </Link>
                <Link
                  href="/faceoff"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Faceoff
                </Link>
                <Link
                  href="/jeopardy"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Jeopardy
                </Link>
                <Link
                  href="/campaign"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Adventure
                </Link>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 flex-1">
            {/* Game Modes */}
            <div className="space-y-4">
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
                  href="/freeplay"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Freeplay
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
                  href="/survival"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Survival
                </Link>
              </li>
              <li>
                <Link
                  href="/jeopardy"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Jeopardy
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

          {/* Scores & History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold whitespace-nowrap">Scores & History</h4>
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
          <div className="space-y-4">
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
                  href="/referrals"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Referrals
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Settings
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

          {/* More */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">More</h4>
            </div>
            <ul className="space-y-3 text-sm">
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
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Actions - Desktop only */}
          <div className="hidden lg:block space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Quick Start</h4>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/daily"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Daily Challenge
              </Link>
              <Link
                href="/freeplay"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Freeplay
              </Link>
              <Link
                href="/survival"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Survival
              </Link>
              <Link
                href="/faceoff"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Faceoff
              </Link>
              <Link
                href="/jeopardy"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Jeopardy
              </Link>
              <Link
                href="/campaign"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Adventure
              </Link>
            </div>
          </div>
          </div>
        </div>

        {/* Built With - Mobile only */}
        <div className="lg:hidden flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4">
          <span className="text-xs text-muted-foreground">Built with</span>
          <a href="https://echo.merit.systems" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Image src="https://echo.merit.systems/favicon.ico" alt="Echo" width={14} height={14} className="size-3.5" />
            <span className="text-xs font-medium text-primary">Echo</span>
          </a>
          <a href="https://merit.systems" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Image src="https://merit.systems/favicon.ico" alt="Merit" width={14} height={14} className="size-3.5" />
            <span className="text-xs font-medium text-[#E53935]">Merit</span>
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <img src="https://vercel.com/favicon.ico" alt="Vercel" width={14} height={14} className="size-3.5" />
            <span className="text-xs font-medium text-foreground">Vercel</span>
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <img src="https://supabase.com/favicon/favicon-32x32.png" alt="Supabase" width={14} height={14} className="size-3.5" />
            <span className="text-xs font-medium text-[#3ECF8E]">Supabase</span>
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <img src="https://anthropic.com/favicon.ico" alt="Anthropic" width={14} height={14} className="size-3.5" />
            <span className="text-xs font-medium text-[#D4A574]">Anthropic</span>
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <img src="https://cursor.com/favicon.ico" alt="Cursor" width={14} height={14} className="size-3.5" />
            <span className="text-xs font-medium text-muted-foreground">Cursor</span>
          </a>
        </div>

        <Separator className="mb-4 sm:mb-8" />

        {/* Bottom Bar */}
        <div className="relative flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} Trivia Wizard</p>
            <span className="hidden sm:inline">•</span>
            <p className="text-center">All rights reserved</p>
          </div>

          {/* Compass - Desktop only */}
          <motion.button
            onClick={handleCompassClick}
            animate={compassSpinning ? { rotate: 1080 } : { rotate: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="hidden sm:flex absolute left-1/2 -translate-x-1/2 p-2 rounded-full hover:bg-accent transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Compass"
          >
            <Compass className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </motion.button>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowSocialPopup('x')}
              className="hover:text-foreground transition-colors"
              aria-label="X (Twitter)"
            >
              <XIcon className="h-4 w-4" />
            </button>
            <span>•</span>
            <button
              onClick={() => setShowSocialPopup('discord')}
              className="hover:text-foreground transition-colors"
              aria-label="Discord"
            >
              <DiscordIcon className="h-4 w-4" />
            </button>
            <span>•</span>
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

      {/* Social Coming Soon Popup */}
      <AnimatePresence>
        {showSocialPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSocialPopup(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
            >
              <div className="bg-card border border-border rounded-lg shadow-lg p-6 mx-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {showSocialPopup === 'x' ? (
                        <XIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <DiscordIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {showSocialPopup === 'x' ? 'Follow on X' : 'Join Triv Wiz Discord'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {showSocialPopup === 'discord' ? 'Community Server' : 'Stay Updated'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setShowSocialPopup(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Coming Soon</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Audio for compass easter egg */}
      <audio ref={audioRef} src="/skyrim-i-used-to-be-an-adventure-like-you.mp3" />
    </footer>
  );
}
