// API endpoint to get average scores for daily challenges by date
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dates = searchParams.get("dates"); // Comma-separated dates: "2025-11-09,2025-11-08,..."

    if (!dates) {
      return NextResponse.json(
        { error: "Missing dates parameter" },
        { status: 400 }
      );
    }

    const dateArray = dates.split(",").filter(Boolean);

    if (dateArray.length === 0) {
      return NextResponse.json(
        { error: "No valid dates provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query for average scores AND categories per date for daily challenges only
    const { data, error } = await supabase
      .from("quiz_sessions")
      .select("daily_date, score_percentage, category")
      .eq("is_daily", true)
      .in("daily_date", dateArray);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch daily stats" },
        { status: 500 }
      );
    }

    // Calculate average per date and get category from DB
    const statsByDate: Record<string, { avg: number; count: number; category: string | null }> = {};

    data.forEach((session) => {
      const date = session.daily_date;
      if (!statsByDate[date]) {
        statsByDate[date] = { avg: 0, count: 0, category: session.category };
      }
      statsByDate[date].avg += session.score_percentage;
      statsByDate[date].count += 1;
      // Use first category found (they should all be the same for a given date)
      if (!statsByDate[date].category) {
        statsByDate[date].category = session.category;
      }
    });

    // Convert to final format with rounded averages and categories
    const results: Record<string, { avg: number; category: string } | null> = {};
    dateArray.forEach((date) => {
      if (statsByDate[date] && statsByDate[date].count > 0) {
        results[date] = {
          avg: Math.round(statsByDate[date].avg / statsByDate[date].count),
          category: statsByDate[date].category || "Unknown"
        };
      } else {
        results[date] = null; // No data for this date
      }
    });

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Daily stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
