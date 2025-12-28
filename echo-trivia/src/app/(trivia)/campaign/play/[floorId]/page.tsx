"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { getFloorBackground } from "../../levels/page";
import { AdventureFlurp } from "@/components/trivia/AdventureFlurp";

export default function CampaignPlayPage() {
  const params = useParams();
  const router = useRouter();
  const echo = useEcho();
  const floorId = parseInt(params.floorId as string, 10);
  const [showFlurp, setShowFlurp] = useState(false);

  const username = echo.user?.name || echo.user?.email?.split("@")[0] || "Traveler";
  const background = getFloorBackground(floorId);

  const handleAcknowledge = () => {
    setShowFlurp(true);
  };

  const handleFlurpExpanded = () => {
    router.push("/campaign/levels");
  };

  // Floor 0 is the Prologue
  if (floorId === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-stone-950">
        {/* Background image */}
        <div className="fixed inset-0 z-0">
          <Image
            src={background}
            alt="The Tower - Prologue"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
        </div>

        {/* Back button */}
        <motion.div
          className="relative z-20 p-4 sm:p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/campaign/levels"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/60 backdrop-blur-sm border border-amber-500/30 text-amber-200 hover:bg-stone-950/80 hover:border-amber-500/50 transition-all text-sm"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif">Return to Tower</span>
          </Link>
        </motion.div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 pb-12">
          <motion.div
            className="max-w-2xl w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Wizard greeting card */}
            <div className="bg-stone-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 mb-2"
                >
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </motion.div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-amber-100"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                >
                  Welcome, {username}
                </h1>
                <p className="text-amber-300/70 font-serif text-sm tracking-wide uppercase">
                  The Wizard's Introduction
                </p>
              </div>

              {/* Wizard's message */}
              <div className="space-y-4 text-stone-200 font-serif leading-relaxed">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  You've found your way to the Tower. Good. The Archive needs more minds like yours.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  Each floor holds five questions. Answer at least three correctly to prove you've understood the texts, and the way upward will open.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  The Lower Archives test basic comprehension. As you climb, the questions grow harder. The Upper Sanctum will challenge even the sharpest minds.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="text-amber-200/90"
                >
                  There is no shame in falling. Return as many times as you need. The Tower is patient, and so am I.
                </motion.p>
              </div>

              {/* Rules summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50"
              >
                <h3 className="text-sm font-medium text-amber-400 mb-3 uppercase tracking-wide">
                  The Rules
                </h3>
                <ul className="space-y-2 text-sm text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>5 questions per floor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>Score 3/5 or higher to advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>Difficulty increases as you climb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>Retry any floor as many times as needed</span>
                  </li>
                </ul>
              </motion.div>

              {/* Acknowledge button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="pt-2"
              >
                <button
                  onClick={handleAcknowledge}
                  disabled={showFlurp}
                  className="w-full py-3 rounded-xl font-serif text-sm flex items-center justify-center gap-2 transition-all bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-500/60 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I Understand</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Adventure Flurp */}
        <AdventureFlurp
          isVisible={showFlurp}
          onExpanded={handleFlurpExpanded}
          onAnimationComplete={() => setShowFlurp(false)}
        />
      </div>
    );
  }

  // Other floors - placeholder for now
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950">
      <div className="fixed inset-0 z-0">
        <Image
          src={background}
          alt={`Floor ${floorId}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-stone-950/60" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold text-amber-100">
            Floor {floorId}
          </h1>
          <p className="text-stone-400">
            Quiz gameplay coming soon...
          </p>
          <Link
            href="/campaign/levels"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900/80 border border-amber-500/30 text-amber-200 hover:bg-stone-900 transition-all text-sm font-serif"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Tower
          </Link>
        </div>
      </div>
    </div>
  );
}
