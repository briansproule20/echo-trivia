"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Check, Sparkles, X, Play, Trophy, RotateCcw, BookOpen, LogIn } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { AdventureFlurp } from "@/components/trivia/AdventureFlurp";

// Tower floor background images - cycle through these for each level
const FLOOR_BACKGROUNDS = [
  "/Tower Floors/FLOOR0.png",
  "/Tower Floors/FLOOR1.png",
  "/Tower Floors/FLOOR2.png",
  "/Tower Floors/FLOOR3.png",
  "/Tower Floors/FLOOR4.png",
  "/Tower Floors/FLOOR5.png",
  "/Tower Floors/FLOOR6.png",
  "/Tower Floors/FLOOR7.png",
  "/Tower Floors/FLOOR8.png",
  "/Tower Floors/FLOOR9.png",
  "/Tower Floors/FLOOR10.png",
  "/Tower Floors/FLOOR11.png",
  "/Tower Floors/FLOOR12.png",
];

// Get background image for a floor, cycling through available images
export function getFloorBackground(floorId: number): string {
  return FLOOR_BACKGROUNDS[floorId % FLOOR_BACKGROUNDS.length];
}

// Generate floors: all categories on Easy, then Medium, then Hard
const CATEGORY_COUNT = CATEGORIES.length;
const TOTAL_FLOORS = CATEGORY_COUNT * 3;

const TIERS = [
  {
    name: "The Lower Archives",
    difficulty: "Easy" as const,
    start: 1,
    end: CATEGORY_COUNT,
    description: "Where seekers first learn to read the old texts",
    color: "emerald"
  },
  {
    name: "The Middle Stacks",
    difficulty: "Medium" as const,
    start: CATEGORY_COUNT + 1,
    end: CATEGORY_COUNT * 2,
    description: "Where the Drift begins to obscure the signal",
    color: "amber"
  },
  {
    name: "The Upper Sanctum",
    difficulty: "Hard" as const,
    start: CATEGORY_COUNT * 2 + 1,
    end: CATEGORY_COUNT * 3,
    description: "Where only true maintainers can navigate",
    color: "rose"
  },
];

function generateFloors(): Floor[] {
  const floors: Floor[] = [];

  for (const tier of TIERS) {
    for (let i = 0; i < CATEGORY_COUNT; i++) {
      const floorId = tier.start + i;
      floors.push({
        id: floorId,
        category: CATEGORIES[i],
        difficulty: tier.difficulty,
        tier: tier.name,
        background: getFloorBackground(floorId),
      });
    }
  }

  return floors;
}

const FLOORS = generateFloors();

// Player progress - will be fetched from DB
const PLAYER_PROGRESS = {
  currentFloor: 0, // 0 = tutorial, 1+ = regular floors
  completedFloors: [] as number[],
  tutorialCompleted: false, // Must complete tutorial to unlock floor 1
};

// Floor stats - will be fetched from DB
const FLOOR_STATS: Record<number, { attempts: number; bestScore: number; passed: boolean }> = {};

interface Floor {
  id: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Tutorial";
  tier: string;
  isTutorial?: boolean;
  background: string;
}

// Floor 0 - Tutorial (must complete to unlock campaign)
const TUTORIAL_FLOOR: Floor = {
  id: 0,
  category: "The Wizard's Introduction",
  difficulty: "Tutorial",
  tier: "Prologue",
  isTutorial: true,
  background: getFloorBackground(0),
};

interface FloorStats {
  attempts: number;
  bestScore: number;
  passed: boolean;
}

