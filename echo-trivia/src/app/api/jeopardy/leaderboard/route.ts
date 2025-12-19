// Jeopardy Mode Leaderboard
// Returns top scores for 3-category and 5-category boards

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export const dynamic = "force-dynamic";

interface LeaderboardEntry {
  echo_user_id: string;
  username: string | null;
  avatar_url: string | null;
  score: number;
  questions_correct: number;
  questions_answered: number;
  categories: string[];
  ended_at: string;
  rank: number;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const boardSize = parseInt(searchParams.get("board_size") || "5") as 3 | 5;
    const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 100);
    const echoUserId = searchParams.get("echo_user_id");

    const supabase = createServiceClient();

    // Get completed games for this board size, ordered by score
    const { data: games, error: gamesError } = await supabase
      .from("jeopardy_games")
      .select(`
        id,
        echo_user_id,
        score,
        questions_correct,
        questions_answered,
        categories,
        ended_at
      `)
      .eq("board_size", boardSize)
      .eq("completed", true)
      .order("score", { ascending: false })
      .limit(limit * 2); // Fetch more to handle user deduplication

    if (gamesError) {
      console.error("Failed to fetch leaderboard:", gamesError);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    // Get unique echo_user_ids to fetch user info
    const uniqueUserIds = [...new Set(games?.map(g => g.echo_user_id) || [])];

    // Fetch user info
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("echo_user_id, username, avatar_url")
      .in("echo_user_id", uniqueUserIds);

    if (usersError) {
      console.error("Failed to fetch users:", usersError);
    }

    const userMap = new Map(users?.map(u => [u.echo_user_id, u]) || []);

    // Build leaderboard with best score per user
    const bestScoreByUser = new Map<string, typeof games[0]>();
    for (const game of games || []) {
      const existing = bestScoreByUser.get(game.echo_user_id);
      if (!existing || game.score > existing.score) {
        bestScoreByUser.set(game.echo_user_id, game);
      }
    }

    // Sort by score and assign ranks
    const sortedEntries = Array.from(bestScoreByUser.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const leaderboard: LeaderboardEntry[] = sortedEntries.map((game, index) => {
      const user = userMap.get(game.echo_user_id);
      return {
        echo_user_id: game.echo_user_id,
        username: user?.username || null,
        avatar_url: user?.avatar_url || null,
        score: game.score,
        questions_correct: game.questions_correct,
        questions_answered: game.questions_answered,
        categories: game.categories,
        ended_at: game.ended_at,
        rank: index + 1,
      };
    });

    // Get user's position if they're not in top results
    let userPosition: LeaderboardEntry | null = null;
    if (echoUserId) {
      const userInLeaderboard = leaderboard.find(e => e.echo_user_id === echoUserId);
      if (!userInLeaderboard) {
        // Find user's best game
        const { data: userGame } = await supabase
          .from("jeopardy_games")
          .select("*")
          .eq("echo_user_id", echoUserId)
          .eq("board_size", boardSize)
          .eq("completed", true)
          .order("score", { ascending: false })
          .limit(1)
          .single();

        if (userGame) {
          // Get their rank
          const { count } = await supabase
            .from("jeopardy_games")
            .select("*", { count: "exact", head: true })
            .eq("board_size", boardSize)
            .eq("completed", true)
            .gt("score", userGame.score);

          const user = userMap.get(echoUserId);
          userPosition = {
            echo_user_id: echoUserId,
            username: user?.username || null,
            avatar_url: user?.avatar_url || null,
            score: userGame.score,
            questions_correct: userGame.questions_correct,
            questions_answered: userGame.questions_answered,
            categories: userGame.categories,
            ended_at: userGame.ended_at,
            rank: (count || 0) + 1,
          };
        }
      } else {
        userPosition = userInLeaderboard;
      }
    }

    return NextResponse.json({
      leaderboard,
      userPosition,
      boardSize,
    });

  } catch (error) {
    console.error("Jeopardy leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
