-- ═══════════════════════════════════════════════════════════════════════════
-- Fix Supabase Performance Warnings
-- 1. auth_rls_initplan: Wrap current_setting() in (select ...) to prevent per-row re-evaluation
-- 2. multiple_permissive_policies: Remove redundant "Service role" policies (service_role bypasses RLS anyway)
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 1: auth_rls_initplan - current_setting() re-evaluation
-- ═══════════════════════════════════════════════════════════════════════════

-- users table: fix update policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (echo_user_id = (select current_setting('app.echo_user_id', true)));

-- users table: fix insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR insert
  WITH CHECK (echo_user_id = (select current_setting('app.echo_user_id', true)));

-- quiz_sessions table: fix insert policy
DROP POLICY IF EXISTS "Users can insert own quiz sessions" ON quiz_sessions;
CREATE POLICY "Users can insert own quiz sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (echo_user_id = (select current_setting('app.echo_user_id', true)));

-- tower_progress table: fix select policy
DROP POLICY IF EXISTS "Users can view their own tower progress" ON tower_progress;
CREATE POLICY "Users can view their own tower progress"
  ON tower_progress FOR SELECT
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- tower_floor_attempts table: fix select policy
DROP POLICY IF EXISTS "Users can view their own tower attempts" ON tower_floor_attempts;
CREATE POLICY "Users can view their own tower attempts"
  ON tower_floor_attempts FOR SELECT
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- user_tower_achievements table: fix select policy
DROP POLICY IF EXISTS "Users can view their own tower achievements" ON user_tower_achievements;
CREATE POLICY "Users can view their own tower achievements"
  ON user_tower_achievements FOR SELECT
  USING (echo_user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 2: multiple_permissive_policies - Remove redundant "Service role" policies
-- Note: service_role key bypasses RLS entirely, so these policies are unnecessary
-- and create duplicate permissive SELECT policies
-- ═══════════════════════════════════════════════════════════════════════════

-- tower_progress: remove redundant service role policy
DROP POLICY IF EXISTS "Service role can manage tower progress" ON tower_progress;

-- tower_floor_attempts: remove redundant service role policy
DROP POLICY IF EXISTS "Service role can manage tower attempts" ON tower_floor_attempts;

-- user_tower_achievements: remove redundant service role policy
DROP POLICY IF EXISTS "Service role can manage user tower achievements" ON user_tower_achievements;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! Run this migration to clear the Supabase Advisor warnings.
-- ═══════════════════════════════════════════════════════════════════════════
