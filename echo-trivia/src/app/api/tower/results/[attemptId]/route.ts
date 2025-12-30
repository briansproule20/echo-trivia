// Fetch tower floor attempt results by ID

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const echoUserId = searchParams.get("echo_user_id");

    if (!echoUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Fetch the floor attempt
    const { data: attempt, error } = await supabase
      .from("tower_floor_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("echo_user_id", echoUserId)
      .single();

    if (error || !attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    // Get tier info
    const TOTAL_CATEGORIES = 336;
    const TIER_1_MAX = TOTAL_CATEGORIES;
    const TIER_2_MAX = TOTAL_CATEGORIES * 2;

    let tier: number;
    let tierName: string;
    if (attempt.floor_number <= TIER_1_MAX) {
      tier = 1;
      tierName = "The Lower Archives";
    } else if (attempt.floor_number <= TIER_2_MAX) {
      tier = 2;
      tierName = "The Middle Stacks";
    } else {
      tier = 3;
      tierName = "The Upper Sanctum";
    }

    return NextResponse.json({
      id: attempt.id,
      floorNumber: attempt.floor_number,
      category: attempt.category,
      difficulty: attempt.difficulty,
      score: attempt.score,
      passed: attempt.passed,
      questions: attempt.questions,
      timeTaken: attempt.attempt_duration,
      completedAt: attempt.created_at,
      tier,
      tierName,
    });
  } catch (error) {
    console.error("Tower results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
