// Jeopardy Mode User Stats
// Returns user's jeopardy mode statistics

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export const dynamic = "force-dynamic";

export interface JeopardyStats {
  best_score_3: number | null;
  best_score_5: number | null;
  rank_3: number | null;
  rank_5: number | null;
  total_games: number;
  total_questions_answered: number;
  total_questions_correct: number;
  total_time_played: number;
  recent_games: Array<{
    id: string;
    board_size: 3 | 5;
    score: number;
    questions_correct: number;
    questions_answered: number;
    ended_at: string;
  }>;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const echoUserId = searchParams.get("echo_user_id");

    if (!echoUserId) {
      return NextResponse.json(
        { error: "echo_user_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get all completed games for this user
    const { data: userGames, error: gamesError } = await supabase
      .from("jeopardy_games")
      .select("*")
      .eq("echo_user_id", echoUserId)
      .eq("completed", true)
      .order("ended_at", { ascending: false });

    if (gamesError) {
      console.error("Failed to fetch user games:", gamesError);
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    const games = userGames || [];

    // Calculate best scores for 3 and 5 category boards
    const games3 = games.filter(g => g.board_size === 3);
    const games5 = games.filter(g => g.board_size === 5);

    const bestScore3 = games3.length > 0
      ? Math.max(...games3.map(g => g.score))
      : null;

    const bestScore5 = games5.length > 0
      ? Math.max(...games5.map(g => g.score))
      : null;

    // Calculate ranks
    let rank3: number | null = null;
    if (bestScore3 !== null) {
      const { count } = await supabase
        .from("jeopardy_games")
        .select("*", { count: "exact", head: true })
        .eq("board_size", 3)
        .eq("completed", true)
        .gt("score", bestScore3);
      rank3 = count !== null ? count + 1 : null;
    }

    let rank5: number | null = null;
    if (bestScore5 !== null) {
      const { count } = await supabase
        .from("jeopardy_games")
        .select("*", { count: "exact", head: true })
        .eq("board_size", 5)
        .eq("completed", true)
        .gt("score", bestScore5);
      rank5 = count !== null ? count + 1 : null;
    }

    // Calculate totals
    const totalGames = games.length;
    const totalQuestionsAnswered = games.reduce((sum, g) => sum + (g.questions_answered || 0), 0);
    const totalQuestionsCorrect = games.reduce((sum, g) => sum + (g.questions_correct || 0), 0);
    const totalTimePlayed = games.reduce((sum, g) => sum + (g.time_played_seconds || 0), 0);

    // Get recent games (last 10)
    const recentGames = games.slice(0, 10).map(g => ({
      id: g.id,
      board_size: g.board_size as 3 | 5,
      score: g.score,
      questions_correct: g.questions_correct,
      questions_answered: g.questions_answered,
      ended_at: g.ended_at,
    }));

    const stats: JeopardyStats = {
      best_score_3: bestScore3,
      best_score_5: bestScore5,
      rank_3: rank3,
      rank_5: rank5,
      total_games: totalGames,
      total_questions_answered: totalQuestionsAnswered,
      total_questions_correct: totalQuestionsCorrect,
      total_time_played: totalTimePlayed,
      recent_games: recentGames,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Jeopardy stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
