// Jeopardy Mode - Generate question for a specific cell
// Difficulty scales with point value: 200=very easy, 1000=very hard

import { anthropic } from "@/echo";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/quiz-utils";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";
import { getActiveGame, updateActiveGame, getCellKey, pointsToDifficulty } from "@/lib/jeopardy-state";

const RequestSchema = z.object({
  game_id: z.string(),
  category: z.string(),
  points: z.union([z.literal(200), z.literal(400), z.literal(600), z.literal(800), z.literal(1000)]),
  echo_user_id: z.string(),
});

// Type for answer key storage
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

const getJeopardySystemPrompt = (difficulty: string) => `You are a trivia question generator for a Jeopardy-style game.
Generate exactly ONE high-quality trivia question.

DIFFICULTY: ${difficulty.toUpperCase()}
${difficulty === "very easy" ? "Make this question accessible to most people - use well-known facts but make them educational." : ""}
${difficulty === "easy" ? "Make this question straightforward but not trivial - test basic knowledge." : ""}
${difficulty === "medium" ? "Make this question moderately challenging - requires some specific knowledge." : ""}
${difficulty === "hard" ? "Make this question challenging - requires good knowledge of the topic." : ""}
${difficulty === "very hard" ? "Make this question quite difficult - requires expert-level or obscure knowledge, but still fair and answerable." : ""}

Rules:
- Question type: multiple_choice OR true_false (randomly choose, weighted toward multiple_choice)
- Multiple choice MUST have exactly 4 options with IDs: A, B, C, D (in that order)
- True/false statements must be clearly and unambiguously true or false - NO TRICK QUESTIONS
- Balance true/false answers (don't always make them true)
- Make wrong answers plausible but clearly distinct from correct answer
- Include a concise explanation (1-2 sentences)
- Questions should be interesting and educational

Return ONLY valid JSON matching this exact schema:
{
  "type": "multiple_choice" | "true_false",
  "prompt": "string",
  "choices": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],
  "answer": "A/B/C/D for MCQ, true/false for T/F",
  "explanation": "string"
}

For true_false questions, omit the "choices" field entirely.`;

// Store answer key for a single question
async function storeAnswerKey(gameId: string, questionId: string, answer: string, type: string, explanation: string): Promise<void> {
  const supabase = createServiceClient();

  // Get existing keys for this game
  const { data: existing } = await supabase
    .from("quiz_answer_keys")
    .select("answers")
    .eq("quiz_id", gameId)
    .single();

  const existingAnswers: AnswerKey[] = existing?.answers || [];

  const answerKeys: AnswerKey[] = [
    ...existingAnswers,
    {
      question_id: questionId,
      answer,
      type,
      explanation,
    }
  ];

  const { error } = await supabase
    .from("quiz_answer_keys")
    .upsert({
      quiz_id: gameId,
      answers: answerKeys,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours for jeopardy
    }, {
      onConflict: "quiz_id",
    });

  if (error) {
    console.error("Failed to store answer key:", error);
    throw new Error("Failed to securely store question answer");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { game_id, category, points, echo_user_id } = RequestSchema.parse(body);

    // Get active game from database
    const gameState = await getActiveGame(game_id);
    if (!gameState) {
      return NextResponse.json(
        { error: "Game not found or expired" },
        { status: 404 }
      );
    }

    // Verify user owns this game
    if (gameState.echo_user_id !== echo_user_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if this cell has already been answered
    const cellKey = getCellKey(category, points);
    if (gameState.board_state[cellKey]) {
      return NextResponse.json(
        { error: "This cell has already been answered" },
        { status: 400 }
      );
    }

    // Verify category is part of this game
    if (!gameState.categories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category for this game" },
        { status: 400 }
      );
    }

    // Map points to difficulty
    const difficulty = pointsToDifficulty(points);

    // Generate question with LLM
    const prompt = `Generate one ${difficulty} trivia question about: ${category}

This is for a Jeopardy-style game. The question is worth ${points} points.
Make it appropriately ${difficulty} - ${points === 200 ? "accessible to most players" : points === 1000 ? "challenging but fair" : "balanced for the difficulty level"}.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: getJeopardySystemPrompt(difficulty),
      prompt,
      temperature: 1.0,
    });

    // Parse response
    let question;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      question = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("JSON parsing failed:", error);
      return NextResponse.json(
        { error: "Failed to generate question" },
        { status: 500 }
      );
    }

    // Generate question ID
    const questionId = generateId();

    // Store answer key server-side
    await storeAnswerKey(
      game_id,
      questionId,
      question.answer,
      question.type,
      question.explanation || ""
    );

    // Update game state with current question in database
    await updateActiveGame(game_id, {
      current_question_id: questionId,
    });

    // Ensure choices are sorted for MCQ
    if (question.type === "multiple_choice" && question.choices) {
      question.choices = question.choices.sort((a: { id: string }, b: { id: string }) =>
        a.id.localeCompare(b.id)
      );
    }

    // Return question WITHOUT answer
    return NextResponse.json({
      question: {
        id: questionId,
        type: question.type,
        category,
        points,
        prompt: question.prompt,
        choices: question.choices, // undefined for T/F
      },
      current_score: gameState.score,
    });

  } catch (error) {
    console.error("Jeopardy question error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate question", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
