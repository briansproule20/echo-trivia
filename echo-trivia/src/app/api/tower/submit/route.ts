// Submit tower floor results and unlock next floor if passed

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { CATEGORIES } from "@/lib/types";
import { z } from "zod";

// Constants
const TOTAL_CATEGORIES = CATEGORIES.length;
const QUESTIONS_PER_FLOOR = 5;
const PASSING_SCORE = 3; // 3/5 to pass
const BOSS_INTERVAL = 10; // Mini-boss every 10 regular floors

// Request body schema
const TowerSubmitRequestSchema = z.object({
  floorNumber: z.number().min(1),
  quizId: z.string(),
  answers: z.array(z.object({
    question_id: z.string(),
    user_answer: z.string(),
  })),
  // Full questions data for results display
  questions: z.array(z.object({
    id: z.string(),
    prompt: z.string(),
    choices: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })).optional(),
  })).optional(),
  timeTaken: z.number().optional(), // seconds
  echo_user_id: z.string(),
});

// Get answer keys from server
async function getAnswerKeys(quizId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("quiz_answer_keys")
    .select("answers")
    .eq("quiz_id", quizId)
    .single();

  if (error || !data) {
    console.error("Failed to get answer keys:", error);
    return null;
  }

  return data.answers as Array<{
    question_id: string;
    answer: string;
    type: string;
    explanation: string;
  }>;
}

// Helper to check if a floor is a mini-boss
function isMiniBossFloor(floorNumber: number): boolean {
  if (floorNumber <= 0) return false;
  const blockSize = BOSS_INTERVAL + 1;
  const positionInBlock = floorNumber % blockSize;
  return positionInBlock === 0;
}

// Get data for a regular (non-boss) floor
function getRegularFloorData(floorNumber: number): { category: string; difficulty: "easy" | "medium" | "hard" } | null {
  if (isMiniBossFloor(floorNumber)) return null;

  // Count regular floors up to this point
  let regularCount = 0;
  for (let i = 1; i <= floorNumber; i++) {
    if (!isMiniBossFloor(i)) regularCount++;
  }

  let difficulty: "easy" | "medium" | "hard";
  if (regularCount <= TOTAL_CATEGORIES) {
    difficulty = "easy";
  } else if (regularCount <= TOTAL_CATEGORIES * 2) {
    difficulty = "medium";
  } else {
    difficulty = "hard";
  }

  const categoryIndex = (regularCount - 1) % TOTAL_CATEGORIES;
  const category = CATEGORIES[categoryIndex];

  return { category, difficulty };
}

// Get the categories covered by a mini-boss floor
function getMiniBossCategories(floorNumber: number): string[] {
  const categories: string[] = [];
  let regularFloorCount = 0;
  let checkFloor = floorNumber - 1;

  while (regularFloorCount < BOSS_INTERVAL && checkFloor > 0) {
    if (!isMiniBossFloor(checkFloor)) {
      const floorData = getRegularFloorData(checkFloor);
      if (floorData) {
        categories.unshift(floorData.category);
      }
      regularFloorCount++;
    }
    checkFloor--;
  }

  return categories;
}

