-- Fix security issues with SECURITY DEFINER views
-- Recreate views as SECURITY INVOKER (default) and add appropriate RLS policies

-- ═══════════════════════════════════════════════════════════════════════════
-- Fix tower_leaderboard view
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS tower_leaderboard;

CREATE VIEW tower_leaderboard AS
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

-- Add public read policy for tower_progress (leaderboard needs this)
DROP POLICY IF EXISTS "Anyone can view tower leaderboard data" ON tower_progress;
CREATE POLICY "Anyone can view tower leaderboard data"
  ON tower_progress FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Fix user_tower_achievements_details view
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS user_tower_achievements_details;

CREATE VIEW user_tower_achievements_details AS
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

-- The existing RLS policy on user_tower_achievements already allows users to see their own
-- No additional policy needed - the view inherits the caller's permissions
