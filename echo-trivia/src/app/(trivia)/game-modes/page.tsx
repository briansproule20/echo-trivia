"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { DotBackground } from "@/components/ui/dot-background";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Illustration } from "@/components/ui/glowing-stars";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { InfiniteScrollBackground } from "@/components/ui/infinite-scroll-background";
import { Calendar, Sparkles, Zap, Lock, Castle, Trophy, Swords, LayoutGrid, Sliders, Infinity, BarChart3 } from "lucide-react";

interface GameModeFeature {
  icon: React.ReactNode;
  label: string;
}

interface GameModeCardProps {
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  comingSoon?: boolean;
  delay?: number;
  useVortex?: boolean;
  useBeams?: boolean;
  useStars?: boolean;
  useInfiniteScroll?: boolean;
  infiniteScrollDesktopSpeed?: number;
  features?: GameModeFeature[];
}

function GameModeCard({ title, subtitle, description, icon, href, comingSoon = false, delay = 0, useVortex = false, useBeams = false, useStars = false, useInfiniteScroll = false, infiniteScrollDesktopSpeed, features }: GameModeCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = () => {
    if (href && !comingSoon) {
      router.push(href);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl border border-border/40 ${useVortex || useBeams || useStars || useInfiniteScroll ? 'bg-transparent' : 'bg-card/50 backdrop-blur-sm'} transition-all duration-500 ${
        comingSoon ? "opacity-60" : "cursor-pointer hover:border-primary/40"
      }`}
      style={{
        animationDelay: `${delay}ms`,
        animation: "slideInFromBottom 0.6s ease-out forwards",
        opacity: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      {/* Solid backgrounds for all cards */}
      <div className="absolute inset-0 bg-card"></div>

      {useVortex ? (
        /* Vortex background for Daily Challenge */
        <div className="absolute inset-0 h-full z-[1]">
          <Vortex
            backgroundColor="transparent"
            rangeY={800}
            particleCount={500}
            baseHue={220}
            className="flex items-center flex-col justify-center w-full h-full opacity-70"
            containerClassName="h-full"
          />
        </div>
      ) : useBeams ? (
        /* Animated beams for Freeplay */
        <div className="absolute inset-0 h-full w-full z-[1]">
          <BackgroundBeamsWithCollision className="h-full w-full rounded-2xl">
            <div className="absolute inset-0 pointer-events-none" />
          </BackgroundBeamsWithCollision>
        </div>
      ) : useStars ? (
        /* Glowing stars for Jeopardy Mode */
        <div className="absolute inset-0 h-full w-full z-[5] pointer-events-none">
          <Illustration mouseEnter={isHovering} />
        </div>
      ) : useInfiniteScroll ? (
        /* Infinite scrolling background for Endless Survival */
        <div className="absolute inset-0 h-full w-full z-[5] pointer-events-none">
          <InfiniteScrollBackground speed={15} desktopSpeed={infiniteScrollDesktopSpeed} />
        </div>
      ) : (
        <>
          {/* Animated clip-path background */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-y-0 w-[16.666%] bg-gradient-to-b from-primary/20 via-transparent to-primary/20"
                style={{
                  left: `${i * 16.666}%`,
                  animation: `clipReveal 3.6s ease-in-out infinite`,
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Flashlight effect - skip for infinite scroll card */}
      {isHovering && !comingSoon && !useInfiniteScroll && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-[3]"
          style={{
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.03), transparent 40%)`,
          }}
        />
      )}

      <div className="relative p-6 sm:p-8 z-10 h-full flex flex-col">
        {/* Icon with glow */}
        <div className="mb-4 flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              {icon}
            </div>
          </div>
          {comingSoon && (
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />
              Coming Soon
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="mb-3">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-primary/80">
              {subtitle}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Features */}
        {features && features.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {feature.icon}
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Button */}
        <div className="mt-4">
        {!comingSoon && (
          <button className="group/btn relative overflow-hidden rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Start Playing</span>
            {/* Border beams on hover - dual beams synchronized */}
            <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100">
              {/* Dual beam gradient - both beams in single gradient */}
              <span className="absolute inset-[-1px] rounded-full blur-[0.5px] animate-[spin_6s_linear_infinite]" style={{
                background: 'conic-gradient(from 0deg, transparent 0%, transparent 15%, var(--primary) 25%, transparent 35%, transparent 50%, transparent 65%, var(--primary) 75%, transparent 85%, transparent 100%)'
              }} />
              <span className="absolute inset-[1px] rounded-full bg-background" />
            </span>
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ delay = 0 }: { delay?: number }) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = () => {
    router.push("/campaign");
  };

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 cursor-pointer hover:border-primary/40"
      style={{
        animationDelay: `${delay}ms`,
        animation: "slideInFromBottom 0.6s ease-out forwards",
        opacity: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      {/* Shooting Stars and Stars Background */}
      <ShootingStars />
      <StarsBackground />

      {/* Flashlight effect */}
      {isHovering && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20"
          style={{
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.03), transparent 40%)`,
          }}
        />
      )}

      <div className="relative p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            {/* Header with Badge */}
            <div className="space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Castle className="h-8 w-8 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-bold">
                The Wizard's Tower
              </h3>

              {/* Subtitle */}
              <p className="text-lg font-semibold text-primary/80">
                Single-Player Campaign
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                The Wizard awaits atop his Tower. Begin with his introduction, then climb through three tiers: the <span className="text-foreground font-medium">Lower Archives</span>, the <span className="text-foreground font-medium">Middle Stacks</span>, and the <span className="text-foreground font-medium">Upper Sanctum</span>.
              </p>
              <p>
                Each floor is a new category. Answer 3 of 5 questions correctly to advance. Over 1,000 floors await. How high can you climb?
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Castle className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">1,000+ Floors</p>
                  <p className="text-xs text-muted-foreground">Three tiers of increasing difficulty</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">5 Questions Per Floor</p>
                  <p className="text-xs text-muted-foreground">Score 3/5 to unlock the next floor</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Track Your Progress</p>
                  <p className="text-xs text-muted-foreground">Attempts, best scores, pass status</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Retry Anytime</p>
                  <p className="text-xs text-muted-foreground">No penalty for falling, climb again</p>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="pt-2">
              <button className="group/btn relative overflow-hidden rounded-full border border-border bg-background px-8 py-3 text-sm font-medium transition-all hover:scale-105 hover:border-primary/50">
                <span className="relative z-10">Approach the Tower</span>
                {/* Border beams on hover */}
                <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100">
                  <span className="absolute inset-[-1px] rounded-full blur-[0.5px] animate-[spin_6s_linear_infinite]" style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, transparent 15%, var(--primary) 25%, transparent 35%, transparent 50%, transparent 65%, var(--primary) 75%, transparent 85%, transparent 100%)'
                  }} />
                  <span className="absolute inset-[1px] rounded-full bg-background" />
                </span>
              </button>
            </div>
          </div>

          {/* Visual Element - Tower Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative h-64 w-40">
              {/* Simple tower visualization with stacked layers */}
              <div className="absolute inset-0 flex flex-col-reverse gap-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-md border border-primary/20 bg-gradient-to-t from-primary/10 to-primary/5 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/40"
                    style={{
                      width: `${100 - i * 5}%`,
                      marginLeft: `${i * 2.5}%`,
                      animationDelay: `${i * 0.1}s`,
                      animation: "pulse 3s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent blur-2xl opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameModesPage() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const titleText = "Game Modes";
  const titleRevealDelay = 80;

  useEffect(() => {
    // Calculate when title will be fully revealed
    const titleDuration = titleText.length * titleRevealDelay;
    const timer = setTimeout(() => {
      setShowSubtitle(true);
    }, titleDuration);

    return () => clearTimeout(timer);
  }, []);

  const gameModes = [
    {
      title: "Daily Challenge",
      description: "One curated quiz every day. Test yourself against the global leaderboard and climb the ranks.",
      icon: <Calendar className="h-7 w-7 text-primary" />,
      href: "/daily",
      useVortex: true,
    },
    {
      title: "Freeplay",
      subtitle: "Practice Mode",
      description: "Create unlimited custom quizzes tailored to your interests. Perfect for learning at your own pace.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      href: "/freeplay",
      useBeams: true,
      features: [
        { icon: <Sliders className="h-3 w-3" />, label: "Custom Difficulty" },
        { icon: <Infinity className="h-3 w-3" />, label: "Unlimited Plays" },
        { icon: <BarChart3 className="h-3 w-3" />, label: "Any Category" },
      ],
    },
    {
      title: "Faceoff",
      description: "Create custom challenges and share them with friends. Generate a quiz, get a shareable link, and compete for the best score!",
      icon: <Swords className="h-7 w-7 text-primary" />,
      href: "/faceoff",
      useBeams: true,
    },
    {
      title: "Endless Survival",
      description: "Answer questions until you get one wrong. How long can you survive? Push your limits.",
      icon: <Zap className="h-7 w-7 text-primary" />,
      href: "/survival",
      useInfiniteScroll: true,
      infiniteScrollDesktopSpeed: 40,
    },
    {
      title: "Jeopardy Mode",
      description: "A simplified Jeopardy experience. Choose categories, answer questions worth 200-1000 points, and see how high you can score.",
      icon: <LayoutGrid className="h-7 w-7 text-primary" />,
      href: "/jeopardy",
      useStars: true,
    },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes clipReveal {
          0%, 100% {
            clip-path: inset(100% 0 0 0);
          }
          50% {
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }

        @keyframes spinReverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes spinSmooth {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        :root {
          --primary-rgb: 147, 51, 234;
          --chart-4-hsl: 84 76% 80%;
        }

        .dark {
          --primary-rgb: 168, 85, 247;
          --chart-4-hsl: 84 76% 65%;
        }
      `}</style>

      <DotBackground className="min-h-screen">
        <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16 space-y-2 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight pb-1">
                Game Modes
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-muted-foreground">
                Discover new ways to test your knowledge
              </p>
            </div>

            {/* Game Mode Cards */}
            <div className="space-y-6 lg:space-y-8">
              {/* Daily and Freeplay - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {gameModes.slice(0, 2).map((mode, index) => (
                  <GameModeCard
                    key={mode.title}
                    title={mode.title}
                    subtitle={mode.subtitle}
                    description={mode.description}
                    icon={mode.icon}
                    href={mode.href}
                    delay={index * 100}
                    useVortex={mode.useVortex}
                    useBeams={mode.useBeams}
                    features={mode.features}
                  />
                ))}
              </div>

              {/* Faceoff - Full width */}
              <div>
                <GameModeCard
                  key={gameModes[2].title}
                  title={gameModes[2].title}
                  description={gameModes[2].description}
                  icon={gameModes[2].icon}
                  href={gameModes[2].href}
                  delay={200}
                  useBeams={gameModes[2].useBeams}
                />
              </div>

              {/* Endless and Jeopardy - Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {gameModes.slice(3).map((mode, index) => (
                  <GameModeCard
                    key={mode.title}
                    title={mode.title}
                    description={mode.description}
                    icon={mode.icon}
                    href={mode.href}
                    delay={(index + 3) * 100}
                    useStars={mode.useStars}
                    useInfiniteScroll={mode.useInfiniteScroll}
                    infiniteScrollDesktopSpeed={mode.infiniteScrollDesktopSpeed}
                  />
                ))}
              </div>
            </div>

            {/* Campaign Mode - Full Width Card */}
            <div className="mt-8 lg:mt-12">
              <CampaignCard delay={400} />
            </div>
          </div>
        </div>
      </DotBackground>
    </>
  );
}
