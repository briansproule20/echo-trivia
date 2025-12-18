// Shared state for survival mode active runs
// In production, consider using Redis for multi-instance support

export interface QuestionAttempt {
  question_id: string;
  prompt: string;
  category: string;
  user_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  explanation: string | null;
}

export interface SurvivalRunState {
  echo_user_id: string;
  mode: "mixed" | "category";
  category: string | null;
  streak: number;
  categories_seen: string[];
  start_time: number;
  last_question_id: string | null;
  questions_attempted: QuestionAttempt[];
}

// Use globalThis to persist state across hot reloads in development
const globalKey = "__survival_active_runs__";

function getActiveRunsMap(): Map<string, SurvivalRunState> {
  if (!(globalThis as Record<string, unknown>)[globalKey]) {
    (globalThis as Record<string, unknown>)[globalKey] = new Map<string, SurvivalRunState>();
  }
  return (globalThis as Record<string, unknown>)[globalKey] as Map<string, SurvivalRunState>;
}

export function getActiveRun(runId: string): SurvivalRunState | undefined {
  return getActiveRunsMap().get(runId);
}

export function setActiveRun(runId: string, state: SurvivalRunState): void {
  getActiveRunsMap().set(runId, state);
}

export function deleteActiveRun(runId: string): boolean {
  return getActiveRunsMap().delete(runId);
}

export function hasActiveRun(runId: string): boolean {
  return getActiveRunsMap().has(runId);
}
