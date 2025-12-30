import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const echoUserId = searchParams.get("echo_user_id");
    const limit = parseInt(searchParams.get("limit") || "25");

    const supabase = createServiceClient();

    // Get users who have passed at least one floor
    const { data: attempts, error } = await supabase
      .from("tower_floor_attempts")
      .select("echo_user_id, floor_number")
      .eq("passed", true);

    if (error) {
      console.error("Tower leaderboard error:", error);
      return NextResponse.json({ leaderboard: [], userPosition: null });
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({ leaderboard: [], userPosition: null });
    }

    // Get highest floor per user
    const userHighest: Record<string, number> = {};
    attempts.forEach(a => {
      if (!userHighest[a.echo_user_id] || a.floor_number > userHighest[a.echo_user_id]) {
        userHighest[a.echo_user_id] = a.floor_number;
      }
    });

    // Sort by floor and take top N
    const sorted = Object.entries(userHighest)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Get usernames
    const userIds = sorted.map(([id]) => id);
    const { data: users } = await supabase
      .from("users")
      .select("echo_user_id, username")
      .in("echo_user_id", userIds);

    const userMap: Record<string, string> = {};
    users?.forEach(u => {
      userMap[u.echo_user_id] = u.username || "";
    });

    // Build leaderboard
    const leaderboard = sorted.map(([odId, floor], index) => ({
      echo_user_id: odId,
      username: userMap[odId] || null,
      highest_floor: floor,
      rank: index + 1,
    }));

    // Check if current user is in the list
    let userPosition = null;
    if (echoUserId && userHighest[echoUserId]) {
      const inList = leaderboard.find(e => e.echo_user_id === echoUserId);
      if (!inList) {
        // Count users with higher floors
        const higherCount = Object.values(userHighest).filter(f => f > userHighest[echoUserId]).length;
        userPosition = {
          echo_user_id: echoUserId,
          username: userMap[echoUserId] || null,
          highest_floor: userHighest[echoUserId],
          rank: higherCount + 1,
        };
      }
    }

    return NextResponse.json({ leaderboard, userPosition });
  } catch (error) {
    console.error("Tower leaderboard error:", error);
    return NextResponse.json({ leaderboard: [], userPosition: null });
  }
}
