// Shared state for jeopardy mode active games
// In production, consider using Redis for multi-instance support

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

// Use globalThis to persist state across hot reloads in development
const globalKey = "__jeopardy_active_games__";

function getActiveGamesMap(): Map<string, JeopardyGameState> {
  if (!(globalThis as Record<string, unknown>)[globalKey]) {
    (globalThis as Record<string, unknown>)[globalKey] = new Map<string, JeopardyGameState>();
  }
  return (globalThis as Record<string, unknown>)[globalKey] as Map<string, JeopardyGameState>;
}

export function getActiveGame(gameId: string): JeopardyGameState | undefined {
  return getActiveGamesMap().get(gameId);
}

export function setActiveGame(gameId: string, state: JeopardyGameState): void {
  getActiveGamesMap().set(gameId, state);
}

export function deleteActiveGame(gameId: string): boolean {
  return getActiveGamesMap().delete(gameId);
}

export function hasActiveGame(gameId: string): boolean {
  return getActiveGamesMap().has(gameId);
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
