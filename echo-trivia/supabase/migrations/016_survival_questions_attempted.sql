-- Add questions_attempted column to survival_runs
-- Stores the questions, answers, and explanations for review

ALTER TABLE survival_runs
ADD COLUMN IF NOT EXISTS questions_attempted JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN survival_runs.questions_attempted IS 'Array of {question_id, prompt, category, user_answer, correct_answer, is_correct, explanation}';
