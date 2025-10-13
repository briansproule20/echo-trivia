// Daily challenge endpoint - generates a challenge prompt once per day
// Users then pay to generate their own quiz from this prompt

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getTodayString, getDailySeed, SeededRandom } from "@/lib/quiz-utils";
import { CATEGORIES } from "@/lib/types";

// Cached challenge generator - generates once per day
const generateDailyChallengeForDate = unstable_cache(
  async (date: string) => {
    console.log(`Generating new daily challenge for ${date}`);

    // Generate deterministic category for this date
    const seed = getDailySeed(date);
    const rng = new SeededRandom(seed);

    // Pick category based on day
    const categoryIndex = Math.floor(rng.next() * CATEGORIES.length);
    const category = CATEGORIES[categoryIndex];

    return {
      date,
      category,
      title: `Today's Challenge: ${category}`,
      description: `${date} - A new challenge every day at midnight EST`,
      numQuestions: 5,
      difficulty: "mixed" as const,
      type: "mixed" as const,
    };
  },
  ['daily-challenge'],
  {
    revalidate: 86400, // 24 hours
    tags: ['daily-challenge'],
  }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayString();

    console.log(`Fetching daily challenge for ${date}`);
    const challenge = await generateDailyChallengeForDate(date);

    return NextResponse.json(challenge, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
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
