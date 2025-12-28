"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, BookOpen, FileQuestion, BarChart3, Trophy, User, Sparkles, Users, Settings, MessageCircle, LayoutGrid, Compass, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EchoAccount } from "@/components/echo-account-next";
import EchoBalance from "@/components/balance";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReferralBanner } from "@/components/ReferralBanner";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/game-modes", label: "Game Modes" },
];

const AUTH_NAV_ITEMS = [
  { href: "/history", label: "History" },
];

const EXTRA_NAV_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const echo = useEcho();
  const { theme, resolvedTheme } = useTheme();
  const isAuthenticated = !!echo.user;
  const [mounted, setMounted] = useState(false);
  const [compassSpinning, setCompassSpinning] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const moreEndRef = useRef<HTMLDivElement>(null);

  const handleCompassClick = () => {
    setCompassSpinning(true);
    audioRef.current?.play();
    setTimeout(() => setCompassSpinning(false), 3000);
  };

  const handleMoreToggle = () => {
    const opening = !moreOpen;
    setMoreOpen(opening);
    if (opening) {
      setTimeout(() => {
        moreEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide navbar on campaign pages
  if (pathname?.startsWith("/campaign")) {
    return null;
  }

  // Use the actual theme value (not 'system') for custom themes
  const currentTheme = mounted ? theme : undefined;

  const logoSrc = currentTheme === 'paperwhite'
    ? '/triviawizard_favicon_paperwhite_stippled.png'
    : currentTheme === 'dullform'
    ? '/triviawizard_favicon_paperwhite_stippled_detail.png'
    : currentTheme === 'reaper'
    ? '/reaper.png'
    : currentTheme === 'rivendell'
    ? '/rivendell.png'
    : '/trivia-wizard-logo.png';

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src={logoSrc}
              alt="Trivia Wizard"
              className="h-8 w-8 object-contain"
            />
            <AnimatedGradientText className="text-xl font-bold">
              Trivia Wizard
            </AnimatedGradientText>
          </Link>

          {/* Center/Desktop Nav Links */}
          {!isAuthenticated && pathname === "/" && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/getting-started"
                className="text-sm font-medium text-primary animate-[pulse-text_2s_ease-in-out_infinite]"
              >
                Getting Started
              </Link>
            </div>
          )}

          {/* Right Side - Echo Account, Menu Button & Theme Toggle */}
          <div className="flex items-center gap-2">
            <EchoAccount />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader className="shrink-0">
                  <SheetTitle className="flex items-center space-x-2">
                    <img
                      src={logoSrc}
                      alt="Trivia Wizard"
                      className="h-6 w-6 object-contain"
                    />
                    <span>Navigation</span>
                    <motion.button
                      onClick={handleCompassClick}
                      animate={compassSpinning ? { rotate: 1080 } : { rotate: 0 }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      className="p-1.5 rounded-full hover:bg-accent transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Compass className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  </SheetTitle>
                </SheetHeader>

                {/* Theme Toggle - Fixed at top, outside scrollable area */}
                <div className="flex items-center justify-between px-3 py-2 border-b mt-4 shrink-0" suppressHydrationWarning>
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>

                <div className="flex flex-col space-y-6 mt-4 overflow-y-auto flex-1 pr-2">
                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-3">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-lg font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                          pathname === item.href
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}

                    {/* Auth-only Nav Items (History) */}
                    {isAuthenticated && AUTH_NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-lg font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                          pathname === item.href
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}

                    {/* Extra Nav Items - Only show if authenticated */}
                    {isAuthenticated && (
                      <>
                        {/* Divider */}
                        <div className="border-t my-2" />

                        {/* Extra Nav Items with Icons */}
                        {EXTRA_NAV_ITEMS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                              pathname === item.href
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        ))}
                      </>
                    )}
                  </nav>

                  {/* Auth & Balance */}
                  <div className="pt-6 border-t space-y-4">
                    {echo.user ? (
                      <EchoBalance echo={echo} />
                    ) : null}
                    <div className="px-3">
                      <EchoAccount hideStreak />
                    </div>

                    {/* More Dropdown */}
                    <div className="mt-2">
                      <button
                        onClick={handleMoreToggle}
                        className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 rounded-md mx-3 hover:bg-accent transition-colors"
                        style={{ width: 'calc(100% - 24px)' }}
                      >
                        <span>More</span>
                        <motion.div
                          animate={{ rotate: moreOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </button>

                      <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{
                          gridTemplateRows: moreOpen ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <div className="pt-1 space-y-1">
                              <Link
                                href="/getting-started"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                  pathname === "/getting-started"
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <BookOpen className="h-4 w-4" />
                                Getting Started
                              </Link>

                              <Link
                                href="/faqs-and-docs"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                  pathname === "/faqs-and-docs"
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <FileQuestion className="h-4 w-4" />
                                FAQs & Docs
                              </Link>

                              <Link
                                href="/chat"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                  pathname === "/chat"
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <MessageCircle className="h-4 w-4" />
                                The Wizard's Hat
                              </Link>

                              <Link
                                href="/referrals"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                  pathname === "/referrals"
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <Users className="h-4 w-4" />
                                Referrals
                              </Link>

                              <Link
                                href="/lore"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                  pathname === "/lore"
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <BookOpen className="h-4 w-4" />
                                Lore
                              </Link>

                              <Link
                                href="/categories"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                  pathname === "/categories"
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <LayoutGrid className="h-4 w-4" />
                                Categories
                              </Link>

                              {isAuthenticated && (
                                <Link
                                  href="/settings"
                                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent px-3 py-2 rounded-md mx-3 ${
                                    pathname === "/settings"
                                      ? "text-primary bg-primary/10"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <Settings className="h-4 w-4" />
                                  Settings
                                </Link>
                              )}
                              <div ref={moreEndRef} />
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile-only banner for unauthenticated users */}
      {!isAuthenticated && pathname !== "/getting-started" && (
        <div className="md:hidden sticky top-16 z-40 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <Link
              href="/getting-started"
              className="flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">First Time Here?</p>
                  <p className="text-xs text-muted-foreground">Check out Getting Started</p>
                </div>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Referral banner for authenticated users */}
      {isAuthenticated && pathname !== "/faqs-and-docs" && <ReferralBanner />}

      {/* Audio for compass easter egg - outside Sheet so it persists */}
      <audio ref={audioRef} src="/skyrim-i-used-to-be-an-adventure-like-you.mp3" />
    </>
  );
}

