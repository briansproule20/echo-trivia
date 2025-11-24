-- Add creator_score column to faceoff_challenges table
alter table public.faceoff_challenges
add column creator_score integer;

-- Add comment for documentation
comment on column public.faceoff_challenges.creator_score is 'The score the challenge creator achieved on this quiz';
