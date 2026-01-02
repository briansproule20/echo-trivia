-- ═══════════════════════════════════════════════════════════════════════════
-- HOTFIX: Restore INSERT/UPDATE policies that were accidentally removed
-- The "Anyone can..." policies were actually needed for service operations
-- ═══════════════════════════════════════════════════════════════════════════

-- quiz_sessions: restore insert policy
DROP POLICY IF EXISTS "Anyone can insert quiz sessions" ON quiz_sessions;
CREATE POLICY "Anyone can insert quiz sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (true);

-- users: restore insert and update policies
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
CREATE POLICY "Users can insert themselves"
  ON users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update themselves" ON users;
CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (true);

-- tower_progress: restore write policies (we dropped the service role policy)
DROP POLICY IF EXISTS "Service can manage tower progress" ON tower_progress;
CREATE POLICY "Service can manage tower progress"
  ON tower_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- tower_floor_attempts: restore write policies
DROP POLICY IF EXISTS "Service can manage tower attempts" ON tower_floor_attempts;
CREATE POLICY "Service can manage tower attempts"
  ON tower_floor_attempts FOR ALL
  USING (true)
  WITH CHECK (true);

-- user_tower_achievements: restore write policies
DROP POLICY IF EXISTS "Service can manage user tower achievements" ON user_tower_achievements;
CREATE POLICY "Service can manage user tower achievements"
  ON user_tower_achievements FOR ALL
  USING (true)
  WITH CHECK (true);

-- daily_streaks: restore insert/update policies
DROP POLICY IF EXISTS "Anyone can insert daily streaks" ON daily_streaks;
CREATE POLICY "Anyone can insert daily streaks"
  ON daily_streaks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update daily streaks" ON daily_streaks;
CREATE POLICY "Anyone can update daily streaks"
  ON daily_streaks FOR UPDATE
  USING (true);

-- user_achievements: restore write policies
DROP POLICY IF EXISTS "Service can manage user achievements" ON user_achievements;
CREATE POLICY "Service can manage user achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);
