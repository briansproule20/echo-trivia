-- ═══════════════════════════════════════════════════════════════════════════
-- Fix Remaining Supabase Performance Warnings
-- Part 2: Additional auth_rls_initplan and duplicate policy cleanup
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 1: auth_rls_initplan - remaining current_setting() issues
-- ═══════════════════════════════════════════════════════════════════════════

-- faceoff_challenges: fix update policy
DROP POLICY IF EXISTS "Creators can update their own challenges" ON faceoff_challenges;
CREATE POLICY "Creators can update their own challenges"
  ON faceoff_challenges FOR UPDATE
  USING (creator_echo_user_id = (select current_setting('app.echo_user_id', true)));

-- quiz_questions: fix select policy (uses auth.uid() in subquery)
DROP POLICY IF EXISTS "Users can view own quiz questions" ON quiz_questions;
CREATE POLICY "Users can view own quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM quiz_sessions
      WHERE echo_user_id = (select auth.uid())::text
    )
  );

-- survival_runs: fix update policy (uses request.jwt.claims)
DROP POLICY IF EXISTS "survival_runs_update_own" ON survival_runs;
CREATE POLICY "survival_runs_update_own"
  ON survival_runs FOR UPDATE
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- jeopardy_games: fix update policy (uses request.jwt.claims)
DROP POLICY IF EXISTS "jeopardy_games_update_own" ON jeopardy_games;
CREATE POLICY "jeopardy_games_update_own"
  ON jeopardy_games FOR UPDATE
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 2: multiple_permissive_policies - Remove duplicate policies
-- Keep one policy per table/action, remove redundant ones
-- ═══════════════════════════════════════════════════════════════════════════

-- achievements: keep "Achievements are viewable by everyone", drop duplicates
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Only admins can modify achievements" ON achievements;

-- daily_streaks: keep "Daily streaks are viewable by everyone", drop duplicate
DROP POLICY IF EXISTS "Anyone can view streaks" ON daily_streaks;

-- quiz_sessions: keep original policies, drop duplicates
DROP POLICY IF EXISTS "Anyone can view quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Anyone can insert quiz sessions" ON quiz_sessions;

-- tower_progress: "Anyone can view tower leaderboard data" is more permissive,
-- so drop the user-specific one (it's redundant)
DROP POLICY IF EXISTS "Users can view their own tower progress" ON tower_progress;

-- user_achievements: keep "User achievements are viewable by everyone", drop duplicate
DROP POLICY IF EXISTS "Anyone can view user achievements" ON user_achievements;

-- users: keep original policies, drop duplicates
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! This should clear all remaining Supabase Advisor warnings.
-- ═══════════════════════════════════════════════════════════════════════════
