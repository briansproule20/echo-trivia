// Jeopardy Mode - Submit answer
// Verifies answer server-side, awards or deducts points

import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";
import { getActiveGame, setActiveGame, deleteActiveGame, getCellKey, isBoardComplete } from "@/lib/jeopardy-state";
import type { JeopardyQuestionAttempt } from "@/lib/supabase-types";

const RequestSchema = z.object({
  game_id: z.string(),
  question_id: z.string(),
  category: z.string(),
  points: z.number(),
  response: z.string(),
  echo_user_id: z.string(),
});

// Type for answer key from database
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

// Look up answer key from server-side storage
async function getAnswerKey(gameId: string, questionId: string): Promise<AnswerKey | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("quiz_answer_keys")
    .select("answers")
    .eq("quiz_id", gameId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch answer key:", error);
    return null;
  }

  const answers = data.answers as AnswerKey[];
  return answers.find((a) => a.question_id === questionId) || null;
}

// Save completed game to database
async function saveGame(
  gameId: string,
  echoUserId: string,
  boardSize: 3 | 5,
  categories: string[],
  score: number,
  questionsAnswered: number,
  questionsCorrect: number,
  boardState: Record<string, boolean>,
  questionsAttempted: JeopardyQuestionAttempt[],
  timePlayed: number
): Promise<{ rank: number | null; isPersonalBest: boolean }> {
  const supabase = createServiceClient();

  // Get user_id from echo_user_id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("echo_user_id", echoUserId)
    .single();

  // Save to jeopardy_games
  const { error: gameError } = await supabase
    .from("jeopardy_games")
    .insert({
      id: gameId,
      user_id: userData?.id || null,
      echo_user_id: echoUserId,
      board_size: boardSize,
      categories,
      score,
      questions_answered: questionsAnswered,
      questions_correct: questionsCorrect,
      board_state: boardState,
      questions_attempted: questionsAttempted,
      time_played_seconds: Math.floor(timePlayed / 1000),
      completed: true,
      ended_at: new Date().toISOString(),
    });

  if (gameError) {
    console.error("Failed to save jeopardy game:", gameError);
    throw new Error(`Failed to save jeopardy game: ${gameError.message}`);
  }

  // Calculate rank (how many have higher scores with same board size)
  const { count } = await supabase
    .from("jeopardy_games")
    .select("*", { count: "exact", head: true })
    .eq("board_size", boardSize)
    .eq("completed", true)
    .gt("score", score);

  const rank = count !== null ? count + 1 : null;

  // Check if personal best for this board size
  const { data: bestData } = await supabase
    .from("jeopardy_games")
    .select("score")
    .eq("echo_user_id", echoUserId)
    .eq("board_size", boardSize)
    .eq("completed", true)
    .neq("id", gameId)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  const isPersonalBest = !bestData || score > bestData.score;

  return { rank, isPersonalBest };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { game_id, question_id, category, points, response, echo_user_id } = RequestSchema.parse(body);

    // Get game state
    const gameState = getActiveGame(game_id);
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

    // Verify this is the current question
    if (gameState.current_question_id !== question_id) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Get answer key
    const answerKey = await getAnswerKey(game_id, question_id);
    if (!answerKey) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Evaluate answer (strict comparison for MCQ and T/F)
    const correct = response.toLowerCase().trim() === answerKey.answer.toLowerCase().trim();

    // Calculate points earned/lost
    const pointsEarned = correct ? points : -points;

    // Update score
    gameState.score += pointsEarned;

    // Mark cell as answered
    const cellKey = getCellKey(category, points);
    gameState.board_state[cellKey] = true;

    // Clear current question
    gameState.current_question_id = null;

    // Find and update the question attempt (it was added when question was generated)
    // If not found, add it now
    const existingAttempt = gameState.questions_attempted.find(q => q.question_id === question_id);
    if (existingAttempt) {
      existingAttempt.user_answer = response;
      existingAttempt.correct_answer = answerKey.answer;
      existingAttempt.is_correct = correct;
      existingAttempt.explanation = answerKey.explanation || "";
      existingAttempt.points_earned = pointsEarned;
    } else {
      // Add the question attempt
      const questionAttempt: JeopardyQuestionAttempt = {
        question_id,
        category,
        points,
        prompt: "", // Not available here, but not critical
        type: answerKey.type as "multiple_choice" | "true_false",
        user_answer: response,
        correct_answer: answerKey.answer,
        is_correct: correct,
        explanation: answerKey.explanation || "",
        points_earned: pointsEarned,
      };
      gameState.questions_attempted.push(questionAttempt);
    }

    // Check if board is complete
    const boardComplete = isBoardComplete(gameState);

    if (boardComplete) {
      // Auto-complete the game
      const timePlayed = Date.now() - gameState.start_time;
      const questionsCorrect = gameState.questions_attempted.filter(q => q.is_correct).length;

      const { rank, isPersonalBest } = await saveGame(
        game_id,
        echo_user_id,
        gameState.board_size,
        gameState.categories,
        gameState.score,
        gameState.questions_attempted.length,
        questionsCorrect,
        gameState.board_state,
        gameState.questions_attempted,
        timePlayed
      );

      // Clean up
      deleteActiveGame(game_id);

      // Clean up answer keys
      const supabase = createServiceClient();
      await supabase
        .from("quiz_answer_keys")
        .delete()
        .eq("quiz_id", game_id);

      return NextResponse.json({
        correct,
        explanation: answerKey.explanation || (correct ? "Correct!" : `The correct answer was: ${answerKey.answer}`),
        canonical_answer: answerKey.answer,
        points_earned: pointsEarned,
        current_score: gameState.score,
        game_over: true,
        final_stats: {
          score: gameState.score,
          questions_answered: gameState.questions_attempted.length,
          questions_correct: questionsCorrect,
          categories: gameState.categories,
          rank,
          time_played: Math.floor(timePlayed / 1000),
          is_personal_best: isPersonalBest,
          board_size: gameState.board_size,
        },
      });
    }

    // Save updated state
    setActiveGame(game_id, gameState);

    return NextResponse.json({
      correct,
      explanation: answerKey.explanation || (correct ? "Correct!" : `The correct answer was: ${answerKey.answer}`),
      canonical_answer: answerKey.answer,
      points_earned: pointsEarned,
      current_score: gameState.score,
      game_over: false,
      cells_remaining: (gameState.board_size * 5) - Object.keys(gameState.board_state).length,
    });

  } catch (error) {
    console.error("Jeopardy answer error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
