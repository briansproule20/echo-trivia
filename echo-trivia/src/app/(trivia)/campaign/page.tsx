"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

// Floating arcane runes that drift upward
const ARCANE_GLYPHS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];

function FloatingRune({ delay, x }: { delay: number; x: number }) {
  const glyph = ARCANE_GLYPHS[Math.floor(Math.random() * ARCANE_GLYPHS.length)];

  return (
    <motion.span
      className="absolute text-amber-400 text-3xl font-serif select-none pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
      style={{ left: `${x}%` }}
      initial={{ y: "100vh", opacity: 0, scale: 0.5 }}
      animate={{
        y: "-20vh",
        opacity: [0, 0.8, 0.8, 0],
        scale: [0.5, 1, 1, 0.8],
        rotate: [0, 10, -10, 0]
      }}
      transition={{
        duration: 12 + Math.random() * 8,
        delay: delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {glyph}
    </motion.span>
  );
}

// Candle flicker effect for ambient lighting
function CandleGlow() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255, 147, 41, 0.08) 0%, transparent 70%)",
      }}
      animate={{
        opacity: [0.6, 1, 0.7, 0.9, 0.6],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Magical seal component
function MagicalSeal() {
  const outerRadius = 80; // sm:80px, base will be scaled
  const middleRadius = 56;

  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative w-full h-full rounded-full border-2 border-amber-500/40">
          {/* Rune markers on outer ring */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <span
              key={deg}
              className="absolute w-2 h-2 bg-amber-500/60 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
                left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Middle counter-rotating ring */}
      <motion.div
        className="absolute inset-4 flex items-center justify-center"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative w-full h-full rounded-full border border-amber-400/30">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span
              key={deg}
              className="absolute text-amber-400/50 text-xs font-serif -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
                left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
              }}
            >
              ᛟ
            </span>
          ))}
        </div>
      </motion.div>

      {/* Inner pulsing core */}
      <motion.div
        className="absolute inset-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 20px rgba(245, 158, 11, 0.2)",
            "0 0 40px rgba(245, 158, 11, 0.4)",
            "0 0 20px rgba(245, 158, 11, 0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-amber-400 text-3xl font-serif">ᛊ</span>
      </motion.div>
    </div>
  );
}

// Dust particles floating in light beams
function DustParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-200/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            delay: Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function CampaignPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random positions for floating runes
  const runePositions = [...Array(12)].map((_, i) => ({
    delay: i * 1.5,
    x: 5 + (i * 8) % 90,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950">
      {/* Background images - different for mobile vs desktop */}
      <div className="fixed inset-0 z-0">
        {/* Mobile: Tower portrait image */}
        <Image
          src="/wizardstowerground floor.png"
          alt="The Wizard's Tower"
          fill
          className="object-cover object-top md:hidden"
          priority
        />
        {/* Desktop: Study landscape image */}
        <Image
          src="/UPSCALED.png"
          alt="The Wizard's Study"
          fill
          className="hidden md:block object-cover"
          priority
        />
        {/* Very subtle darkening for contrast */}
        <div className="absolute inset-0 bg-stone-950/20" />
      </div>

      {/* Candle glow ambient effect */}
      <CandleGlow />

      {/* Dust particles */}
      {mounted && <DustParticles />}

      {/* Floating arcane runes */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {runePositions.map((pos, i) => (
            <FloatingRune key={i} delay={pos.delay} x={pos.x} />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Back navigation */}
        <motion.div
          className="p-4 sm:p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/game-modes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/60 backdrop-blur-sm border border-amber-500/30 text-amber-200 hover:bg-stone-950/80 hover:border-amber-500/50 transition-all text-sm"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif">Return to Crossroads</span>
          </Link>
        </motion.div>

        {/* Hero content - text at bottom, image breathes */}
        <div className="flex-1 flex flex-col justify-end pb-12 sm:pb-16 px-4">
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2
              className="text-amber-300 font-serif text-sm sm:text-base tracking-[0.2em] uppercase font-medium"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)" }}
            >
              Single-Player Campaign
            </h2>
            <h1
              className="text-4xl sm:text-6xl font-serif font-bold text-amber-100 leading-tight"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)" }}
            >
              The Wizard's Tower
            </h1>

            {/* Enter Tower button */}
            <div className="flex justify-center pt-2">
              <Link
                href="/campaign/levels"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-amber-500/40 bg-amber-500/10 backdrop-blur-sm hover:bg-amber-500/20 hover:border-amber-500/60 transition-all text-amber-200 text-sm font-serif tracking-wide"
              >
                <span>Enter the Tower</span>
                <motion.div
                  className="w-2 h-2 rounded-full bg-amber-400"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
