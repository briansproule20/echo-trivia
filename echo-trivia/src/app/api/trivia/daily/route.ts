// Daily challenge endpoint - generates a challenge prompt once per day
// Users then pay to generate their own quiz from this prompt

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getTodayString, getDailySeed } from "@/lib/quiz-utils";
import { CATEGORIES } from "@/lib/types";

export const dynamic = 'force-dynamic';

// Cache version - increment this to bust cache when categories change
const CACHE_VERSION = `v2-${CATEGORIES.length}`;

// Cached challenge generator - generates once per day with date-specific cache key
async function getDailyChallenge(date: string) {
  return unstable_cache(
    async () => {
      console.log(`Generating new daily challenge for ${date}`);

      // Generate deterministic category for this date
      // Use hash of date to ensure even distribution across all categories
      const seed = getDailySeed(date);

      // Instead of using random selection which can cluster,
      // use the hash to cycle through categories in a pseudo-random but complete way
      // This ensures all categories appear over time
      const categoryIndex = seed % CATEGORIES.length;
      const category = CATEGORIES[categoryIndex];

      return {
        date,
        category,
        title: `Today's Challenge: ${category}`,
        description: `${date} - A new challenge every day at midnight EST`,
        numQuestions: 5,
        difficulty: "mixed" as const,
        type: "multiple_choice" as const,
      };
    },
    [`daily-challenge-${CACHE_VERSION}-${date}`], // Include version and date in cache key
    {
      revalidate: 86400, // 24 hours
      tags: [`daily-challenge-${date}`],
    }
  )();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayString();

    console.log(`Fetching daily challenge for ${date}`);
    const challenge = await getDailyChallenge(date);

    return NextResponse.json(challenge, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error("Daily challenge error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily challenge", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