function FloorDetailModal({
  floor,
  stats,
  isLocked,
  isCompleted,
  isCurrent,
  isAuthenticated,
  username,
  onClose,
  onStartFloor
}: {
  floor: Floor;
  stats: FloorStats | null;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isAuthenticated: boolean;
  username: string | null;
  onClose: () => void;
  onStartFloor: (floor: Floor) => void;
}) {
  const difficultyColors = {
    Easy: "text-emerald-400 bg-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/20",
    Hard: "text-rose-400 bg-rose-500/20",
    Tutorial: "text-violet-400 bg-violet-500/20",
  };

  const isTutorial = floor.isTutorial;
  const canPlay = isTutorial ? isAuthenticated : (!isLocked || isCurrent);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[400px] sm:max-w-[90vw] bg-stone-900 border border-amber-900/30 sm:rounded-xl rounded-t-xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-amber-900/20">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isTutorial ? "bg-violet-500/20" : "bg-stone-800"}`}>
              {isTutorial ? (
                <BookOpen className="w-6 h-6 text-violet-400" />
              ) : (
                <span className="font-mono text-lg text-amber-400">{floor.id}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h2 className="font-serif text-lg text-stone-100 leading-tight">{floor.category}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[floor.difficulty]}`}>
                  {floor.difficulty}
                </span>
                {!isTutorial && <span className="text-xs text-stone-500">{floor.tier}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Content - different for tutorial vs regular floors */}
        {isTutorial ? (
          <div className="px-5 py-4 space-y-4">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
              <p className="text-stone-200 font-serif text-sm leading-relaxed">
                Welcome, <span className="text-violet-300 font-medium">{username || "Traveler"}</span>.
              </p>
              <p className="text-stone-400 text-sm mt-2 leading-relaxed">
                The Wizard awaits to introduce you to the Tower and its mysteries.
              </p>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-stone-500 text-center">
                Sign in to begin your journey
              </p>
            )}
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Attempts */}
              <div className="bg-stone-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-xs">Attempts</span>
                </div>
                <span className="text-lg font-mono text-stone-200">
                  {stats?.attempts ?? 0}
                </span>
              </div>

              {/* Best Score */}
              <div className="bg-stone-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-xs">Best</span>
                </div>
                <span className="text-lg font-mono text-stone-200">
                  {stats?.bestScore != null ? `${stats.bestScore}/5` : "—"}
                </span>
              </div>

              {/* Status */}
              <div className="bg-stone-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span className="text-xs">Status</span>
                </div>
                <span className={`text-sm font-medium ${
                  isCompleted ? "text-emerald-400" :
                  isCurrent ? "text-amber-400" :
                  "text-stone-500"
                }`}>
                  {isCompleted ? "Passed" : isCurrent ? "Current" : "Locked"}
                </span>
              </div>
            </div>

            {/* Pass requirement hint */}
            <p className="text-xs text-stone-500 text-center">
              Score 3/5 or higher to advance
            </p>
          </div>
        )}

        {/* Action */}
        <div className="px-5 pb-5">
          <button
            disabled={!canPlay}
            onClick={() => canPlay && onStartFloor(floor)}
            className={`
              w-full py-3 rounded-lg font-serif text-sm flex items-center justify-center gap-2 transition-all
              ${canPlay
                ? "bg-violet-500/20 text-violet-200 border border-violet-500/30 hover:bg-violet-500/30"
                : "bg-stone-800/50 text-stone-600 border border-stone-700/50 cursor-not-allowed"
              }
            `}
          >
            {isTutorial ? (
              !isAuthenticated ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Begin</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Prologue</span>
                </>
              )
            ) : isLocked && !isCurrent ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Floor Locked</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{isCompleted ? "Play Again" : "Begin Floor"}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FloorRow({ floor, isCompleted, isCurrent, isLocked, index, onClick, floorRef }: {
  floor: Floor;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onClick: () => void;
  index: number;
  floorRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const isTutorial = floor.isTutorial;

  return (
    <motion.div
      ref={floorRef}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-4 py-3 transition-all cursor-pointer
        ${isTutorial ? "border-b border-violet-500/20" : "border-b border-violet-900/20"}
        ${isLocked ? "opacity-50" : "hover:bg-violet-500/5"}
        ${isCurrent ? "bg-violet-500/10 border-l-2 border-l-violet-500" : ""}
        ${isCompleted ? "bg-emerald-500/5" : ""}
      `}
    >
      {/* Floor number with decorative element */}
      <div className="relative flex items-center justify-center w-12">
        <div className={`
          absolute inset-0 rounded-lg opacity-20
          ${isCompleted ? "bg-emerald-500" : isCurrent ? "bg-violet-500" : ""}
        `} />
        {isTutorial ? (
          <BookOpen className={`w-5 h-5 relative z-10 ${isCompleted ? "text-emerald-400" : isCurrent ? "text-violet-400" : "text-stone-500"}`} />
        ) : (
          <span className={`
            font-mono text-sm tabular-nums relative z-10
            ${isCompleted ? "text-emerald-400" : isCurrent ? "text-violet-400" : "text-stone-500"}
          `}>
            {floor.id}
          </span>
        )}
      </div>

      {/* Vertical connector line */}
      <div className="flex flex-col items-center w-4">
        <div className={`w-px h-full min-h-[20px] ${isLocked ? "bg-stone-700/50" : "bg-violet-500/30"}`} />
      </div>

      {/* Category name */}
      <div className={`
        flex-1 min-w-0 font-serif text-sm
        ${isLocked ? "text-stone-500" : "text-stone-200"}
        ${isCurrent ? "text-violet-200" : ""}
        ${isCompleted ? "text-emerald-200" : ""}
      `}>
        <span className="truncate block">{floor.category}</span>
        {isTutorial && <span className="text-xs text-stone-500 block">Floor 0 · Prologue</span>}
      </div>

      {/* Status icon */}
      <div className="w-8 flex justify-center">
        {isCompleted ? (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        ) : isCurrent ? (
          <motion.div
            className="w-6 h-6 rounded-full flex items-center justify-center bg-violet-500/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </motion.div>
        ) : isLocked ? (
          <div className="w-6 h-6 rounded-full bg-stone-800/50 flex items-center justify-center">
            <Lock className="w-3 h-3 text-stone-600" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function TierHeader({ tier, isFirst }: { tier: typeof TIERS[number]; isFirst?: boolean }) {
  const colorStyles = {
    emerald: "bg-emerald-950 border-emerald-500/30 text-emerald-400",
    amber: "bg-amber-950 border-amber-500/30 text-amber-400",
    rose: "bg-rose-950 border-rose-500/30 text-rose-400",
  };

  return (
    <div className={`
      sticky top-0 z-10 px-4 py-4 border-b
      ${colorStyles[tier.color as keyof typeof colorStyles]}
      ${!isFirst ? "mt-6" : ""}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-medium text-stone-100">{tier.name}</h2>
          <p className="text-xs text-stone-400 font-serif italic mt-0.5">{tier.description}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-stone-900/50 ${colorStyles[tier.color as keyof typeof colorStyles].split(' ').pop()}`}>
            {tier.difficulty}
          </span>
          <p className="text-xs text-stone-500 font-mono mt-1">
            {tier.start}–{tier.end}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CampaignLevelsPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentFloorRef = useRef<HTMLDivElement>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [showFlurp, setShowFlurp] = useState(false);
  const [pendingFloor, setPendingFloor] = useState<Floor | null>(null);
  const echo = useEcho();

  const isAuthenticated = !!echo.user;
  const username = echo.user?.name || echo.user?.email || null;

  const handleStartFloor = (floor: Floor) => {
    setPendingFloor(floor);
    setSelectedFloor(null); // Close modal
    setShowFlurp(true);
  };

  const handleFlurpExpanded = () => {
    if (pendingFloor) {
      // Navigate to the floor play page (TODO: create this page)
      router.push(`/campaign/play/${pendingFloor.id}`);
    }
  };

  // Scroll to current floor on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentFloorRef.current && scrollRef.current) {
        currentFloorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300); // Wait for animations to settle

    return () => clearTimeout(timer);
  }, []);

  const floorsByTier = {
    lower: FLOORS.filter(f => f.id <= CATEGORY_COUNT),
    middle: FLOORS.filter(f => f.id > CATEGORY_COUNT && f.id <= CATEGORY_COUNT * 2),
    upper: FLOORS.filter(f => f.id > CATEGORY_COUNT * 2),
  };

  return (
    <div className="h-screen flex flex-col bg-stone-950">
      {/* Subtle background texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex-shrink-0 px-4 py-4 border-b border-amber-900/30 bg-stone-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link
            href="/campaign"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10 transition-all font-serif"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </Link>

          <div className="text-center">
            <h1 className="font-serif text-xl font-semibold text-amber-100">The Tower</h1>
            <p className="text-xs text-stone-500 font-mono">{TOTAL_FLOORS} floors to ascend</p>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-1 bg-stone-900">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
          style={{ width: `${(PLAYER_PROGRESS.currentFloor / TOTAL_FLOORS) * 100}%` }}
        />
      </div>

      {/* Floor list */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">
        {/* Lower Archives */}
        <TierHeader tier={TIERS[0]} isFirst />

        {/* Floor 0 - Tutorial (must complete to unlock campaign) */}
        <FloorRow
          floor={TUTORIAL_FLOOR}
          index={0}
          isCompleted={PLAYER_PROGRESS.tutorialCompleted}
          isCurrent={PLAYER_PROGRESS.currentFloor === 0 && !PLAYER_PROGRESS.tutorialCompleted}
          isLocked={false} // Tutorial is always unlocked
          onClick={() => setSelectedFloor(TUTORIAL_FLOOR)}
          floorRef={PLAYER_PROGRESS.currentFloor === 0 ? currentFloorRef : undefined}
        />
        {floorsByTier.lower.map((floor, index) => {
          const isCurrent = floor.id === PLAYER_PROGRESS.currentFloor && PLAYER_PROGRESS.tutorialCompleted;
          return (
            <FloorRow
              key={floor.id}
              floor={floor}
              index={index + 1}
              isCompleted={PLAYER_PROGRESS.completedFloors.includes(floor.id)}
              isCurrent={isCurrent}
              isLocked={!PLAYER_PROGRESS.tutorialCompleted || floor.id > PLAYER_PROGRESS.currentFloor}
              onClick={() => setSelectedFloor(floor)}
              floorRef={isCurrent ? currentFloorRef : undefined}
            />
          );
        })}

        {/* Middle Stacks */}
        <TierHeader tier={TIERS[1]} />
        {floorsByTier.middle.map((floor, index) => {
          const isCurrent = floor.id === PLAYER_PROGRESS.currentFloor && PLAYER_PROGRESS.tutorialCompleted;
          return (
            <FloorRow
              key={floor.id}
              floor={floor}
              index={index + 1}
              isCompleted={PLAYER_PROGRESS.completedFloors.includes(floor.id)}
              isCurrent={isCurrent}
              isLocked={!PLAYER_PROGRESS.tutorialCompleted || floor.id > PLAYER_PROGRESS.currentFloor}
              onClick={() => setSelectedFloor(floor)}
              floorRef={isCurrent ? currentFloorRef : undefined}
            />
          );
        })}

        {/* Upper Sanctum */}
        <TierHeader tier={TIERS[2]} />
        {floorsByTier.upper.map((floor, index) => {
          const isCurrent = floor.id === PLAYER_PROGRESS.currentFloor && PLAYER_PROGRESS.tutorialCompleted;
          return (
            <FloorRow
              key={floor.id}
              floor={floor}
              index={index + 1}
              isCompleted={PLAYER_PROGRESS.completedFloors.includes(floor.id)}
              isCurrent={isCurrent}
              isLocked={!PLAYER_PROGRESS.tutorialCompleted || floor.id > PLAYER_PROGRESS.currentFloor}
              onClick={() => setSelectedFloor(floor)}
              floorRef={isCurrent ? currentFloorRef : undefined}
            />
          );
        })}

        {/* Bottom padding with decorative element */}
        <div className="h-32 flex items-center justify-center">
          <div className="text-stone-700 font-serif text-sm italic">
            ✦ The summit awaits ✦
          </div>
        </div>
      </div>

      {/* Floor detail modal */}
      <AnimatePresence>
        {selectedFloor && (
          <FloorDetailModal
            floor={selectedFloor}
            stats={FLOOR_STATS[selectedFloor.id] ?? null}
            isLocked={selectedFloor.isTutorial ? false : (!PLAYER_PROGRESS.tutorialCompleted || selectedFloor.id > PLAYER_PROGRESS.currentFloor)}
            isCompleted={selectedFloor.isTutorial ? PLAYER_PROGRESS.tutorialCompleted : PLAYER_PROGRESS.completedFloors.includes(selectedFloor.id)}
            isCurrent={selectedFloor.isTutorial
              ? (PLAYER_PROGRESS.currentFloor === 0 && !PLAYER_PROGRESS.tutorialCompleted)
              : (selectedFloor.id === PLAYER_PROGRESS.currentFloor && PLAYER_PROGRESS.tutorialCompleted)
            }
            isAuthenticated={isAuthenticated}
            username={username}
            onClose={() => setSelectedFloor(null)}
            onStartFloor={handleStartFloor}
          />
        )}
      </AnimatePresence>

      {/* Adventure Flurp - purple circle transition */}
      <AdventureFlurp
        isVisible={showFlurp}
        onExpanded={handleFlurpExpanded}
        onAnimationComplete={() => setShowFlurp(false)}
      />
    </div>
  );
}
