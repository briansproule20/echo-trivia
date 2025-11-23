-- Add game_mode column to quiz_sessions table
-- This will track which game mode the quiz was played in:
-- 'daily' = Daily Challenge
-- 'practice' = Practice Mode
-- 'endless' = Endless Survival
-- 'jeopardy' = Jeopardy Mode
-- 'campaign' = The Wizard's Tower Campaign

alter table public.quiz_sessions
add column game_mode text;

-- Create index for efficient querying by game mode
create index idx_quiz_sessions_game_mode on public.quiz_sessions(game_mode);

-- Create index for efficient leaderboard queries (game_mode + completed_at)
create index idx_quiz_sessions_game_mode_completed on public.quiz_sessions(game_mode, completed_at desc);

-- Backfill existing data: if is_daily = true, set game_mode to 'daily', otherwise 'practice'
update public.quiz_sessions
set game_mode = case
  when is_daily = true then 'daily'
  else 'practice'
end
where game_mode is null;

-- Add comment for documentation
comment on column public.quiz_sessions.game_mode is 'Game mode type: daily, practice, endless, jeopardy, campaign';
