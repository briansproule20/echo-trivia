// Shared state for jeopardy mode active games
// Uses Supabase for persistence to survive serverless cold starts

import { createServiceClient } from "@/utils/supabase/service";
import type { JeopardyQuestionAttempt } from "./supabase-types";

export interface JeopardyGameState {
  echo_user_id: string;
  board_size: 3 | 5;
  categories: string[];
  score: number;
  board_state: Record<string, boolean>; // "category-points" -> answered
  questions_attempted: JeopardyQuestionAttempt[];
  start_time: number;
  current_question_id: string | null;
}

// Get active game from database
export async function getActiveGame(gameId: string): Promise<JeopardyGameState | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("jeopardy_games")
    .select("*")
    .eq("id", gameId)
    .eq("completed", false)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    echo_user_id: data.echo_user_id,
    board_size: data.board_size as 3 | 5,
    categories: data.categories,
    score: data.score,
    board_state: data.board_state as Record<string, boolean>,
    questions_attempted: (data.questions_attempted || []) as JeopardyQuestionAttempt[],
    start_time: data.start_time || data.created_at ? new Date(data.created_at).getTime() : Date.now(),
    current_question_id: data.current_question_id,
  };
}

// Create a new active game in database
export async function createActiveGame(
  gameId: string,
  echoUserId: string,
  boardSize: 3 | 5,
  categories: string[]
): Promise<boolean> {
  const supabase = createServiceClient();

  // Get user_id from echo_user_id if exists
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("echo_user_id", echoUserId)
    .single();

  const { error } = await supabase
    .from("jeopardy_games")
    .insert({
      id: gameId,
      user_id: userData?.id || null,
      echo_user_id: echoUserId,
      board_size: boardSize,
      categories,
      score: 0,
      questions_answered: 0,
      questions_correct: 0,
      board_state: {},
      questions_attempted: [],
      start_time: Date.now(),
      current_question_id: null,
      completed: false,
    });

  if (error) {
    console.error("Failed to create active game:", error);
    return false;
  }

  return true;
}

// Update active game state in database
export async function updateActiveGame(
  gameId: string,
  updates: Partial<{
    score: number;
    board_state: Record<string, boolean>;
    questions_attempted: JeopardyQuestionAttempt[];
    current_question_id: string | null;
    questions_answered: number;
    questions_correct: number;
  }>
): Promise<boolean> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("jeopardy_games")
    .update(updates)
    .eq("id", gameId)
    .eq("completed", false);

  if (error) {
    console.error("Failed to update active game:", error);
    return false;
  }

  return true;
}

// Complete a game (mark as finished)
export async function completeGame(
  gameId: string,
  finalScore: number,
  questionsAnswered: number,
  questionsCorrect: number,
  boardState: Record<string, boolean>,
  questionsAttempted: JeopardyQuestionAttempt[],
  timePlayedSeconds: number
): Promise<{ rank: number | null; isPersonalBest: boolean }> {
  const supabase = createServiceClient();

  // Get the game to find echo_user_id and board_size
  const { data: game } = await supabase
    .from("jeopardy_games")
    .select("echo_user_id, board_size")
    .eq("id", gameId)
    .single();

  if (!game) {
    throw new Error("Game not found");
  }

  // Update the game as completed
  const { error } = await supabase
    .from("jeopardy_games")
    .update({
      score: finalScore,
      questions_answered: questionsAnswered,
      questions_correct: questionsCorrect,
      board_state: boardState,
      questions_attempted: questionsAttempted,
      time_played_seconds: timePlayedSeconds,
      completed: true,
      ended_at: new Date().toISOString(),
      current_question_id: null,
    })
    .eq("id", gameId);

  if (error) {
    console.error("Failed to complete game:", error);
    throw new Error("Failed to complete game");
  }

  // Calculate rank
  const { count } = await supabase
    .from("jeopardy_games")
    .select("*", { count: "exact", head: true })
    .eq("board_size", game.board_size)
    .eq("completed", true)
    .gt("score", finalScore);

  const rank = count !== null ? count + 1 : null;

  // Check if personal best
  const { data: bestData } = await supabase
    .from("jeopardy_games")
    .select("score")
    .eq("echo_user_id", game.echo_user_id)
    .eq("board_size", game.board_size)
    .eq("completed", true)
    .neq("id", gameId)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  const isPersonalBest = !bestData || finalScore > bestData.score;

  return { rank, isPersonalBest };
}

// Delete/cleanup an active game (used if user abandons without ending)
export async function deleteActiveGame(gameId: string): Promise<boolean> {
  const supabase = createServiceClient();

  // For active games that are abandoned, we can either delete or mark completed
  // Let's mark as completed with current state so history is preserved
  const { error } = await supabase
    .from("jeopardy_games")
    .update({
      completed: true,
      ended_at: new Date().toISOString(),
      current_question_id: null,
    })
    .eq("id", gameId)
    .eq("completed", false);

  if (error) {
    console.error("Failed to delete active game:", error);
    return false;
  }

  return true;
}

// Helper to generate board cell key
export function getCellKey(category: string, points: number): string {
  return `${category}-${points}`;
}

// Helper to check if all cells are answered
export function isBoardComplete(state: JeopardyGameState): boolean {
  const totalCells = state.board_size * 5; // 5 point values per category
  const answeredCells = Object.keys(state.board_state).length;
  return answeredCells >= totalCells;
}

// Point values for Jeopardy
export const JEOPARDY_POINT_VALUES = [200, 400, 600, 800, 1000] as const;

// Map points to difficulty
export function pointsToDifficulty(points: number): string {
  switch (points) {
    case 200:
      return "very easy";
    case 400:
      return "easy";
    case 600:
      return "medium";
    case 800:
      return "hard";
    case 1000:
      return "very hard";
    default:
      return "medium";
  }
}
