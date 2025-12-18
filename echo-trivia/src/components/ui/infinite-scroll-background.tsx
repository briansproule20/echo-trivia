"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

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

  // Pre-computed positions to avoid hydration mismatch
  const dotPositions = [
    3, 45, 12, 58, 27, 41, 8, 63, 19, 52, 35, 6, 48, 23, 61, 14, 39, 55, 2, 47,
    31, 9, 56, 17, 44, 28, 64, 11, 38, 53, 21, 4, 49, 33, 60, 15, 42, 7, 57, 25,
    46, 13, 59, 30, 5, 51, 18, 62, 36, 10, 54, 22, 43, 1, 50, 34, 65, 16, 40, 26
  ];

  const linePositions = [74, 82, 77, 91, 85, 79, 95, 73, 88, 76, 93, 81];
  const speedLinePositions = [
    75, 89, 78, 94, 72, 86, 80, 97, 74, 91, 77, 95, 83, 73, 88, 79, 96, 76, 92, 84
  ];

  // Generate dots positions once - same positions for mobile and desktop
  const dots = useMemo(() => {
    const count = 60;
    const duration = mobileSpeed * 0.8;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: dotPositions[i % dotPositions.length],
      duration: duration,
      delay: -((i / count) * duration),
    }));
  }, [mobileSpeed]);

  // Generate horizontal lines with evenly spread delays
  const lines = useMemo(() => {
    const count = 12;
    const lineDuration = 15;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: linePositions[i],
      duration: lineDuration,
      delay: -((i / count) * lineDuration),
    }));
  }, []);

  // Generate speed lines with evenly spread delays
  const speedLines = useMemo(() => {
    const count = 20;
    const speedLineDuration = 9;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: speedLinePositions[i],
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
      `}</style>
    </div>
  );
};
