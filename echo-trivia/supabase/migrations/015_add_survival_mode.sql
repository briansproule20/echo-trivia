-- Survival Mode Tables
-- Tracks endless survival runs where players answer until they get one wrong

-- Main survival runs table
CREATE TABLE IF NOT EXISTS survival_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  echo_user_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'mixed' CHECK (mode IN ('mixed', 'category')),
  category TEXT, -- NULL for mixed mode, set for single-category mode
  streak INT NOT NULL DEFAULT 0,
  categories_seen TEXT[] DEFAULT '{}', -- tracks categories encountered in mixed mode
  time_played_seconds INT DEFAULT 0,
  ended_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_survival_runs_streak ON survival_runs(streak DESC);
CREATE INDEX IF NOT EXISTS idx_survival_runs_user ON survival_runs(echo_user_id);
CREATE INDEX IF NOT EXISTS idx_survival_runs_mode ON survival_runs(mode);
CREATE INDEX IF NOT EXISTS idx_survival_runs_mode_streak ON survival_runs(mode, streak DESC);
CREATE INDEX IF NOT EXISTS idx_survival_runs_category ON survival_runs(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_survival_runs_category_streak ON survival_runs(category, streak DESC) WHERE category IS NOT NULL;

-- Enable RLS
ALTER TABLE survival_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "survival_runs_select_own" ON survival_runs
  FOR SELECT USING (true); -- Anyone can view leaderboard

CREATE POLICY "survival_runs_insert_own" ON survival_runs
  FOR INSERT WITH CHECK (true); -- Server inserts via service role

CREATE POLICY "survival_runs_update_own" ON survival_runs
  FOR UPDATE USING (echo_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
