-- Backfill tower_attempt_id for existing campaign quiz_sessions that are missing it
-- Matches by echo_user_id, category, and timestamp within 5 minutes

UPDATE quiz_sessions qs
SET tower_attempt_id = (
  SELECT tfa.id
  FROM tower_floor_attempts tfa
  WHERE tfa.echo_user_id = qs.echo_user_id
    AND tfa.category = qs.category
    AND ABS(EXTRACT(EPOCH FROM (tfa.created_at - qs.completed_at))) < 300
  ORDER BY ABS(EXTRACT(EPOCH FROM (tfa.created_at - qs.completed_at)))
  LIMIT 1
)
WHERE qs.game_mode = 'campaign'
  AND qs.tower_attempt_id IS NULL;
