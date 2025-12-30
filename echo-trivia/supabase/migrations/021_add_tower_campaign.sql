-- Tower Campaign: The Wizard's Tower progression tracking
-- Players ascend an infinite tower by completing category-based trivia floors

-- Tower progress table - tracks player's overall tower state
CREATE TABLE IF NOT EXISTS tower_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echo_user_id TEXT NOT NULL UNIQUE,
  current_floor INTEGER NOT NULL DEFAULT 1,
  highest_floor INTEGER NOT NULL DEFAULT 1,
  floor_attempts JSONB NOT NULL DEFAULT '{}',
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  perfect_floors INTEGER[] NOT NULL DEFAULT '{}',
  category_stats JSONB NOT NULL DEFAULT '{}',
  achievements TEXT[] NOT NULL DEFAULT '{}',
  session_stats JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tower floor attempts - detailed log of each floor attempt
CREATE TABLE IF NOT EXISTS tower_floor_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echo_user_id TEXT NOT NULL,
  floor_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  questions JSONB NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_duration INTEGER, -- seconds
  quiz_id TEXT, -- Reference to quiz_answer_keys for answer verification
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for tower_progress
CREATE INDEX IF NOT EXISTS idx_tower_progress_echo_user_id ON tower_progress(echo_user_id);
CREATE INDEX IF NOT EXISTS idx_tower_progress_highest_floor ON tower_progress(highest_floor DESC);

-- Indexes for tower_floor_attempts
CREATE INDEX IF NOT EXISTS idx_tower_floor_attempts_echo_user_id ON tower_floor_attempts(echo_user_id);
CREATE INDEX IF NOT EXISTS idx_tower_floor_attempts_floor ON tower_floor_attempts(floor_number);
CREATE INDEX IF NOT EXISTS idx_tower_floor_attempts_created ON tower_floor_attempts(created_at DESC);

-- Tower leaderboard view
CREATE OR REPLACE VIEW tower_leaderboard AS
SELECT
  tp.echo_user_id,
  u.username,
  u.avatar_url,
  u.avatar_id,
  tp.highest_floor,
  tp.total_correct,
  tp.total_questions,
  CASE
    WHEN tp.total_questions > 0 THEN ROUND((tp.total_correct::numeric / tp.total_questions::numeric) * 100, 1)
    ELSE 0
  END as accuracy_pct,
  COALESCE(array_length(tp.perfect_floors, 1), 0) as perfect_count,
  COALESCE(array_length(tp.achievements, 1), 0) as achievement_count,
  tp.updated_at as last_active
FROM tower_progress tp
LEFT JOIN users u ON tp.echo_user_id = u.echo_user_id
ORDER BY tp.highest_floor DESC, tp.total_correct DESC;

-- RLS policies
ALTER TABLE tower_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_floor_attempts ENABLE ROW LEVEL SECURITY;

-- tower_progress: users can read their own progress, service can read/write all
CREATE POLICY "Users can view their own tower progress"
  ON tower_progress FOR SELECT
  USING (echo_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Service role can manage tower progress"
  ON tower_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- tower_floor_attempts: users can read their own attempts, service can read/write all
CREATE POLICY "Users can view their own tower attempts"
  ON tower_floor_attempts FOR SELECT
  USING (echo_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Service role can manage tower attempts"
  ON tower_floor_attempts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger for tower_progress
CREATE OR REPLACE FUNCTION update_tower_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tower_progress_updated_at ON tower_progress;
CREATE TRIGGER trigger_tower_progress_updated_at
  BEFORE UPDATE ON tower_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_tower_progress_updated_at();
