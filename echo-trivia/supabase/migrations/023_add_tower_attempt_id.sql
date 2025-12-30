-- Add tower_attempt_id to quiz_sessions for linking campaign results
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS tower_attempt_id UUID REFERENCES tower_floor_attempts(id);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_tower_attempt_id ON quiz_sessions(tower_attempt_id) WHERE tower_attempt_id IS NOT NULL;
