// Survival Mode User Stats
// Returns user's survival mode statistics

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import type { SurvivalStats } from "@/lib/supabase-types";

export const dynamic = "force-dynamic";

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

    // Get all runs for this user
    const { data: userRuns, error: runsError } = await supabase
      .from("survival_runs")
      .select("*")
      .eq("echo_user_id", echoUserId)
      .order("ended_at", { ascending: false });

    if (runsError) {
      console.error("Failed to fetch user runs:", runsError);
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    const runs = userRuns || [];

    // Calculate mixed mode best
    const mixedRuns = runs.filter(r => r.mode === "mixed");
    const mixedBestStreak = mixedRuns.length > 0
      ? Math.max(...mixedRuns.map(r => r.streak))
      : 0;

    // Calculate mixed mode rank
    let mixedRank: number | null = null;
    if (mixedBestStreak > 0) {
      const { count } = await supabase
        .from("survival_runs")
        .select("*", { count: "exact", head: true })
        .eq("mode", "mixed")
        .gt("streak", mixedBestStreak);
      mixedRank = count !== null ? count + 1 : null;
    }

    // Calculate category bests
    const categoryRuns = runs.filter(r => r.mode === "category" && r.category);
    const categoryBestsMap = new Map<string, number>();

    for (const run of categoryRuns) {
      const current = categoryBestsMap.get(run.category!) || 0;
      if (run.streak > current) {
        categoryBestsMap.set(run.category!, run.streak);
      }
    }

    // Get ranks for each category best
    const categoryBests: SurvivalStats["category_bests"] = [];
    for (const [category, streak] of categoryBestsMap) {
      let rank: number | null = null;
      if (streak > 0) {
        const { count } = await supabase
          .from("survival_runs")
          .select("*", { count: "exact", head: true })
          .eq("mode", "category")
          .eq("category", category)
          .gt("streak", streak);
        rank = count !== null ? count + 1 : null;
      }
      categoryBests.push({ category, streak, rank });
    }

    // Sort category bests by streak
    categoryBests.sort((a, b) => b.streak - a.streak);

    // Calculate totals
    const totalRuns = runs.length;
    const totalQuestionsSurvived = runs.reduce((sum, r) => sum + r.streak, 0);
    const totalTimePlayed = runs.reduce((sum, r) => sum + (r.time_played_seconds || 0), 0);

    // Get recent runs (last 10)
    const recentRuns = runs.slice(0, 10).map(r => ({
      id: r.id,
      mode: r.mode as "mixed" | "category",
      category: r.category,
      streak: r.streak,
      ended_at: r.ended_at,
    }));

    const stats: SurvivalStats = {
      mixed_best_streak: mixedBestStreak,
      mixed_rank: mixedRank,
      total_runs: totalRuns,
      total_questions_survived: totalQuestionsSurvived,
      total_time_played: totalTimePlayed,
      category_bests: categoryBests,
      recent_runs: recentRuns,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Survival stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
