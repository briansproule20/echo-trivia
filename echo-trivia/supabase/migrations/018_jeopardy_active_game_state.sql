-- Add columns needed for active game state persistence
-- This fixes cold start issues in serverless environments

ALTER TABLE jeopardy_games
ADD COLUMN IF NOT EXISTS current_question_id TEXT DEFAULT NULL;

ALTER TABLE jeopardy_games
ADD COLUMN IF NOT EXISTS start_time BIGINT DEFAULT NULL;

-- Index for finding active (incomplete) games quickly
CREATE INDEX IF NOT EXISTS idx_jeopardy_games_active
ON jeopardy_games(echo_user_id, completed)
WHERE completed = false;
