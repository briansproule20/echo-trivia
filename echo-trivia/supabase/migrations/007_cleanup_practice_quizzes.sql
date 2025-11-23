-- Check for practice quizzes that were incorrectly marked as daily
-- Run this first to see what needs fixing:
-- SELECT id, category, is_daily, game_mode, score_percentage, completed_at
-- FROM quiz_sessions
-- WHERE game_mode = 'practice' AND is_daily = true
-- ORDER BY completed_at DESC;

-- Fix practice quizzes that are incorrectly marked as is_daily=true
-- These should have is_daily=false since they're practice mode
UPDATE quiz_sessions
SET is_daily = false
WHERE game_mode = 'practice' AND is_daily = true;

-- Verify: Check that all practice quizzes now have is_daily=false
-- SELECT COUNT(*) as fixed_count
-- FROM quiz_sessions
-- WHERE game_mode = 'practice' AND is_daily = false;

-- Also fix any quizzes that don't have a game_mode set yet but should be practice
-- (These are quizzes from before the game_mode column existed)
UPDATE quiz_sessions
SET is_daily = false
WHERE game_mode = 'practice' AND is_daily = true;
