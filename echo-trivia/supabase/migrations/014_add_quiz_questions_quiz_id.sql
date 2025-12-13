-- Add quiz_id column to quiz_questions table
-- This was missing from the original schema but the submit code was trying to insert it
-- The quiz_id is needed to lookup answer keys for historical sessions

ALTER TABLE public.quiz_questions
ADD COLUMN IF NOT EXISTS quiz_id text;

-- Index for looking up questions by quiz_id
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
