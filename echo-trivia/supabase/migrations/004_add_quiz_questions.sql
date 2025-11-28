-- Add quiz_questions table to store full question data for history review
-- This allows users to view their complete quiz history across devices

create table if not exists public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.quiz_sessions(id) on delete cascade not null,
  question_id text not null, -- The original question ID from the quiz
  question_type text not null, -- 'multiple_choice', 'true_false', 'short_answer'
  category text not null,
  difficulty text, -- 'easy', 'medium', 'hard'
  prompt text not null, -- The question text
  choices jsonb, -- Array of {id, text} for MCQ
  correct_answer text not null, -- The correct answer
  explanation text, -- Optional explanation
  question_order integer not null, -- Order in the quiz (0-indexed)
  created_at timestamp with time zone default now()
);

-- Index for fast lookups by session
create index if not exists idx_quiz_questions_session_id on public.quiz_questions(session_id);

-- Enable RLS
alter table public.quiz_questions enable row level security;

-- Policy: Users can only see their own quiz questions
create policy "Users can view own quiz questions"
  on public.quiz_questions for select
  using (
    session_id in (
      select id from public.quiz_sessions
      where echo_user_id = auth.uid()::text
    )
  );

-- Policy: Service role can insert (used by API)
create policy "Service role can insert quiz questions"
  on public.quiz_questions for insert
  with check (true);

-- Grant permissions
grant select on public.quiz_questions to authenticated;
grant all on public.quiz_questions to service_role;
