// Jeopardy Mode - End game early
// Saves current score to DB and cleans up

import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";
import { getActiveGame, deleteActiveGame } from "@/lib/jeopardy-state";
import type { JeopardyQuestionAttempt } from "@/lib/supabase-types";

const RequestSchema = z.object({
  game_id: z.string(),
  echo_user_id: z.string(),
});

// Save completed game to database
async function saveGame(
  gameId: string,
  echoUserId: string,
  boardSize: 3 | 5,
  categories: string[],
  score: number,
  questionsAnswered: number,
  questionsCorrect: number,
  boardState: Record<string, boolean>,
  questionsAttempted: JeopardyQuestionAttempt[],
  timePlayed: number
): Promise<{ rank: number | null; isPersonalBest: boolean }> {
  const supabase = createServiceClient();

  // Get user_id from echo_user_id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("echo_user_id", echoUserId)
    .single();

  // Save to jeopardy_games
  const { error: gameError } = await supabase
    .from("jeopardy_games")
    .insert({
      id: gameId,
      user_id: userData?.id || null,
      echo_user_id: echoUserId,
      board_size: boardSize,
      categories,
      score,
      questions_answered: questionsAnswered,
      questions_correct: questionsCorrect,
      board_state: boardState,
      questions_attempted: questionsAttempted,
      time_played_seconds: Math.floor(timePlayed / 1000),
      completed: true,
      ended_at: new Date().toISOString(),
    });

  if (gameError) {
    console.error("Failed to save jeopardy game:", gameError);
    throw new Error(`Failed to save jeopardy game: ${gameError.message}`);
  }

  // Calculate rank (how many have higher scores with same board size)
  const { count } = await supabase
    .from("jeopardy_games")
    .select("*", { count: "exact", head: true })
    .eq("board_size", boardSize)
    .eq("completed", true)
    .gt("score", score);

  const rank = count !== null ? count + 1 : null;

  // Check if personal best for this board size
  const { data: bestData } = await supabase
    .from("jeopardy_games")
    .select("score")
    .eq("echo_user_id", echoUserId)
    .eq("board_size", boardSize)
    .eq("completed", true)
    .neq("id", gameId)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  const isPersonalBest = !bestData || score > bestData.score;

  return { rank, isPersonalBest };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { game_id, echo_user_id } = RequestSchema.parse(body);

    // Get game state
    const gameState = getActiveGame(game_id);
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

    // Save the game
    const timePlayed = Date.now() - gameState.start_time;
    const questionsCorrect = gameState.questions_attempted.filter(q => q.is_correct).length;

    const { rank, isPersonalBest } = await saveGame(
      game_id,
      echo_user_id,
      gameState.board_size,
      gameState.categories,
      gameState.score,
      gameState.questions_attempted.length,
      questionsCorrect,
      gameState.board_state,
      gameState.questions_attempted,
      timePlayed
    );

    // Clean up active game
    deleteActiveGame(game_id);

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