// Get floor data from floor number
function getFloorData(floorNumber: number) {
  const isMiniBoss = isMiniBossFloor(floorNumber);

  if (isMiniBoss) {
    // Mini-boss floor - get categories from prior 10 floors
    const bossCategories = getMiniBossCategories(floorNumber);

    // Determine tier based on where we are in the tower
    let regularCount = 0;
    for (let i = 1; i < floorNumber; i++) {
      if (!isMiniBossFloor(i)) regularCount++;
    }

    let baseDifficulty: "easy" | "medium" | "hard";
    if (regularCount <= TOTAL_CATEGORIES) {
      baseDifficulty = "easy";
    } else if (regularCount <= TOTAL_CATEGORIES * 2) {
      baseDifficulty = "medium";
    } else {
      baseDifficulty = "hard";
    }

    // Boss difficulty is one level harder
    const bossDifficulty: "medium" | "hard" = baseDifficulty === "easy" ? "medium" : "hard";

    return {
      difficulty: bossDifficulty,
      category: "Guardian's Challenge",
      isMiniBoss: true,
      bossCategories,
    };
  }

  // Regular floor
  const regularData = getRegularFloorData(floorNumber);
  if (!regularData) {
    throw new Error(`Invalid floor number: ${floorNumber}`);
  }

  return {
    difficulty: regularData.difficulty,
    category: regularData.category,
    isMiniBoss: false,
    bossCategories: undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parsed = TowerSubmitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { floorNumber, quizId, answers, questions: submittedQuestions, timeTaken, echo_user_id: echoUserId } = parsed.data;

    if (!echoUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get answer keys from server
    const answerKeys = await getAnswerKeys(quizId);
    if (!answerKeys) {
      return NextResponse.json(
        { error: "Quiz not found or expired" },
        { status: 404 }
      );
    }

    // Score the answers server-side
    const answerKeyMap = new Map(answerKeys.map(ak => [ak.question_id, ak]));
    const questionMap = new Map(submittedQuestions?.map(q => [q.id, q]) || []);
    let correctCount = 0;
    const results = answers.map(answer => {
      const key = answerKeyMap.get(answer.question_id);
      const question = questionMap.get(answer.question_id);
      const isCorrect = key?.answer === answer.user_answer;
      if (isCorrect) correctCount++;
      return {
        question_id: answer.question_id,
        prompt: question?.prompt || "",
        choices: question?.choices || [],
        user_answer: answer.user_answer,
        correct_answer: key?.answer || "",
        is_correct: isCorrect,
        explanation: key?.explanation || "",
      };
    });

    const passed = correctCount >= PASSING_SCORE;
    const isPerfect = correctCount === QUESTIONS_PER_FLOOR;
    const floorData = getFloorData(floorNumber);

    // Get current progress
    const serviceClient = createServiceClient();
    const { data: progress, error: progressError } = await serviceClient
      .from("tower_progress")
      .select("*")
      .eq("echo_user_id", echoUserId)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      console.error("Failed to get progress:", progressError);
      return NextResponse.json({ error: "Failed to get progress" }, { status: 500 });
    }

    // Calculate new progress values
    const currentHighestFloor = progress?.highest_floor || 1;
    const newHighestFloor = passed && floorNumber >= currentHighestFloor
      ? floorNumber + 1
      : currentHighestFloor;

    const newCurrentFloor = passed ? floorNumber + 1 : floorNumber;
    const newTotalQuestions = (progress?.total_questions || 0) + QUESTIONS_PER_FLOOR;
    const newTotalCorrect = (progress?.total_correct || 0) + correctCount;

    // Track perfect floors
    const perfectFloors = progress?.perfect_floors || [];
    if (isPerfect && !perfectFloors.includes(floorNumber)) {
      perfectFloors.push(floorNumber);
    }

    // Update floor attempts tracking
    const floorAttempts = progress?.floor_attempts || {};
    floorAttempts[floorNumber] = (floorAttempts[floorNumber] || 0) + 1;

    // Update category stats
    const categoryStats = progress?.category_stats || {};
    if (floorData.isMiniBoss && floorData.bossCategories) {
      // Mini-boss: distribute stats across all covered categories
      const questionsPerCategory = Math.floor(QUESTIONS_PER_FLOOR / floorData.bossCategories.length);
      const correctPerCategory = Math.floor(correctCount / floorData.bossCategories.length);
      for (const cat of floorData.bossCategories) {
        if (!categoryStats[cat]) {
          categoryStats[cat] = { attempts: 0, correct: 0, perfect: 0 };
        }
        categoryStats[cat].attempts += questionsPerCategory;
        categoryStats[cat].correct += correctPerCategory;
        // Don't count perfect for boss floors on individual categories
      }
    } else {
      // Regular floor: single category
      if (!categoryStats[floorData.category]) {
        categoryStats[floorData.category] = { attempts: 0, correct: 0, perfect: 0 };
      }
      categoryStats[floorData.category].attempts += QUESTIONS_PER_FLOOR;
      categoryStats[floorData.category].correct += correctCount;
      if (isPerfect) categoryStats[floorData.category].perfect += 1;
    }

    // Upsert progress
    const { error: updateError } = await serviceClient
      .from("tower_progress")
      .upsert({
        echo_user_id: echoUserId,
        current_floor: newCurrentFloor,
        highest_floor: newHighestFloor,
        floor_attempts: floorAttempts,
        total_questions: newTotalQuestions,
        total_correct: newTotalCorrect,
        perfect_floors: perfectFloors,
        category_stats: categoryStats,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "echo_user_id",
      });

    if (updateError) {
      console.error("Failed to update progress:", updateError);
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }

    // Record the floor attempt
    const { data: attemptData } = await serviceClient
      .from("tower_floor_attempts")
      .insert({
        echo_user_id: echoUserId,
        floor_number: floorNumber,
        category: floorData.category,
        difficulty: floorData.difficulty,
        score: correctCount,
        questions: results,
        passed,
        attempt_duration: timeTaken || null,
        quiz_id: quizId,
      })
      .select("id")
      .single();

    // Also record as quiz_session for Wizard's Legion tracking (community lore tier + lifetime achievements)
    // Include tower_attempt_id for linking to results from history
    await serviceClient
      .from("quiz_sessions")
      .insert({
        echo_user_id: echoUserId,
        category: floorData.category,
        num_questions: QUESTIONS_PER_FLOOR,
        correct_answers: correctCount,
        total_questions: QUESTIONS_PER_FLOOR,
        score_percentage: (correctCount / QUESTIONS_PER_FLOOR) * 100,
        difficulty: floorData.difficulty,
        quiz_type: "tower",
        game_mode: "campaign",
        is_daily: false,
        time_taken: timeTaken || null,
        title: `Tower Floor ${floorNumber} - ${floorData.category}`,
        tower_attempt_id: attemptData?.id,
      });

    // Fetch best score and attempt count for this floor
    const { data: floorHistory } = await serviceClient
      .from("tower_floor_attempts")
      .select("score")
      .eq("echo_user_id", echoUserId)
      .eq("floor_number", floorNumber);

    const attemptCount = floorHistory?.length || 1;
    const bestScore = floorHistory?.reduce((max, a) => Math.max(max, a.score), 0) || correctCount;

    // Check and award achievements
    const earnedAchievements: string[] = [];

    // Helper to award achievement if not already earned
    const awardAchievement = async (achievementId: string) => {
      const { error } = await serviceClient
        .from("user_tower_achievements")
        .upsert({
          echo_user_id: echoUserId,
          achievement_id: achievementId,
          floor_earned: floorNumber,
        }, { onConflict: "echo_user_id,achievement_id" });

      if (!error) {
        earnedAchievements.push(achievementId);
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // MILESTONE ACHIEVEMENTS (7)
    // ═══════════════════════════════════════════════════════════════

    // First Steps - Complete Floor 1
    if (passed && floorNumber === 1) {
      await awardAchievement("first_steps");
    }

    // Milestone achievements based on highest floor reached
    if (passed) {
      if (newHighestFloor >= 25) await awardAchievement("apprentice");
      if (newHighestFloor >= 100) await awardAchievement("scholar");
      if (newHighestFloor >= 300) await awardAchievement("archivist");
      if (newHighestFloor >= 600) await awardAchievement("signal_bearer");
      if (newHighestFloor >= 900) await awardAchievement("tower_master");
      if (newHighestFloor >= 1008) await awardAchievement("wizards_chosen");
    }

    // ═══════════════════════════════════════════════════════════════
    // PERFORMANCE ACHIEVEMENTS (6)
    // ═══════════════════════════════════════════════════════════════

    // Perfect Signal - Score 5/5 on any floor
    if (isPerfect) {
      await awardAchievement("perfect_signal");
    }

    // Clarity - Score 5/5 on 10 different floors
    if (isPerfect && perfectFloors.length >= 10) {
      await awardAchievement("clarity");
    }

    // Precision - Score 5/5 on 50 different floors
    if (isPerfect && perfectFloors.length >= 50) {
      await awardAchievement("precision");
    }

    // Calibrator - 5/5 on 5 consecutive floors
    if (isPerfect && perfectFloors.length >= 5) {
      const sortedPerfect = [...perfectFloors].sort((a, b) => a - b);
      for (let i = 0; i <= sortedPerfect.length - 5; i++) {
        if (sortedPerfect[i + 4] - sortedPerfect[i] === 4) {
          await awardAchievement("calibrator");
          break;
        }
      }
    }

    // Streak Keeper & Unshakeable - Pass X floors without failing
    if (passed) {
      // Get recent attempts ordered by time to check streak
      const { data: recentAttempts } = await serviceClient
        .from("tower_floor_attempts")
        .select("passed, floor_number")
        .eq("echo_user_id", echoUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (recentAttempts) {
        let currentStreak = 0;
        for (const attempt of recentAttempts) {
          if (attempt.passed) {
            currentStreak++;
          } else {
            break;
          }
        }
        if (currentStreak >= 25) await awardAchievement("streak_keeper");
        if (currentStreak >= 50) await awardAchievement("unshakeable");
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CATEGORY MASTERY ACHIEVEMENTS (5)
    // ═══════════════════════════════════════════════════════════════

    if (isPerfect) {
      // Get all perfect floors with their categories and difficulties
      const { data: perfectAttempts } = await serviceClient
        .from("tower_floor_attempts")
        .select("category, difficulty")
        .eq("echo_user_id", echoUserId)
        .eq("score", 5);

      if (perfectAttempts) {
        // Track perfect scores by category
        const categoryPerfects: Record<string, Set<string>> = {};
        const perfectCategories = new Set<string>();

        for (const attempt of perfectAttempts) {
          if (!categoryPerfects[attempt.category]) {
            categoryPerfects[attempt.category] = new Set();
          }
          categoryPerfects[attempt.category].add(attempt.difficulty);
          perfectCategories.add(attempt.category);
        }

        // Specialist - 5/5 on same category at all 3 difficulties
        let specialistCount = 0;
        for (const [, difficulties] of Object.entries(categoryPerfects)) {
          if (difficulties.has("easy") && difficulties.has("medium") && difficulties.has("hard")) {
            specialistCount++;
            if (specialistCount === 1) await awardAchievement("specialist");
          }
        }

        // Triple Crown - Specialist in 3 categories
        if (specialistCount >= 3) await awardAchievement("triple_crown");

        // Polymath - 5/5 on 25 different categories
        if (perfectCategories.size >= 25) await awardAchievement("polymath");

        // Renaissance Mind - 5/5 on 50 different categories
        if (perfectCategories.size >= 50) await awardAchievement("renaissance");

        // Universal Maintainer - 5/5 on 100 different categories
        if (perfectCategories.size >= 100) await awardAchievement("universal");
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SPECIAL CONDITION ACHIEVEMENTS (5)
    // ═══════════════════════════════════════════════════════════════

    // Night Owl - Complete a floor between 12am-4am local time
    // Note: Using server time, ideally would use client timezone
    const hour = new Date().getHours();
    if (passed && hour >= 0 && hour < 4) {
      await awardAchievement("night_owl");
    }

    // Marathon - Complete 10 floors in one session (within 2 hours)
    if (passed) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { count: sessionCount } = await serviceClient
        .from("tower_floor_attempts")
        .select("*", { count: "exact", head: true })
        .eq("echo_user_id", echoUserId)
        .eq("passed", true)
        .gte("created_at", twoHoursAgo);

      if ((sessionCount || 0) >= 10) await awardAchievement("marathon");
    }

    // Sprint - Complete 10 floors in under 15 minutes
    if (passed) {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count: sprintCount } = await serviceClient
        .from("tower_floor_attempts")
        .select("*", { count: "exact", head: true })
        .eq("echo_user_id", echoUserId)
        .eq("passed", true)
        .gte("created_at", fifteenMinsAgo);

      if ((sprintCount || 0) >= 10) await awardAchievement("sprint");
    }

    // Persistence - Pass a floor after 5+ failed attempts
    if (passed && attemptCount >= 6) {
      await awardAchievement("persistence");
    }

    // Clutch - Pass 10 floors with exactly 3/5
    if (passed && correctCount === 3) {
      const { count } = await serviceClient
        .from("tower_floor_attempts")
        .select("*", { count: "exact", head: true })
        .eq("echo_user_id", echoUserId)
        .eq("passed", true)
        .eq("score", 3);

      if ((count || 0) >= 10) await awardAchievement("clutch");
    }

    // ═══════════════════════════════════════════════════════════════
    // LIFETIME ACHIEVEMENTS (2) - Based on total correct across all modes
    // ═══════════════════════════════════════════════════════════════

    // Get total correct answers across all quiz sessions
    const { data: totalStats } = await serviceClient
      .from("quiz_sessions")
      .select("correct_answers")
      .eq("echo_user_id", echoUserId);

    if (totalStats) {
      const totalCorrect = totalStats.reduce((sum, s) => sum + (s.correct_answers || 0), 0);

      // Pattern Seeker - 1000 correct answers
      if (totalCorrect >= 1000) await awardAchievement("pattern_seeker");

      // Fog Dispeller - 5000 correct answers
      if (totalCorrect >= 5000) await awardAchievement("fog_dispeller");
    }

    return NextResponse.json({
      passed,
      score: correctCount,
      totalQuestions: QUESTIONS_PER_FLOOR,
      isPerfect,
      results,
      bestScore, // Best score for this floor
      attemptCount, // Total attempts on this floor
      attemptId: attemptData?.id, // For linking to results page
      floorNumber,
      category: floorData.category,
      difficulty: floorData.difficulty,
      isMiniBoss: floorData.isMiniBoss,
      progress: {
        currentFloor: newCurrentFloor,
        highestFloor: newHighestFloor,
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        perfectFloors: perfectFloors.length,
      },
      nextFloorUnlocked: passed && floorNumber >= currentHighestFloor,
      earnedAchievements, // New achievements earned this submission
    });
  } catch (error) {
    console.error("Tower submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit floor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
