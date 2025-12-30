// Sync tower achievements based on existing progress
// Call this to retroactively award achievements for past activity

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const echoUserId = body.echo_user_id;

    if (!echoUserId) {
      return NextResponse.json({ error: "Missing echo_user_id" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const earnedAchievements: string[] = [];

    // Helper to award achievement
    const awardAchievement = async (achievementId: string, floorEarned?: number) => {
      const { error } = await supabase
        .from("user_tower_achievements")
        .upsert({
          echo_user_id: echoUserId,
          achievement_id: achievementId,
          floor_earned: floorEarned || null,
        }, { onConflict: "echo_user_id,achievement_id" });

      if (!error) {
        earnedAchievements.push(achievementId);
      }
    };

    // Get tower progress
    const { data: progress } = await supabase
      .from("tower_progress")
      .select("*")
      .eq("echo_user_id", echoUserId)
      .single();

    if (!progress) {
      return NextResponse.json({ message: "No progress found", earnedAchievements: [] });
    }

    // Get all floor attempts
    const { data: attempts } = await supabase
      .from("tower_floor_attempts")
      .select("*")
      .eq("echo_user_id", echoUserId)
      .order("created_at", { ascending: false });

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({ message: "No attempts found", earnedAchievements: [] });
    }

    // Build stats from attempts
    const passedFloors = new Set<number>();
    const perfectFloors = new Set<number>();
    const categoryPerfects: Record<string, Set<string>> = {};
    const perfectCategories = new Set<string>();
    let clutchCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    // Calculate streak (from most recent)
    for (const attempt of attempts) {
      if (attempt.passed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Reset and calculate other stats
    for (const attempt of attempts) {
      if (attempt.passed) {
        passedFloors.add(attempt.floor_number);

        if (attempt.score === 5) {
          perfectFloors.add(attempt.floor_number);
          perfectCategories.add(attempt.category);

          if (!categoryPerfects[attempt.category]) {
            categoryPerfects[attempt.category] = new Set();
          }
          categoryPerfects[attempt.category].add(attempt.difficulty);
        }

        if (attempt.score === 3) {
          clutchCount++;
        }
      }
    }

    const highestFloor = progress.highest_floor || 1;

    // ═══════════════════════════════════════════════════════════════
    // MILESTONE ACHIEVEMENTS (7)
    // ═══════════════════════════════════════════════════════════════

    if (passedFloors.has(1)) await awardAchievement("first_steps", 1);
    if (highestFloor >= 25) await awardAchievement("apprentice", 25);
    if (highestFloor >= 100) await awardAchievement("scholar", 100);
    if (highestFloor >= 300) await awardAchievement("archivist", 300);
    if (highestFloor >= 600) await awardAchievement("signal_bearer", 600);
    if (highestFloor >= 900) await awardAchievement("tower_master", 900);
    if (highestFloor >= 1008) await awardAchievement("wizards_chosen", 1008);

    // ═══════════════════════════════════════════════════════════════
    // PERFORMANCE ACHIEVEMENTS (6)
    // ═══════════════════════════════════════════════════════════════

    if (perfectFloors.size > 0) {
      await awardAchievement("perfect_signal", Array.from(perfectFloors)[0]);
    }

    if (perfectFloors.size >= 10) await awardAchievement("clarity");
    if (perfectFloors.size >= 50) await awardAchievement("precision");

    // Calibrator - 5 consecutive perfect floors
    if (perfectFloors.size >= 5) {
      const sortedPerfect = Array.from(perfectFloors).sort((a, b) => a - b);
      for (let i = 0; i <= sortedPerfect.length - 5; i++) {
        if (sortedPerfect[i + 4] - sortedPerfect[i] === 4) {
          await awardAchievement("calibrator");
          break;
        }
      }
    }

    if (maxStreak >= 25) await awardAchievement("streak_keeper");
    if (maxStreak >= 50) await awardAchievement("unshakeable");

    // ═══════════════════════════════════════════════════════════════
    // CATEGORY MASTERY ACHIEVEMENTS (5)
    // ═══════════════════════════════════════════════════════════════

    let specialistCount = 0;
    for (const [, difficulties] of Object.entries(categoryPerfects)) {
      if (difficulties.has("easy") && difficulties.has("medium") && difficulties.has("hard")) {
        specialistCount++;
      }
    }

    if (specialistCount >= 1) await awardAchievement("specialist");
    if (specialistCount >= 3) await awardAchievement("triple_crown");
    if (perfectCategories.size >= 25) await awardAchievement("polymath");
    if (perfectCategories.size >= 50) await awardAchievement("renaissance");
    if (perfectCategories.size >= 100) await awardAchievement("universal");

    // ═══════════════════════════════════════════════════════════════
    // SPECIAL CONDITION ACHIEVEMENTS (5)
    // ═══════════════════════════════════════════════════════════════

    // Night Owl - check if any attempt was between 12am-4am
    for (const attempt of attempts) {
      const attemptHour = new Date(attempt.created_at).getHours();
      if (attempt.passed && attemptHour >= 0 && attemptHour < 4) {
        await awardAchievement("night_owl");
        break;
      }
    }

    // Marathon & Sprint - check time windows in attempts
    // Group attempts by 2-hour and 15-min windows
    const attemptTimes = attempts
      .filter(a => a.passed)
      .map(a => new Date(a.created_at).getTime())
      .sort((a, b) => a - b);

    // Check for 10 attempts within 2 hours
    for (let i = 0; i <= attemptTimes.length - 10; i++) {
      if (attemptTimes[i + 9] - attemptTimes[i] <= 2 * 60 * 60 * 1000) {
        await awardAchievement("marathon");
        break;
      }
    }

    // Check for 10 attempts within 15 minutes
    for (let i = 0; i <= attemptTimes.length - 10; i++) {
      if (attemptTimes[i + 9] - attemptTimes[i] <= 15 * 60 * 1000) {
        await awardAchievement("sprint");
        break;
      }
    }

    // Persistence - check if any floor was passed after 5+ fails
    const floorAttemptCounts: Record<number, { fails: number; passed: boolean }> = {};
    for (const attempt of [...attempts].reverse()) { // chronological order
      const floor = attempt.floor_number;
      if (!floorAttemptCounts[floor]) {
        floorAttemptCounts[floor] = { fails: 0, passed: false };
      }
      if (!attempt.passed) {
        floorAttemptCounts[floor].fails++;
      } else if (floorAttemptCounts[floor].fails >= 5) {
        await awardAchievement("persistence");
        break;
      }
    }

    // Clutch - 10 passes with exactly 3/5
    if (clutchCount >= 10) await awardAchievement("clutch");

    // ═══════════════════════════════════════════════════════════════
    // LIFETIME ACHIEVEMENTS (2)
    // ═══════════════════════════════════════════════════════════════

    const { data: totalStats } = await supabase
      .from("quiz_sessions")
      .select("correct_answers")
      .eq("echo_user_id", echoUserId);

    if (totalStats) {
      const totalCorrect = totalStats.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
      if (totalCorrect >= 1000) await awardAchievement("pattern_seeker");
      if (totalCorrect >= 5000) await awardAchievement("fog_dispeller");
    }

    return NextResponse.json({
      message: "Achievements synced",
      earnedAchievements,
      stats: {
        passedFloors: passedFloors.size,
        perfectFloors: perfectFloors.size,
        perfectCategories: perfectCategories.size,
        specialistCategories: specialistCount,
        highestFloor,
        maxStreak,
        clutchCount,
      },
    });
  } catch (error) {
    console.error("Sync achievements error:", error);
    return NextResponse.json(
      { error: "Failed to sync achievements" },
      { status: 500 }
    );
  }
}
