-- ═══════════════════════════════════════════════════════════════════════════
-- Final RLS initplan fixes
-- These 4 policies still have the current_setting() re-evaluation issue
-- ═══════════════════════════════════════════════════════════════════════════

-- user_tower_achievements
DROP POLICY IF EXISTS "Users can view their own tower achievements" ON user_tower_achievements;
CREATE POLICY "Users can view their own tower achievements"
  ON user_tower_achievements FOR SELECT
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- tower_floor_attempts
DROP POLICY IF EXISTS "Users can view their own tower attempts" ON tower_floor_attempts;
CREATE POLICY "Users can view their own tower attempts"
  ON tower_floor_attempts FOR SELECT
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- survival_runs
DROP POLICY IF EXISTS "survival_runs_update_own" ON survival_runs;
CREATE POLICY "survival_runs_update_own"
  ON survival_runs FOR UPDATE
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- jeopardy_games
DROP POLICY IF EXISTS "jeopardy_games_update_own" ON jeopardy_games;
CREATE POLICY "jeopardy_games_update_own"
  ON jeopardy_games FOR UPDATE
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));
