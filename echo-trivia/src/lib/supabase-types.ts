// Database types for Supabase tables

export interface User {
  id: string
  echo_user_id: string
  username: string | null
  avatar_url: string | null
  avatar_id: string | null
  created_at: string
  updated_at: string
}

export interface QuizSession {
  id: string
  user_id: string
  echo_user_id: string
  category: string
  num_questions: number
  correct_answers: number
  total_questions: number
  score_percentage: number
  difficulty: string | null
  quiz_type: string | null
  is_daily: boolean
  daily_date: string | null
  title: string | null
  completed_at: string
  time_taken: number | null
  created_at: string
  game_mode: 'daily' | 'freeplay' | 'endless' | 'jeopardy' | 'campaign' | 'faceoff' | null
  faceoff_share_code: string | null
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  echo_user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement // Joined data
}

export interface DailyStreak {
  id: string
  user_id: string
  echo_user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  created_at: string
  updated_at: string
}

export interface QuizSubmission {
  id: string
  session_id: string
  question_id: string
  user_response: string
  correct_answer: string
  is_correct: boolean
  time_ms: number | null
  created_at: string
}

export interface QuizQuestion {
  id: string
  session_id: string
  quiz_id: string | null
  question_id: string
  question_type: string
  category: string
  difficulty: string | null
  prompt: string
  choices: Array<{ id: string; text: string }> | null
  correct_answer: string
  explanation: string | null
  question_order: number
  created_at: string
}

// Stats computed from quiz sessions
export interface UserStats {
  echo_user_id: string
  total_quizzes: number
  correct_answers: number
  total_questions: number
  accuracy_rate: number // Percentage (0-100)
  average_score: number // Percentage (0-100)
  perfect_scores: number
  categories_played: string[]
  total_time_played: number // in seconds
  favorite_category: string | null
  best_category: string | null
  daily_quizzes_completed: number
}

// Leaderboard entry
export interface LeaderboardEntry {
  echo_user_id: string
  username: string | null
  avatar_url: string | null
  avatar_id: string | null
  score: number
  rank: number
  total_quizzes?: number
  total_correct?: number
  accuracy_rate?: number
}

// API request/response types
export interface SaveQuizSessionRequest {
  echo_user_id: string
  echo_user_name?: string | null
  category: string
  num_questions: number
  correct_answers: number
  total_questions: number
  score_percentage: number
  difficulty?: string
  quiz_type?: string
  is_daily?: boolean
  daily_date?: string
  title?: string
  time_taken?: number
  session_id?: string
  quiz_id?: string // Original quiz ID for answer key lookup
  game_mode?: 'daily' | 'freeplay' | 'endless' | 'jeopardy' | 'campaign' | 'faceoff'
  faceoff_share_code?: string
  // Individual submissions for validation
  submissions?: Array<{
    question_id: string
    user_response: string
    correct_answer: string
    is_correct: boolean
    time_ms?: number
  }>
  // Full question data for history storage
  questions?: Array<{
    id: string
    type: string
    category: string
    difficulty?: string
    prompt: string
    choices?: Array<{ id: string; text: string }>
    answer: string
    explanation?: string
  }>
}

export interface LeaderboardQuery {
  period?: 'all' | 'daily' | 'weekly' | 'monthly'
  category?: string
  limit?: number
}

// ============================================================================
// SURVIVAL MODE TYPES
// ============================================================================

export interface SurvivalRun {
  id: string
  user_id: string | null
  echo_user_id: string
  mode: 'mixed' | 'category'
  category: string | null // NULL for mixed mode
  streak: number
  categories_seen: string[]
  time_played_seconds: number
  ended_at: string
  created_at: string
}

export interface SurvivalStats {
  mixed_best_streak: number
  mixed_rank: number | null
  total_runs: number
  total_questions_survived: number
  total_time_played: number
  category_bests: Array<{
    category: string
    streak: number
    rank: number | null
  }>
  recent_runs: Array<{
    id: string
    mode: 'mixed' | 'category'
    category: string | null
    streak: number
    ended_at: string
  }>
}

export interface SurvivalLeaderboardEntry {
  echo_user_id: string
  username: string | null
  avatar_url: string | null
  avatar_id: string | null
  streak: number
  rank: number
  ended_at: string
}

export interface SurvivalLeaderboardResponse {
  leaderboard: SurvivalLeaderboardEntry[]
  userPosition?: {
    streak: number
    rank: number
  }
}

// ============================================================================
// JEOPARDY MODE TYPES
// ============================================================================

export interface JeopardyQuestionAttempt {
  question_id: string
  category: string
  points: number
  prompt: string
  type: 'multiple_choice' | 'true_false'
  choices?: Array<{ id: string; text: string }>
  user_answer: string
  correct_answer: string
  is_correct: boolean
  explanation: string
  points_earned: number // positive if correct, negative if wrong
}

export interface JeopardyGame {
  id: string
  user_id: string | null
  echo_user_id: string
  board_size: 3 | 5
  categories: string[]
  score: number
  questions_answered: number
  questions_correct: number
  board_state: Record<string, boolean> // "category-points" -> answered
  questions_attempted: JeopardyQuestionAttempt[]
  time_played_seconds: number
  completed: boolean
  ended_at: string | null
  created_at: string
}

export interface JeopardyLeaderboardEntry {
  echo_user_id: string
  username: string | null
  avatar_url: string | null
  avatar_id: string | null
  score: number
  rank: number
  board_size: 3 | 5
  ended_at: string
}

export interface JeopardyLeaderboardResponse {
  leaderboard: JeopardyLeaderboardEntry[]
  userPosition?: {
    score: number
    rank: number
  }
}
