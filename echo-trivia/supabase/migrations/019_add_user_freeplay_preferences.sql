-- User freeplay preferences table
-- Stores quiz preferences for freeplay mode, synced from client

CREATE TABLE IF NOT EXISTS public.user_freeplay_preferences (
  -- Primary key is echo_user_id for direct lookup
  echo_user_id text PRIMARY KEY,

  -- Core stable preferences as typed columns
  difficulty text DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  question_count integer DEFAULT 5 CHECK (question_count IN (5, 10)),
  preferred_tone text CHECK (preferred_tone IS NULL OR preferred_tone IN ('scholarly', 'playful', 'cinematic', 'pub_quiz', 'deadpan', 'sports_banter')),
  explanation_style text CHECK (explanation_style IS NULL OR explanation_style IN ('one_line_fact', 'compare_contrast', 'mini_story', 'why_wrong')),

  -- Flexible bucket for future/experimental preferences
  extras jsonb DEFAULT '{}',

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_freeplay_preferences_echo_user_id
  ON public.user_freeplay_preferences(echo_user_id);

-- RLS policies
ALTER TABLE public.user_freeplay_preferences ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (app handles auth via Echo)
CREATE POLICY "Allow all access to user_freeplay_preferences"
  ON public.user_freeplay_preferences
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Upsert function for atomic preference updates
CREATE OR REPLACE FUNCTION upsert_freeplay_preferences(
  p_echo_user_id text,
  p_difficulty text DEFAULT NULL,
  p_question_count integer DEFAULT NULL,
  p_preferred_tone text DEFAULT NULL,
  p_explanation_style text DEFAULT NULL,
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
    p_preferred_tone,
    p_explanation_style,
    COALESCE(p_extras, '{}'),
    now()
  )
  ON CONFLICT (echo_user_id) DO UPDATE SET
    difficulty = COALESCE(p_difficulty, user_freeplay_preferences.difficulty),
    question_count = COALESCE(p_question_count, user_freeplay_preferences.question_count),
    preferred_tone = COALESCE(p_preferred_tone, user_freeplay_preferences.preferred_tone),
    explanation_style = COALESCE(p_explanation_style, user_freeplay_preferences.explanation_style),
    extras = COALESCE(p_extras, user_freeplay_preferences.extras),
    updated_at = now()
  RETURNING to_jsonb(user_freeplay_preferences.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
