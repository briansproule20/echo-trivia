"use client";

import { useEffect, useState } from "react";

// Arcane glyphs for floating runes
const ARCANE_GLYPHS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];

interface RuneData {
  glyph: string;
  angle: number;
  delay: number;
  size: number;
}

function generateRunes(): RuneData[] {
  return Array.from({ length: 16 }, (_, i) => ({
    glyph: ARCANE_GLYPHS[Math.floor(Math.random() * ARCANE_GLYPHS.length)],
    angle: (i * 22.5) + (Math.random() * 15 - 7.5), // Spread evenly with slight randomness
    delay: Math.random() * 0.3,
    size: 16 + Math.random() * 16, // 16-32px
  }));
}

interface AdventureFlurpProps {
  isVisible: boolean;
  fadeOnly?: boolean;
  onExpanded?: () => void;
  onAnimationComplete?: () => void;
}

export function AdventureFlurp({ isVisible, fadeOnly = false, onExpanded, onAnimationComplete }: AdventureFlurpProps) {
  const [runes, setRunes] = useState<RuneData[]>([]);

  useEffect(() => {
    if (isVisible) {
      setRunes(generateRunes());
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    if (fadeOnly) {
      const doneTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 500);
      return () => clearTimeout(doneTimer);
    }

    // Navigate early (50% = 1100ms) to give page time to load
    const expandedTimer = setTimeout(() => {
      onExpanded?.();
    }, 1100);

    const doneTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2200);

    return () => {
      clearTimeout(expandedTimer);
      clearTimeout(doneTimer);
    };
  }, [isVisible, fadeOnly, onExpanded, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Expanding circle */}
      <div
        className="absolute rounded-full bg-violet-950"
        style={{
          width: "50px",
          height: "50px",
          animation: fadeOnly ? "adventure-fade-only 0.5s ease-out forwards" : "adventure-expand-and-fade 2.2s ease-out forwards",
        }}
      />

      {/* Floating gold runes - burst outward in all directions */}
      {!fadeOnly && runes.map((rune, i) => {
        const angleRad = (rune.angle * Math.PI) / 180;
        const endX = Math.cos(angleRad) * 50;
        const endY = Math.sin(angleRad) * 50;

        return (
          <span
            key={i}
            className="absolute text-amber-400 font-serif select-none drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] rune-burst"
            style={{
              fontSize: `${rune.size}px`,
              ["--end-x" as string]: `${endX}vw`,
              ["--end-y" as string]: `${endY}vh`,
              ["--rotation" as string]: `${rune.angle > 180 ? -360 : 360}deg`,
              animationDelay: `${rune.delay}s`,
            }}
          >
            {rune.glyph}
          </span>
        );
      })}

      <style jsx>{`
        @keyframes adventure-expand-and-fade {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          85% {
            transform: scale(45);
            opacity: 1;
          }
          100% {
            transform: scale(45);
            opacity: 0;
          }
        }
        @keyframes adventure-fade-only {
          0% {
            transform: scale(45);
            opacity: 1;
          }
          100% {
            transform: scale(45);
            opacity: 0;
          }
        }
        .rune-burst {
          animation: rune-burst 3.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes rune-burst {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3) rotate(0deg);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--end-x), var(--end-y)) scale(1.2) rotate(var(--rotation));
          }
        }
      `}</style>
    </div>
  );
}
