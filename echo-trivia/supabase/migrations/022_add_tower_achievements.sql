-- Tower Campaign Achievements: The 25 Achievements for The Wizard's Tower

-- Tower achievements definition table
CREATE TABLE IF NOT EXISTS tower_achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  lore_text TEXT NOT NULL,
  category TEXT NOT NULL, -- milestone, performance, mastery, special, hidden
  icon TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User tower achievements (unlocked achievements)
CREATE TABLE IF NOT EXISTS user_tower_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echo_user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL REFERENCES tower_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  floor_earned INTEGER, -- Floor number when earned (if applicable)
  UNIQUE(echo_user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_tower_achievements_user ON user_tower_achievements(echo_user_id);
CREATE INDEX IF NOT EXISTS idx_user_tower_achievements_achievement ON user_tower_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_tower_achievements_category ON tower_achievements(category);

-- RLS policies
ALTER TABLE tower_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tower_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view tower achievements" ON tower_achievements;
DROP POLICY IF EXISTS "Users can view their own tower achievements" ON user_tower_achievements;
DROP POLICY IF EXISTS "Service role can manage user tower achievements" ON user_tower_achievements;

-- tower_achievements: anyone can read
CREATE POLICY "Anyone can view tower achievements"
  ON tower_achievements FOR SELECT
  USING (true);

-- user_tower_achievements: users can read their own, service can manage all
CREATE POLICY "Users can view their own tower achievements"
  ON user_tower_achievements FOR SELECT
  USING (echo_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Service role can manage user tower achievements"
  ON user_tower_achievements FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert the 25 achievements from the spec
-- ═══════════════════════════════════════════════════════════════════════════
-- MILESTONE ACHIEVEMENTS (7)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tower_achievements (id, name, description, lore_text, category, icon, tier, sort_order) VALUES
('first_steps', 'First Steps', 'Complete Floor 1', 'Every maintainer begins with a single question.', 'milestone', '👣', 'bronze', 1),
('apprentice', 'Apprentice Seeker', 'Reach Floor 25', 'The Wizard has noticed your arrival.', 'milestone', '📜', 'bronze', 2),
('scholar', 'Scholar of the Archive', 'Reach Floor 100', 'You have learned to read the old texts.', 'milestone', '📚', 'silver', 3),
('archivist', 'Archivist', 'Reach Floor 300', 'The Lower Archives hold no more mysteries for you.', 'milestone', '🗃️', 'gold', 4),
('signal_bearer', 'Signal Bearer', 'Reach Floor 600', 'Through the Drift, your signal remains clear.', 'milestone', '📡', 'gold', 5),
('tower_master', 'Tower Master', 'Reach Floor 900', 'The Upper Sanctum opens its final doors.', 'milestone', '🏰', 'platinum', 6),
('wizards_chosen', 'The Wizard''s Chosen', 'Complete all floors', 'You have joined the Legion as a true Calibrator.', 'milestone', '👑', 'platinum', 7)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PERFORMANCE ACHIEVEMENTS (6)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tower_achievements (id, name, description, lore_text, category, icon, tier, sort_order) VALUES
('perfect_signal', 'Perfect Signal', 'Score 5/5 on any floor', 'No static. Pure clarity.', 'performance', '✨', 'bronze', 10),
('clarity', 'Clarity', 'Score 5/5 on 10 different floors', 'Your signal cuts through the noise.', 'performance', '💎', 'silver', 11),
('precision', 'Precision', 'Score 5/5 on 50 different floors', 'The Wizard recognizes a fellow perfectionist.', 'performance', '🎯', 'gold', 12),
('calibrator', 'Calibrator', '5/5 on 5 consecutive floors', 'Five floors. Five perfect readings. Zero drift.', 'performance', '⚡', 'gold', 13),
('streak_keeper', 'Streak Keeper', 'Pass 25 floors without failing', 'Ignorance cannot catch what it cannot touch.', 'performance', '🔥', 'silver', 14),
('unshakeable', 'Unshakeable', 'Pass 50 floors without failing', 'The fog rolls in. You walk through it.', 'performance', '🛡️', 'platinum', 15)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORY MASTERY (5)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tower_achievements (id, name, description, lore_text, category, icon, tier, sort_order) VALUES
('specialist', 'Specialist', '5/5 on same category at all 3 difficulties', 'One subject. Complete mastery.', 'mastery', '🔬', 'silver', 20),
('triple_crown', 'Triple Crown', 'Achieve Specialist in 3 categories', 'Three domains. Three perfect calibrations.', 'mastery', '👑', 'gold', 21),
('polymath', 'Polymath', '5/5 on 25 different categories', 'The breadth of your knowledge impresses even the Wizard.', 'mastery', '🌐', 'gold', 22),
('renaissance', 'Renaissance Mind', '5/5 on 50 different categories', 'No corner of the Archive is foreign to you.', 'mastery', '🎨', 'platinum', 23),
('universal', 'Universal Maintainer', '5/5 on 100 different categories', 'You see the patterns that connect all knowledge.', 'mastery', '🌟', 'platinum', 24)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- SPECIAL CONDITION (5)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tower_achievements (id, name, description, lore_text, category, icon, tier, sort_order) VALUES
('night_owl', 'Night Owl', 'Complete a floor between 12am-4am local time', 'The Tower never sleeps. Neither do you.', 'special', '🦉', 'bronze', 30),
('marathon', 'Marathon', 'Complete 10 floors in one session', 'A single session. Ten calibrations. The Wizard is impressed.', 'special', '🏃', 'silver', 31),
('sprint', 'Sprint', 'Complete 10 floors in under 15 minutes', 'Speed and accuracy are not opposites.', 'special', '⚡', 'silver', 32),
('persistence', 'Persistence', 'Pass a floor after 5+ failed attempts', 'Ignorance retreats from those who refuse to quit.', 'special', '💪', 'silver', 33),
('clutch', 'Clutch', 'Pass 10 floors with exactly 3/5', 'By the narrowest margin. Ten times. Still standing.', 'special', '🎲', 'silver', 34)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- LIFETIME ACHIEVEMENTS (2) - Based on total correct answers across all game modes
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tower_achievements (id, name, description, lore_text, category, icon, tier, is_hidden, sort_order) VALUES
('pattern_seeker', 'Pattern Seeker', 'Answer 1000 questions correctly (all modes)', 'One thousand correct answers. One thousand threads woven.', 'lifetime', '🔮', 'gold', false, 40),
('fog_dispeller', 'Fog Dispeller', 'Answer 5000 questions correctly (all modes)', 'Five thousand lights against the encroaching dark.', 'lifetime', '☀️', 'platinum', false, 41)
ON CONFLICT (id) DO NOTHING;

-- View for user achievements with achievement details
CREATE OR REPLACE VIEW user_tower_achievements_details AS
SELECT
  uta.id,
  uta.echo_user_id,
  uta.achievement_id,
  uta.earned_at,
  uta.floor_earned,
  ta.name,
  ta.description,
  ta.lore_text,
  ta.category,
  ta.icon,
  ta.tier,
  ta.is_hidden,
  ta.sort_order
FROM user_tower_achievements uta
JOIN tower_achievements ta ON uta.achievement_id = ta.id
ORDER BY ta.sort_order;
