// Survival Mode Leaderboard
// Returns top streaks for mixed mode or per-category

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import type { SurvivalLeaderboardResponse, SurvivalLeaderboardEntry } from "@/lib/supabase-types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("mode") || "mixed";
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const echoUserId = searchParams.get("echo_user_id");

    const supabase = createServiceClient();

    // Build query for best runs per user
    // We want each user's best streak, not all runs
    let query = supabase
      .from("survival_runs")
      .select(`
        echo_user_id,
        streak,
        ended_at,
        users(username, avatar_url, avatar_id)
      `)
      .order("streak", { ascending: false });

    if (mode === "mixed") {
      query = query.eq("mode", "mixed");
    } else if (mode === "category" && category) {
      query = query.eq("mode", "category").eq("category", category);
    } else {
      return NextResponse.json(
        { error: "Category required for category mode" },
        { status: 400 }
      );
    }

    const { data: allRuns, error } = await query;

    if (error) {
      console.error("Leaderboard query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    console.log("Raw runs from DB:", allRuns?.length, "runs");

    // Group by user and take their best streak
    const userBests = new Map<string, {
      echo_user_id: string;
      streak: number;
      ended_at: string;
      username: string | null;
      avatar_url: string | null;
      avatar_id: string | null;
    }>();

    for (const run of allRuns || []) {
      const existing = userBests.get(run.echo_user_id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = run.users as any;

      if (!existing || run.streak > existing.streak) {
        userBests.set(run.echo_user_id, {
          echo_user_id: run.echo_user_id,
          streak: run.streak,
          ended_at: run.ended_at,
          username: user?.username || null,
          avatar_url: user?.avatar_url || null,
          avatar_id: user?.avatar_id || null,
        });
      }
    }

    console.log("After grouping:", userBests.size, "unique users");

    // Sort by streak descending and assign ranks
    const sortedEntries = Array.from(userBests.values())
      .sort((a, b) => b.streak - a.streak);

    const leaderboard: SurvivalLeaderboardEntry[] = sortedEntries
      .slice(0, limit)
      .map((entry, index) => ({
        echo_user_id: entry.echo_user_id,
        username: entry.username,
        avatar_url: entry.avatar_url,
        avatar_id: entry.avatar_id,
        streak: entry.streak,
        rank: index + 1,
        ended_at: entry.ended_at,
      }));

    // Find user's position if they're not in top N
    let userPosition: SurvivalLeaderboardResponse["userPosition"];
    if (echoUserId) {
      const userEntry = sortedEntries.find(e => e.echo_user_id === echoUserId);
      if (userEntry) {
        const userRank = sortedEntries.findIndex(e => e.echo_user_id === echoUserId) + 1;
        userPosition = {
          streak: userEntry.streak,
          rank: userRank,
        };
      }
    }

    const response: SurvivalLeaderboardResponse = {
      leaderboard,
      userPosition,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Survival leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
