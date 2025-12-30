// Get tower progress for authenticated user

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { CATEGORIES } from "@/lib/types";

// Constants for tower structure
const TOTAL_CATEGORIES = CATEGORIES.length;
const TIER_1_MAX = TOTAL_CATEGORIES;
const TIER_2_MAX = TOTAL_CATEGORIES * 2;
const TIER_3_MAX = TOTAL_CATEGORIES * 3;

// Tier info
const TIERS = {
  1: { name: "The Lower Archives", difficulty: "easy" },
  2: { name: "The Middle Stacks", difficulty: "medium" },
  3: { name: "The Upper Sanctum", difficulty: "hard" },
};

function getTierInfo(floorNumber: number) {
  if (floorNumber <= TIER_1_MAX) {
    return { tier: 1, ...TIERS[1] };
  } else if (floorNumber <= TIER_2_MAX) {
    return { tier: 2, ...TIERS[2] };
  }
  return { tier: 3, ...TIERS[3] };
}

function getFloorCategory(floorNumber: number) {
  const categoryIndex = (floorNumber - 1) % TOTAL_CATEGORIES;
  return CATEGORIES[categoryIndex];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const echoUserId = searchParams.get("echo_user_id");

    if (!echoUserId) {
      return NextResponse.json({ error: "Missing echo_user_id" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get tower progress
    const { data: progress, error } = await supabase
      .from("tower_progress")
      .select("*")
      .eq("echo_user_id", echoUserId)
      .single();

    // If no progress exists, return default state
    if (error?.code === "PGRST116" || !progress) {
      const tierInfo = getTierInfo(1);
      return NextResponse.json({
        progress: null,
        currentFloor: 1,
        highestFloor: 1,
        tier: tierInfo.tier,
        tierName: tierInfo.name,
        difficulty: tierInfo.difficulty,
        category: getFloorCategory(1),
        totalFloors: TIER_3_MAX,
        totalCategories: TOTAL_CATEGORIES,
        perfectFloors: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        accuracy: 0,
        hasStarted: false,
      });
    }

    if (error) {
      console.error("Error fetching tower progress:", error);
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }

    // Fetch best scores per floor from tower_floor_attempts
    const { data: floorAttempts } = await supabase
      .from("tower_floor_attempts")
      .select("floor_number, score, passed")
      .eq("echo_user_id", echoUserId);

    // Build floor stats map with best scores
    const floorStats: Record<number, { attempts: number; bestScore: number; passed: boolean }> = {};
    if (floorAttempts) {
      for (const attempt of floorAttempts) {
        const floorId = attempt.floor_number;
        if (!floorStats[floorId]) {
          floorStats[floorId] = { attempts: 0, bestScore: 0, passed: false };
        }
        floorStats[floorId].attempts += 1;
        floorStats[floorId].bestScore = Math.max(floorStats[floorId].bestScore, attempt.score);
        if (attempt.passed) {
          floorStats[floorId].passed = true;
        }
      }
    }

    const tierInfo = getTierInfo(progress.current_floor);
    const accuracy = progress.total_questions > 0
      ? (progress.total_correct / progress.total_questions) * 100
      : 0;

    return NextResponse.json({
      progress,
      currentFloor: progress.current_floor,
      highestFloor: progress.highest_floor,
      tier: tierInfo.tier,
      tierName: tierInfo.name,
      difficulty: tierInfo.difficulty,
      category: getFloorCategory(progress.current_floor),
      totalFloors: TIER_3_MAX,
      totalCategories: TOTAL_CATEGORIES,
      perfectFloors: progress.perfect_floors?.length || 0,
      totalQuestions: progress.total_questions,
      totalCorrect: progress.total_correct,
      accuracy: Math.round(accuracy * 10) / 10,
      achievements: progress.achievements || [],
      hasStarted: progress.highest_floor > 1 || progress.total_questions > 0,
      floorStats, // Best scores and attempts per floor
    });
  } catch (error) {
    console.error("Tower progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tower progress" },
      { status: 500 }
    );
  }
}
