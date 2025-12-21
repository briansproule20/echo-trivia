// Jeopardy Mode - End game early
// Saves current score to DB and cleans up

import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";
import { getActiveGame, completeGame } from "@/lib/jeopardy-state";

const RequestSchema = z.object({
  game_id: z.string(),
  echo_user_id: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { game_id, echo_user_id } = RequestSchema.parse(body);

    // Get game state from database
    const gameState = await getActiveGame(game_id);
    if (!gameState) {
      return NextResponse.json(
        { error: "Game not found or expired" },
        { status: 404 }
      );
    }

    // Verify user owns this game
    if (gameState.echo_user_id !== echo_user_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Complete the game
    const timePlayed = Date.now() - gameState.start_time;
    const questionsCorrect = gameState.questions_attempted.filter(q => q.is_correct).length;

    const { rank, isPersonalBest } = await completeGame(
      game_id,
      gameState.score,
      gameState.questions_attempted.length,
      questionsCorrect,
      gameState.board_state,
      gameState.questions_attempted,
      Math.floor(timePlayed / 1000)
    );

    // Clean up answer keys
    const supabase = createServiceClient();
    await supabase
      .from("quiz_answer_keys")
      .delete()
      .eq("quiz_id", game_id);

    return NextResponse.json({
      success: true,
      final_stats: {
        score: gameState.score,
        questions_answered: gameState.questions_attempted.length,
        questions_correct: questionsCorrect,
        categories: gameState.categories,
        rank,
        time_played: Math.floor(timePlayed / 1000),
        is_personal_best: isPersonalBest,
        board_size: gameState.board_size,
      },
    });

  } catch (error) {
    console.error("Jeopardy end error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to end game", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
