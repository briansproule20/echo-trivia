-- Add 30-day streak achievement (Platinum tier)
insert into public.achievements (id, name, description, icon, tier) values
  ('streak_legend', 'Streak Legend', 'Maintain a 30-day streak', '👑', 'platinum');

-- Update the achievement checking function to include streak legend
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
  v_hard_quiz_count integer;
  v_speed_demon_count integer;
  v_categories_count integer;
  v_today_quiz_count integer;
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

  -- Check hard difficulty quizzes
  select count(*) into v_hard_quiz_count
  from public.quiz_sessions
  where echo_user_id = p_echo_user_id and difficulty = 'hard';

  -- Check speed demon (10 questions in under 120 seconds)
  select count(*) into v_speed_demon_count
  from public.quiz_sessions
  where echo_user_id = p_echo_user_id
    and num_questions = 10
    and time_taken is not null
    and time_taken < 120;

  -- Check unique categories
  select count(distinct category) into v_categories_count
  from public.quiz_sessions where echo_user_id = p_echo_user_id;

  -- Check quizzes completed today
  select count(*) into v_today_quiz_count
  from public.quiz_sessions
  where echo_user_id = p_echo_user_id
    and date(completed_at) = current_date;

  -- BRONZE ACHIEVEMENTS

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

  -- SILVER ACHIEVEMENTS

  -- Award "Perfect Score" if scored 100% at least once
  if v_perfect_count >= 1 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'perfect_score')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Hard Mode Master" if completed at least 1 hard quiz
  if v_hard_quiz_count >= 1 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'hard_mode_master')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Quiz Marathon" if completed 5 quizzes today
  if v_today_quiz_count >= 5 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'quiz_marathon')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- GOLD ACHIEVEMENTS

  -- Award "Streak Master" if current streak >= 7
  if v_current_streak >= 7 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'streak_master')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Speed Demon" if completed a 10-question quiz in under 120 seconds
  if v_speed_demon_count >= 1 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'speed_demon')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Knowledge Seeker" if played 10 different categories
  if v_categories_count >= 10 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'knowledge_seeker')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- PLATINUM ACHIEVEMENTS

  -- Award "Century Club" if completed 100+ quizzes
  if v_quiz_count >= 100 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'century_club')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Perfectionist" if achieved 3 perfect scores
  if v_perfect_count >= 3 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'perfectionist')
    on conflict (user_id, achievement_id) do nothing;
  end if;

  -- Award "Streak Legend" if current streak >= 30
  if v_current_streak >= 30 then
    insert into public.user_achievements (user_id, echo_user_id, achievement_id)
    values (v_user_id, p_echo_user_id, 'streak_legend')
    on conflict (user_id, achievement_id) do nothing;
  end if;
end;
$$;
