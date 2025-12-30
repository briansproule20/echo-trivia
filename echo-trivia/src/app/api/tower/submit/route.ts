// Submit tower floor results and unlock next floor if passed

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { CATEGORIES } from "@/lib/types";
import { z } from "zod";

// Constants
const TOTAL_CATEGORIES = CATEGORIES.length;
const QUESTIONS_PER_FLOOR = 5;
const PASSING_SCORE = 3; // 3/5 to pass

// Request body schema
const TowerSubmitRequestSchema = z.object({
  floorNumber: z.number().min(1),
  quizId: z.string(),
  answers: z.array(z.object({
    question_id: z.string(),
    user_answer: z.string(),
  })),
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

// Get floor data from floor number
function getFloorData(floorNumber: number) {
  const TIER_1_MAX = TOTAL_CATEGORIES;
  const TIER_2_MAX = TOTAL_CATEGORIES * 2;

  let difficulty: "easy" | "medium" | "hard";
  if (floorNumber <= TIER_1_MAX) {
    difficulty = "easy";
  } else if (floorNumber <= TIER_2_MAX) {
    difficulty = "medium";
  } else {
    difficulty = "hard";
  }

  const categoryIndex = (floorNumber - 1) % TOTAL_CATEGORIES;
  const category = CATEGORIES[categoryIndex];

  return { difficulty, category };
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

    const { floorNumber, quizId, answers, timeTaken, echo_user_id: echoUserId } = parsed.data;

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
    let correctCount = 0;
    const results = answers.map(answer => {
      const key = answerKeyMap.get(answer.question_id);
      const isCorrect = key?.answer === answer.user_answer;
      if (isCorrect) correctCount++;
      return {
        question_id: answer.question_id,
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
    if (!categoryStats[floorData.category]) {
      categoryStats[floorData.category] = { attempts: 0, correct: 0, perfect: 0 };
    }
    categoryStats[floorData.category].attempts += QUESTIONS_PER_FLOOR;
    categoryStats[floorData.category].correct += correctCount;
    if (isPerfect) categoryStats[floorData.category].perfect += 1;

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
    await serviceClient
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
      });

    // Also record as quiz_session for Wizard's Legion tracking (community lore tier + lifetime achievements)
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
      });

    // Fetch best score and attempt count for this floor
    const { data: floorHistory } = await serviceClient
      .from("tower_floor_attempts")
      .select("score")
      .eq("echo_user_id", echoUserId)
      .eq("floor_number", floorNumber);

    const attemptCount = floorHistory?.length || 1;
    const bestScore = floorHistory?.reduce((max, a) => Math.max(max, a.score), 0) || correctCount;

    return NextResponse.json({
      passed,
      score: correctCount,
      totalQuestions: QUESTIONS_PER_FLOOR,
      isPerfect,
      results,
      bestScore, // Best score for this floor
      attemptCount, // Total attempts on this floor
      progress: {
        currentFloor: newCurrentFloor,
        highestFloor: newHighestFloor,
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        perfectFloors: perfectFloors.length,
      },
      nextFloorUnlocked: passed && floorNumber >= currentHighestFloor,
    });
  } catch (error) {
    console.error("Tower submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit floor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
