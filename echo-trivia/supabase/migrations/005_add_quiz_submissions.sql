-- Quiz submissions table to store individual answers
-- This prevents score manipulation and allows proper validation
create table public.quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.quiz_sessions(id) on delete cascade not null,
  question_id text not null,
  user_response text not null,
  correct_answer text not null,
  is_correct boolean not null,
  time_ms integer, -- time taken to answer in milliseconds
  created_at timestamp with time zone default now()
);

-- Indexes for better query performance
create index idx_quiz_submissions_session_id on public.quiz_submissions(session_id);
create index idx_quiz_submissions_created_at on public.quiz_submissions(created_at desc);

-- Enable Row Level Security
alter table public.quiz_submissions enable row level security;

-- RLS Policies - Anyone can read submissions
create policy "Quiz submissions are viewable by everyone"
  on public.quiz_submissions for select
  using (true);

-- Only allow inserts through the quiz submission API (handled by service role)
-- Users cannot directly insert quiz submissions
create policy "Quiz submissions can only be inserted via API"
  on public.quiz_submissions for insert
  with check (false); -- This will be bypassed by service role key in API
