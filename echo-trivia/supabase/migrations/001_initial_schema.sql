-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  echo_user_id text unique not null,
  username text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quiz sessions table
create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  echo_user_id text not null,
  category text not null,
  num_questions integer not null,
  correct_answers integer not null,
  total_questions integer not null,
  score_percentage numeric not null,
  difficulty text,
  quiz_type text,
  is_daily boolean default false,
  daily_date date,
  title text,
  completed_at timestamp with time zone default now(),
  time_taken integer, -- in seconds
  created_at timestamp with time zone default now()
);

-- Achievements table
create table public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  tier text not null, -- 'bronze', 'silver', 'gold', 'platinum'
  created_at timestamp with time zone default now()
);

-- User achievements table
create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  echo_user_id text not null,
  achievement_id text references public.achievements(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique(user_id, achievement_id)
);

-- Daily streaks table
create table public.daily_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  echo_user_id text unique not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for better query performance
create index idx_quiz_sessions_user_id on public.quiz_sessions(user_id);
create index idx_quiz_sessions_echo_user_id on public.quiz_sessions(echo_user_id);
create index idx_quiz_sessions_completed_at on public.quiz_sessions(completed_at desc);
create index idx_quiz_sessions_score on public.quiz_sessions(score_percentage desc);
create index idx_quiz_sessions_daily on public.quiz_sessions(is_daily, daily_date);
create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_user_achievements_echo_user_id on public.user_achievements(echo_user_id);
create index idx_daily_streaks_echo_user_id on public.daily_streaks(echo_user_id);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_streaks enable row level security;

-- RLS Policies

-- Users: Anyone can read, users can update their own profile
create policy "Users are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (echo_user_id = current_setting('app.echo_user_id', true));

create policy "Users can insert own profile"
  on public.users for insert
  with check (echo_user_id = current_setting('app.echo_user_id', true));

-- Quiz sessions: Anyone can read, authenticated users can insert their own
create policy "Quiz sessions are viewable by everyone"
  on public.quiz_sessions for select
  using (true);

create policy "Users can insert own quiz sessions"
  on public.quiz_sessions for insert
  with check (echo_user_id = current_setting('app.echo_user_id', true));

-- Achievements: Everyone can read
create policy "Achievements are viewable by everyone"
  on public.achievements for select
  using (true);

-- User achievements: Everyone can read, users can't manually insert (done via function)
create policy "User achievements are viewable by everyone"
  on public.user_achievements for select
  using (true);

-- Daily streaks: Everyone can read
create policy "Daily streaks are viewable by everyone"
  on public.daily_streaks for select
  using (true);

-- Insert initial achievements
insert into public.achievements (id, name, description, icon, tier) values
  ('first_steps', 'First Steps', 'Complete your first quiz', '🎯', 'bronze'),
  ('daily_devotee', 'Daily Devotee', 'Complete a daily challenge', '📅', 'bronze'),
  ('perfect_score', 'Perfect Score', 'Achieve 100% on any quiz', '💯', 'silver'),
  ('streak_master', 'Streak Master', 'Maintain a 7-day streak', '🔥', 'gold'),
  ('century_club', 'Century Club', 'Complete 100 quizzes', '💯', 'platinum');

-- Function to get or create user
create or replace function public.get_or_create_user(p_echo_user_id text, p_username text default null)
returns uuid
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  -- Try to get existing user
  select id into v_user_id
  from public.users
  where echo_user_id = p_echo_user_id;

  -- If not exists, create new user
  if v_user_id is null then
    insert into public.users (echo_user_id, username)
    values (p_echo_user_id, p_username)
    returning id into v_user_id;
  end if;

  return v_user_id;
end;
$$;

-- Function to check and award achievements
create or replace function public.check_and_award_achievements(p_echo_user_id text)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_quiz_count integer;
  v_perfect_count integer;
  v_daily_count integer;
  v_current_streak integer;
begin
  -- Get user ID
  select id into v_user_id from public.users where echo_user_id = p_echo_user_id;
  if v_user_id is null then return; end if;

  -- Get stats
  select count(*) into v_quiz_count
  from public.quiz_sessions where echo_user_id = p_echo_user_id;

  select count(*) into v_perfect_count
  from public.quiz_sessions where echo_user_id = p_echo_user_id and score_percentage = 100;

  select count(*) into v_daily_count
  from public.quiz_sessions where echo_user_id = p_echo_user_id and is_daily = true;

  select current_streak into v_current_streak
  from public.daily_streaks where echo_user_id = p_echo_user_id;

  -- Award "First Steps" if completed at least 1 quiz
  if v_quiz_count >= 1 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'first_steps')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Daily Devotee" if completed at least 1 daily quiz
  if v_daily_count >= 1 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'daily_devotee')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Perfect Score" if scored 100% at least once
  if v_perfect_count >= 1 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'perfect_score')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Streak Master" if current streak >= 7
  if v_current_streak >= 7 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'streak_master')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Century Club" if completed 100+ quizzes
  if v_quiz_count >= 100 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'century_club')
    on conflict (user_id, achievement_id) do nothing;
  end if;
end;
$$;

-- Function to update daily streak
create or replace function public.update_daily_streak(p_echo_user_id text, p_completed_date date)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_new_streak integer;
begin
  -- Get user ID
  select id into v_user_id from public.users where echo_user_id = p_echo_user_id;
  if v_user_id is null then return; end if;

  -- Get or create streak record
  select last_completed_date, current_streak, longest_streak
  into v_last_date, v_current_streak, v_longest_streak
  from public.daily_streaks
  where echo_user_id = p_echo_user_id;

  -- If no record exists, create one
  if v_last_date is null then
    insert into public.daily_streaks (user_id, echo_user_id, current_streak, longest_streak, last_completed_date)
    values (v_user_id, p_echo_user_id, 1, 1, p_completed_date);
    return;
  end if;

  -- If already completed today, do nothing
  if v_last_date = p_completed_date then
    return;
  end if;

  -- If completed yesterday, increment streak
  if v_last_date = p_completed_date - interval '1 day' then
    v_new_streak := v_current_streak + 1;
  else
    -- Streak broken, reset to 1
    v_new_streak := 1;
  end if;

  -- Update streak
  update public.daily_streaks
  set
    current_streak = v_new_streak,
    longest_streak = greatest(v_longest_streak, v_new_streak),
    last_completed_date = p_completed_date,
    updated_at = now()
  where echo_user_id = p_echo_user_id;
end;
$$;
