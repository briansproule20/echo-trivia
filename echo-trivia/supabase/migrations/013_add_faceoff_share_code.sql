-- Add faceoff_share_code column to quiz_sessions to link faceoff plays to challenges
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS faceoff_share_code TEXT;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_faceoff_share_code
ON quiz_sessions(faceoff_share_code)
WHERE faceoff_share_code IS NOT NULL;

-- Add foreign key constraint (optional, for data integrity)
-- Note: This requires the faceoff_challenges table to exist
ALTER TABLE quiz_sessions
ADD CONSTRAINT fk_quiz_sessions_faceoff_challenge
FOREIGN KEY (faceoff_share_code)
REFERENCES faceoff_challenges(share_code)
ON DELETE SET NULL;

COMMENT ON COLUMN quiz_sessions.faceoff_share_code IS 'Links to faceoff_challenges.share_code for faceoff game mode sessions';
