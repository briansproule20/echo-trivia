-- Jeopardy Mode Tables
-- Tracks Jeopardy-style games with 3 or 5 categories and point-based scoring

-- Main jeopardy games table
CREATE TABLE IF NOT EXISTS jeopardy_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  echo_user_id TEXT NOT NULL,
  board_size INT NOT NULL CHECK (board_size IN (3, 5)),
  categories TEXT[] NOT NULL,
  score INT NOT NULL DEFAULT 0, -- Can be negative
  questions_answered INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  board_state JSONB NOT NULL DEFAULT '{}', -- Tracks which cells are answered: {"category-points": true}
  questions_attempted JSONB DEFAULT '[]', -- Full question history
  time_played_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_jeopardy_games_score ON jeopardy_games(score DESC);
CREATE INDEX IF NOT EXISTS idx_jeopardy_games_user ON jeopardy_games(echo_user_id);
CREATE INDEX IF NOT EXISTS idx_jeopardy_games_board_size ON jeopardy_games(board_size);
CREATE INDEX IF NOT EXISTS idx_jeopardy_games_board_size_score ON jeopardy_games(board_size, score DESC) WHERE completed = true;
CREATE INDEX IF NOT EXISTS idx_jeopardy_games_completed ON jeopardy_games(completed) WHERE completed = true;

-- Enable RLS
ALTER TABLE jeopardy_games ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "jeopardy_games_select_all" ON jeopardy_games
  FOR SELECT USING (true); -- Anyone can view leaderboard

CREATE POLICY "jeopardy_games_insert" ON jeopardy_games
  FOR INSERT WITH CHECK (true); -- Server inserts via service role

CREATE POLICY "jeopardy_games_update_own" ON jeopardy_games
  FOR UPDATE USING (echo_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
