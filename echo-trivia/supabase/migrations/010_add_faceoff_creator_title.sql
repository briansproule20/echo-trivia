-- Add creator_title column to faceoff_challenges
alter table public.faceoff_challenges
add column if not exists creator_title text;
