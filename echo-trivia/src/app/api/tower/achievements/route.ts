// Get tower achievements for user (all achievements with unlock status)

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export interface TowerAchievement {
  id: string;
  name: string;
  description: string;
  lore_text: string;
  category: string;
  icon: string;
  tier: string;
  is_hidden: boolean;
  sort_order: number;
}

export interface UserTowerAchievement {
  achievement_id: string;
  earned_at: string;
  floor_earned: number | null;
}

export interface TowerAchievementWithStatus extends TowerAchievement {
  unlocked: boolean;
  earned_at: string | null;
  floor_earned: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const echoUserId = searchParams.get("echo_user_id");

    const supabase = createServiceClient();

    // Get all tower achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from("tower_achievements")
      .select("*")
      .order("sort_order", { ascending: true });

    if (achievementsError) {
      console.error("Error fetching tower achievements:", achievementsError);
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }

    // If no user ID, return all achievements without unlock status
    if (!echoUserId) {
      const achievementsWithStatus: TowerAchievementWithStatus[] = (allAchievements || []).map((a) => ({
        ...a,
        unlocked: false,
        earned_at: null,
        floor_earned: null,
      }));

      return NextResponse.json({
        achievements: achievementsWithStatus,
        unlockedCount: 0,
        totalCount: allAchievements?.length || 0,
      });
    }

    // Get user's unlocked achievements
    const { data: userAchievements, error: userError } = await supabase
      .from("user_tower_achievements")
      .select("achievement_id, earned_at, floor_earned")
      .eq("echo_user_id", echoUserId);

    if (userError) {
      console.error("Error fetching user tower achievements:", userError);
      return NextResponse.json({ error: "Failed to fetch user achievements" }, { status: 500 });
    }

    // Create a map of unlocked achievements
    const unlockedMap = new Map<string, UserTowerAchievement>();
    (userAchievements || []).forEach((ua) => {
      unlockedMap.set(ua.achievement_id, ua);
    });

    // Merge achievements with unlock status
    const achievementsWithStatus: TowerAchievementWithStatus[] = (allAchievements || []).map((a) => {
      const unlocked = unlockedMap.get(a.id);
      return {
        ...a,
        unlocked: !!unlocked,
        earned_at: unlocked?.earned_at || null,
        floor_earned: unlocked?.floor_earned || null,
      };
    });

    // Filter out hidden achievements that aren't unlocked
    const visibleAchievements = achievementsWithStatus.filter(
      (a) => !a.is_hidden || a.unlocked
    );

    // Group by category for easier frontend rendering
    const byCategory = {
      milestone: visibleAchievements.filter((a) => a.category === "milestone"),
      performance: visibleAchievements.filter((a) => a.category === "performance"),
      mastery: visibleAchievements.filter((a) => a.category === "mastery"),
      special: visibleAchievements.filter((a) => a.category === "special"),
      lifetime: visibleAchievements.filter((a) => a.category === "lifetime"),
    };

    return NextResponse.json({
      achievements: visibleAchievements,
      byCategory,
      unlockedCount: userAchievements?.length || 0,
      totalCount: allAchievements?.length || 0,
      visibleCount: visibleAchievements.length,
    });
  } catch (error) {
    console.error("Tower achievements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tower achievements" },
      { status: 500 }
    );
  }
}
