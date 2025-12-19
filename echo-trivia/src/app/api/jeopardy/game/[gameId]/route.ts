// Jeopardy Mode - Get game details
// Returns completed game info for results page

import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const supabase = createServiceClient();

    // Fetch game from database
    const { data: game, error } = await supabase
      .from("jeopardy_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error || !game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Calculate rank
    const { count } = await supabase
      .from("jeopardy_games")
      .select("*", { count: "exact", head: true })
      .eq("board_size", game.board_size)
      .eq("completed", true)
      .gt("score", game.score);

    const rank = count !== null ? count + 1 : null;

    return NextResponse.json({
      game: {
        id: game.id,
        echo_user_id: game.echo_user_id,
        board_size: game.board_size,
        categories: game.categories,
        score: game.score,
        questions_answered: game.questions_answered,
        questions_correct: game.questions_correct,
        board_state: game.board_state,
        questions_attempted: game.questions_attempted,
        time_played_seconds: game.time_played_seconds,
        completed: game.completed,
        ended_at: game.ended_at,
        created_at: game.created_at,
      },
      rank,
    });

  } catch (error) {
    console.error("Jeopardy game fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
