// Daily quiz endpoint - deterministic quiz for a given date

import { NextResponse } from "next/server";
import { getTodayString, getDailySeed, SeededRandom } from "@/lib/quiz-utils";
import { CATEGORIES } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayString();

    // Generate deterministic category and difficulty for this date
    const seed = getDailySeed(date);
    const rng = new SeededRandom(seed);

    // Pick category based on day
    const categoryIndex = Math.floor(rng.next() * CATEGORIES.length);
    const category = CATEGORIES[categoryIndex];

    // Mix of difficulties for daily
    const difficulty = "mixed";
    const numQuestions = 5;

    // Generate quiz using the generate endpoint
    const baseUrl = new URL(req.url).origin;
    const generateResponse = await fetch(`${baseUrl}/api/trivia/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          category,
          numQuestions,
          difficulty,
          type: "mixed",
          style: "classic",
        },
      }),
    });

    if (!generateResponse.ok) {
      throw new Error("Failed to generate daily quiz");
    }

    const quiz = await generateResponse.json();

    // Mark as seeded/daily quiz
    quiz.seeded = true;
    quiz.title = `Daily Quiz - ${date}`;
    quiz.description = `Today's ${category} challenge`;

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Daily quiz error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

