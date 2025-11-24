"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface InfiniteScrollBackgroundProps {
  className?: string;
  speed?: number;
  desktopSpeed?: number;
}

export const InfiniteScrollBackground: React.FC<InfiniteScrollBackgroundProps> = ({
  className,
  speed = 30,
  desktopSpeed,
}) => {
  // Use desktopSpeed if provided, otherwise fall back to speed
  const mobileSpeed = speed;
  const finalDesktopSpeed = desktopSpeed !== undefined ? desktopSpeed : speed;
  const speedRatio = finalDesktopSpeed / mobileSpeed;

  // Generate dots positions once - same positions for mobile and desktop
  const dots = useMemo(() => {
    const count = 60;
    const duration = mobileSpeed * 0.8;
    // Seeded pseudo-random for vertical positions only
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: seededRandom(i + 1) * 66, // Pseudo-random vertical position
      duration: duration,
      delay: -((i / count) * duration), // Evenly spread across cycle
    }));
  }, [mobileSpeed]);

  // Generate horizontal lines with evenly spread delays
  const lines = useMemo(() => {
    const count = 12;
    const lineDuration = 15;
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: 72 + seededRandom(i + 200) * 28, // 72% to 100% (ground area)
      duration: lineDuration,
      delay: -((i / count) * lineDuration),
    }));
  }, []);

  // Generate speed lines with evenly spread delays
  const speedLines = useMemo(() => {
    const count = 20;
    const speedLineDuration = 9;
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: 72 + seededRandom(i + 300) * 28, // 72% to 100% (ground area)
      duration: speedLineDuration,
      delay: -((i / count) * speedLineDuration),
    }));
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Horizontal lines that scroll - ground level MOBILE */}
      <div className="absolute inset-0 md:hidden">
        {lines.map((line) => (
          <div
            key={`line-mobile-${line.id}`}
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              top: `${line.top}%`,
              animation: `scroll-horizontal ${line.duration}s linear infinite ${line.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Horizontal lines that scroll - ground level DESKTOP */}
      <div className="absolute inset-0 hidden md:block">
        {lines.map((line) => (
          <div
            key={`line-desktop-${line.id}`}
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              top: `${line.top}%`,
              animation: `scroll-horizontal ${line.duration * speedRatio}s linear infinite ${line.delay * speedRatio}s`,
            }}
          />
        ))}
      </div>

      {/* Moving dots/particles MOBILE */}
      <div className="absolute inset-0 z-[10] md:hidden">
        {dots.map((dot) => (
          <div
            key={`dot-mobile-${dot.id}`}
            className="absolute h-[2px] w-[2px] rounded-full bg-primary/40"
            style={{
              top: `${dot.top}%`,
              left: "100%",
              animation: `scroll-dots ${dot.duration}s linear infinite ${dot.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Moving dots/particles DESKTOP */}
      <div className="absolute inset-0 z-[10] hidden md:block">
        {dots.map((dot) => (
          <div
            key={`dot-desktop-${dot.id}`}
            className="absolute h-[2px] w-[2px] rounded-full bg-primary/40"
            style={{
              top: `${dot.top}%`,
              left: "100%",
              animation: `scroll-dots ${dot.duration * speedRatio}s linear infinite ${dot.delay * speedRatio}s`,
            }}
          />
        ))}
      </div>

      {/* Speed lines - ground level MOBILE */}
      <div className="absolute inset-0 md:hidden">
        {speedLines.map((line) => (
          <div
            key={`speed-mobile-${line.id}`}
            className="absolute h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            style={{
              width: "30%",
              top: `${line.top}%`,
              left: "100%",
              animation: `speed-line ${line.duration}s linear infinite ${line.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Speed lines - ground level DESKTOP */}
      <div className="absolute inset-0 hidden md:block">
        {speedLines.map((line) => (
          <div
            key={`speed-desktop-${line.id}`}
            className="absolute h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            style={{
              width: "30%",
              top: `${line.top}%`,
              left: "100%",
              animation: `speed-line ${line.duration * speedRatio}s linear infinite ${line.delay * speedRatio}s`,
            }}
          />
        ))}
      </div>

      {/* Journey character MOBILE */}
      <div className="absolute inset-0 z-[15] md:hidden">
        <div
          className="absolute left-[100%]"
          style={{
            bottom: "-20%",
            animation: "tower-scroll 20s linear infinite 0s",
            filter: "drop-shadow(0 0 15px hsl(var(--primary) / 0.3))",
          }}
        >
          <div className="relative w-36 h-36" style={{ transform: "scaleX(-1)" }}>
            <Image
              src="/journey.png"
              alt="Journey"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Journey character DESKTOP */}
      <div className="absolute inset-0 z-[15] hidden md:block">
        <div
          className="absolute left-[100%]"
          style={{
            bottom: "-27.5%",
            animation: "tower-scroll 40s linear infinite -20s",
            filter: "drop-shadow(0 0 15px hsl(var(--primary) / 0.3))",
          }}
        >
          <div className="relative w-48 h-48" style={{ transform: "scaleX(-1)" }}>
            <Image
              src="/journey.png"
              alt="Journey"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Wizard's Tower MOBILE */}
      <div className="absolute inset-0 md:hidden">
        <div
          className="absolute left-[100%]"
          style={{
            bottom: "-18%",
            animation: "tower-scroll 20s linear infinite",
            filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.4))",
            animationDelay: "-10s",
          }}
        >
          <div className="relative w-32 h-52">
            <Image
              src="/wiztower reacticon.png"
              alt="Wizard Tower"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Wizard's Tower DESKTOP */}
      <div className="absolute inset-0 hidden md:block">
        <div
          className="absolute left-[100%]"
          style={{
            bottom: "-28%",
            animation: "tower-scroll 50s linear infinite",
            filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.4))",
          }}
        >
          <div className="relative w-43 h-69">
            <Image
              src="/wiztower reacticon.png"
              alt="Wizard Tower"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0) scaleX(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) scaleX(0.5);
            opacity: 0;
          }
        }

        @keyframes scroll-dots {
          0% {
            transform: translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            opacity: 1;
            transform: translateX(-50vw) scale(1.5);
          }
          100% {
            transform: translateX(-100vw) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes speed-line {
          0% {
            transform: translateX(0) scaleX(0);
            opacity: 0;
          }
          20% {
            transform: translateX(-20vw) scaleX(1);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(-120vw) scaleX(0.3);
            opacity: 0;
          }
        }

        @keyframes tower-scroll {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-120vw);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
