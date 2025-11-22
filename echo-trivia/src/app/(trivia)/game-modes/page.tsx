"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { DotBackground } from "@/components/ui/dot-background";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { Calendar, Sparkles, Zap, Lock, Castle, Trophy, Star } from "lucide-react";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  comingSoon?: boolean;
  delay?: number;
}

function GameModeCard({ title, description, icon, href, comingSoon = false, delay = 0 }: GameModeCardProps) {
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
      className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-500 ${
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
      {/* Flashlight effect */}
      {isHovering && !comingSoon && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--chart-4-hsl, 84 76% 70%) / 0.25), transparent 40%)`,
          }}
        />
      )}

      {/* Animated clip-path background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 w-[16.666%] bg-gradient-to-b from-primary/20 via-transparent to-primary/20"
            style={{
              left: `${i * 16.666}%`,
              animation: `clipReveal 3s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <div className="relative p-8">
        {/* Icon with glow */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
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

        {/* Title with vertical reveal animation */}
        <h3 className="mb-3 overflow-hidden text-2xl font-bold">
          <span className="inline-block" style={{ animation: "textRevealDown 0.8s ease-out forwards", animationDelay: `${delay + 200}ms`, opacity: 0 }}>
            {title}
          </span>
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Button with border beam */}
        {!comingSoon && (
          <button className="group/btn relative overflow-hidden rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium transition-all hover:scale-105">
            <span className="relative z-10">Start Playing</span>
            {/* Border beam on hover */}
            <div className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100">
              <div className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-primary via-primary/50 to-primary animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-[1px] rounded-full bg-background" />
            </div>
          </button>
        )}
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

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm transition-all duration-500 cursor-pointer hover:border-primary/40"
      style={{
        animationDelay: `${delay}ms`,
        animation: "slideInFromBottom 0.6s ease-out forwards",
        opacity: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Flashlight effect */}
      {isHovering && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--chart-4-hsl, 84 76% 70%) / 0.25), transparent 40%)`,
          }}
        />
      )}

      {/* Animated clip-path background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 w-[12.5%] bg-gradient-to-b from-primary/30 via-transparent to-primary/30"
            style={{
              left: `${i * 12.5}%`,
              animation: `clipReveal 4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            {/* Header with Badge */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                    <Castle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                  <Star className="h-3 w-3" />
                  Coming Soon
                </div>
              </div>

              {/* Title */}
              <h3 className="overflow-hidden text-3xl md:text-4xl font-bold">
                <span className="inline-block" style={{ animation: "textRevealDown 0.8s ease-out forwards", animationDelay: `${delay + 200}ms`, opacity: 0 }}>
                  The Wizard's Tower
                </span>
              </h3>

              {/* Subtitle */}
              <p className="text-lg font-semibold text-primary/80">Single-Player Campaign</p>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Embark on an <span className="text-foreground font-medium">infinite ascent</span> through the legendary Wizard's Tower. Each floor presents a new category challenge as you climb higher and higher into the mystical realm.
              </p>
              <p>
                Watch the tower <span className="text-foreground font-medium">evolve with the seasons</span> and themes as you progress. Dynamic parallax scrolling creates the illusion of endless heights — there's always another floor waiting above.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">25 New Achievements</p>
                  <p className="text-xs text-muted-foreground">Milestone rewards & category mastery</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Castle className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Infinite Tower</p>
                  <p className="text-xs text-muted-foreground">New floors unlock as you climb</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Visual Evolution</p>
                  <p className="text-xs text-muted-foreground">Seasons & themes change with progress</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Dynamic Categories</p>
                  <p className="text-xs text-muted-foreground">Each floor brings new challenges</p>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="pt-2">
              <button className="group/btn relative overflow-hidden rounded-full border border-border bg-background px-8 py-3 text-sm font-medium transition-all hover:scale-105 opacity-60 cursor-not-allowed">
                <span className="relative z-10">Adventure Awaits</span>
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
    },
    {
      title: "Practice Mode",
      description: "Unlimited custom quizzes on any topic. Choose your difficulty, categories, and question count.",
      icon: <Sparkles className="h-7 w-7 text-primary" />,
      href: "/practice",
    },
    {
      title: "Endless Survival",
      description: "Answer questions until you get one wrong. How long can you survive? Push your limits.",
      icon: <Zap className="h-7 w-7 text-primary" />,
      comingSoon: true,
    },
    {
      title: "Jeopardy Mode",
      description: "Answer in the form of a question. Choose categories and wager points in this classic game show format.",
      icon: <Lock className="h-7 w-7 text-primary" />,
      comingSoon: true,
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

        @keyframes textRevealDown {
          from {
            opacity: 0;
            clip-path: inset(0 0 100% 0);
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {gameModes.map((mode, index) => (
                <GameModeCard
                  key={mode.title}
                  title={mode.title}
                  description={mode.description}
                  icon={mode.icon}
                  href={mode.href}
                  comingSoon={mode.comingSoon}
                  delay={index * 100}
                />
              ))}
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
