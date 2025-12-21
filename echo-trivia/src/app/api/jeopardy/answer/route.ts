// Jeopardy Mode - Submit answer
// Verifies answer server-side, awards or deducts points

import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";
import { getActiveGame, updateActiveGame, completeGame, getCellKey, isBoardComplete } from "@/lib/jeopardy-state";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { game_id, question_id, category, points, response, echo_user_id } = RequestSchema.parse(body);

    // Get game state from database
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

    // Update game state
    const newScore = gameState.score + pointsEarned;
    const cellKey = getCellKey(category, points);
    const newBoardState = { ...gameState.board_state, [cellKey]: true };

    // Find and update the question attempt (it was added when question was generated)
    // If not found, add it now
    const newQuestionsAttempted = [...gameState.questions_attempted];
    const existingAttemptIndex = newQuestionsAttempted.findIndex(q => q.question_id === question_id);

    if (existingAttemptIndex >= 0) {
      newQuestionsAttempted[existingAttemptIndex] = {
        ...newQuestionsAttempted[existingAttemptIndex],
        user_answer: response,
        correct_answer: answerKey.answer,
        is_correct: correct,
        explanation: answerKey.explanation || "",
        points_earned: pointsEarned,
      };
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
      newQuestionsAttempted.push(questionAttempt);
    }

    // Update state with new values
    const updatedState = {
      ...gameState,
      score: newScore,
      board_state: newBoardState,
      questions_attempted: newQuestionsAttempted,
      current_question_id: null,
    };

    // Check if board is complete
    const boardComplete = isBoardComplete(updatedState);

    if (boardComplete) {
      // Complete the game
      const timePlayed = Date.now() - gameState.start_time;
      const questionsCorrect = newQuestionsAttempted.filter(q => q.is_correct).length;

      const { rank, isPersonalBest } = await completeGame(
        game_id,
        newScore,
        newQuestionsAttempted.length,
        questionsCorrect,
        newBoardState,
        newQuestionsAttempted,
        Math.floor(timePlayed / 1000)
      );

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
        current_score: newScore,
        game_over: true,
        final_stats: {
          score: newScore,
          questions_answered: newQuestionsAttempted.length,
          questions_correct: questionsCorrect,
          categories: gameState.categories,
          rank,
          time_played: Math.floor(timePlayed / 1000),
          is_personal_best: isPersonalBest,
          board_size: gameState.board_size,
        },
      });
    }

    // Save updated state to database
    await updateActiveGame(game_id, {
      score: newScore,
      board_state: newBoardState,
      questions_attempted: newQuestionsAttempted,
      current_question_id: null,
      questions_answered: newQuestionsAttempted.length,
      questions_correct: newQuestionsAttempted.filter(q => q.is_correct).length,
    });

    return NextResponse.json({
      correct,
      explanation: answerKey.explanation || (correct ? "Correct!" : `The correct answer was: ${answerKey.answer}`),
      canonical_answer: answerKey.answer,
      points_earned: pointsEarned,
      current_score: newScore,
      game_over: false,
      cells_remaining: (gameState.board_size * 5) - Object.keys(newBoardState).length,
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
