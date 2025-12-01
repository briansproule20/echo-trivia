-- Migration: Add server-side quiz answer storage for security
-- This prevents clients from seeing answers and ensures server-side validation

-- Table to store quiz answer keys (server-side only)
-- Answers are stored here when quiz is generated and never sent to client
create table if not exists quiz_answer_keys (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null unique,
  answers jsonb not null, -- Array of {question_id, answer, type, explanation}
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours') -- Auto-expire after 24 hours
);

-- Index for quick lookup by quiz_id
create index if not exists idx_quiz_answer_keys_quiz_id on quiz_answer_keys(quiz_id);

-- Index for cleanup of expired entries
create index if not exists idx_quiz_answer_keys_expires_at on quiz_answer_keys(expires_at);

-- Table to track individual answer submissions (for server-side scoring)
-- This tracks what answers were submitted and evaluated per quiz session
create table if not exists quiz_evaluations (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null,
  question_id text not null,
  user_response text not null,
  is_correct boolean not null,
  evaluated_at timestamptz default now(),
  -- Prevent duplicate submissions for same question in same quiz
  unique(quiz_id, question_id)
);

-- Index for quick lookup by quiz_id
create index if not exists idx_quiz_evaluations_quiz_id on quiz_evaluations(quiz_id);

-- RLS Policies: These tables should ONLY be accessible by the server (service role)
-- Regular users should never have direct access

-- Disable RLS for now (service role will access these tables directly)
-- In production, you might want to enable RLS and use service_role key
alter table quiz_answer_keys enable row level security;
alter table quiz_evaluations enable row level security;

-- No public access policies - only service role can access
-- This ensures clients can never directly query answer keys

-- Function to cleanup expired quiz answer keys (call periodically)
create or replace function cleanup_expired_quiz_keys()
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  -- Delete expired answer keys
  with deleted as (
    delete from quiz_answer_keys
    where expires_at < now()
    returning *
  )
  select count(*) into deleted_count from deleted;

  -- Also delete evaluations for quizzes older than 24 hours
  delete from quiz_evaluations
  where evaluated_at < now() - interval '24 hours';

  return deleted_count;
end;
$$;
