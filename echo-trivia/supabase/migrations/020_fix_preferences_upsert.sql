-- Fix upsert function to allow clearing nullable preferences (tone, style)
-- COALESCE was treating null as "keep existing" instead of "set to null"

CREATE OR REPLACE FUNCTION upsert_freeplay_preferences(
  p_echo_user_id text,
  p_difficulty text DEFAULT NULL,
  p_question_count integer DEFAULT NULL,
  p_preferred_tone text DEFAULT '__UNCHANGED__',
  p_explanation_style text DEFAULT '__UNCHANGED__',
  p_extras jsonb DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  INSERT INTO public.user_freeplay_preferences (
    echo_user_id,
    difficulty,
    question_count,
    preferred_tone,
    explanation_style,
    extras,
    updated_at
  ) VALUES (
    p_echo_user_id,
    COALESCE(p_difficulty, 'mixed'),
    COALESCE(p_question_count, 5),
    CASE WHEN p_preferred_tone = '__UNCHANGED__' THEN NULL ELSE p_preferred_tone END,
    CASE WHEN p_explanation_style = '__UNCHANGED__' THEN NULL ELSE p_explanation_style END,
    COALESCE(p_extras, '{}'),
    now()
  )
  ON CONFLICT (echo_user_id) DO UPDATE SET
    difficulty = COALESCE(p_difficulty, user_freeplay_preferences.difficulty),
    question_count = COALESCE(p_question_count, user_freeplay_preferences.question_count),
    -- For nullable fields: '__UNCHANGED__' means keep existing, null means clear, otherwise set new value
    preferred_tone = CASE
      WHEN p_preferred_tone = '__UNCHANGED__' THEN user_freeplay_preferences.preferred_tone
      ELSE p_preferred_tone
    END,
    explanation_style = CASE
      WHEN p_explanation_style = '__UNCHANGED__' THEN user_freeplay_preferences.explanation_style
      ELSE p_explanation_style
    END,
    extras = COALESCE(p_extras, user_freeplay_preferences.extras),
    updated_at = now()
  RETURNING to_jsonb(user_freeplay_preferences.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
