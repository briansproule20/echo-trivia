// Jeopardy Mode - Start a new game
// Creates a game with 3 or 5 categories, resolves "random" selections

import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { CATEGORIES } from "@/lib/types";
import { createActiveGame, JEOPARDY_POINT_VALUES } from "@/lib/jeopardy-state";

const RequestSchema = z.object({
  echo_user_id: z.string(),
  board_size: z.union([z.literal(3), z.literal(5)]),
  categories: z.array(z.string()).min(3).max(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { echo_user_id, board_size, categories } = RequestSchema.parse(body);

    // Validate categories length matches board size
    if (categories.length !== board_size) {
      return NextResponse.json(
        { error: `Expected ${board_size} categories, got ${categories.length}` },
        { status: 400 }
      );
    }

    // Resolve "random" categories to actual ones
    // Track used categories to avoid duplicates
    const usedCategories = new Set<string>();
    const resolvedCategories: string[] = [];

    for (const cat of categories) {
      if (cat === "random") {
        // Pick a random category that hasn't been used
        const available = CATEGORIES.filter(c => !usedCategories.has(c));
        if (available.length === 0) {
          return NextResponse.json(
            { error: "Not enough unique categories available" },
            { status: 400 }
          );
        }
        const randomCat = available[Math.floor(Math.random() * available.length)];
        resolvedCategories.push(randomCat);
        usedCategories.add(randomCat);
      } else {
        // Use the specified category (could be custom or from CATEGORIES)
        resolvedCategories.push(cat);
        usedCategories.add(cat);
      }
    }

    // Create game ID
    const gameId = randomUUID();

    // Create game in database (persists across cold starts)
    const success = await createActiveGame(gameId, echo_user_id, board_size, resolvedCategories);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to create game" },
        { status: 500 }
      );
    }

    // Return game setup
    return NextResponse.json({
      game_id: gameId,
      board_size,
      categories: resolvedCategories,
      point_values: JEOPARDY_POINT_VALUES,
      score: 0,
    });

  } catch (error) {
    console.error("Jeopardy start error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to start game", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
