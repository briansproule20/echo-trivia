-- RPC function to get or create a user
CREATE OR REPLACE FUNCTION get_or_create_user(
  p_echo_user_id text,
  p_username text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Try to find existing user
  SELECT id INTO v_user_id
  FROM public.users
  WHERE echo_user_id = p_echo_user_id;
  
  -- If not found, create new user
  IF v_user_id IS NULL THEN
    INSERT INTO public.users (echo_user_id, username)
    VALUES (p_echo_user_id, p_username)
    RETURNING id INTO v_user_id;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to update daily streak
CREATE OR REPLACE FUNCTION update_daily_streak(
  p_echo_user_id text,
  p_completed_date date
) RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_current_streak integer;
  v_longest_streak integer;
  v_last_completed date;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM public.users
  WHERE echo_user_id = p_echo_user_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Get current streak info
  SELECT current_streak, longest_streak, last_completed_date
  INTO v_current_streak, v_longest_streak, v_last_completed
  FROM public.daily_streaks
  WHERE echo_user_id = p_echo_user_id;
  
  -- If no streak record exists, create one
  IF v_current_streak IS NULL THEN
    INSERT INTO public.daily_streaks (
      user_id,
      echo_user_id,
      current_streak,
      longest_streak,
      last_completed_date
    ) VALUES (
      v_user_id,
      p_echo_user_id,
      1,
      1,
      p_completed_date
    );
    RETURN;
  END IF;
  
  -- Check if this is a consecutive day
  IF v_last_completed = p_completed_date - INTERVAL '1 day' THEN
    -- Increment streak
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
  ELSIF v_last_completed < p_completed_date THEN
    -- Streak broken, reset to 1
    v_current_streak := 1;
  END IF;
  -- If same day, don't update (prevent multiple completions same day)
  
  -- Update streak record
  UPDATE public.daily_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_completed_date = p_completed_date,
      updated_at = now()
  WHERE echo_user_id = p_echo_user_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(
  p_echo_user_id text
) RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_total_quizzes integer;
  v_perfect_scores integer;
  v_current_streak integer;
  v_categories_played integer;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM public.users
  WHERE echo_user_id = p_echo_user_id;
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get user stats
  SELECT COUNT(*) INTO v_total_quizzes
  FROM public.quiz_sessions
  WHERE echo_user_id = p_echo_user_id;
  
  SELECT COUNT(*) INTO v_perfect_scores
  FROM public.quiz_sessions
  WHERE echo_user_id = p_echo_user_id
    AND score_percentage = 100;
  
  SELECT COALESCE(current_streak, 0) INTO v_current_streak
  FROM public.daily_streaks
  WHERE echo_user_id = p_echo_user_id;
  
  SELECT COUNT(DISTINCT category) INTO v_categories_played
  FROM public.quiz_sessions
  WHERE echo_user_id = p_echo_user_id;
  
  -- Award "first_quiz" achievement
  IF v_total_quizzes >= 1 THEN
    INSERT INTO public.user_achievements (user_id, echo_user_id, achievement_id)
    SELECT v_user_id, p_echo_user_id, 'first_quiz'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE echo_user_id = p_echo_user_id AND achievement_id = 'first_quiz'
    );
  END IF;
  
  -- Award "quiz_master_10" achievement
  IF v_total_quizzes >= 10 THEN
    INSERT INTO public.user_achievements (user_id, echo_user_id, achievement_id)
    SELECT v_user_id, p_echo_user_id, 'quiz_master_10'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE echo_user_id = p_echo_user_id AND achievement_id = 'quiz_master_10'
    );
  END IF;
  
  -- Award "quiz_master_50" achievement
  IF v_total_quizzes >= 50 THEN
    INSERT INTO public.user_achievements (user_id, echo_user_id, achievement_id)
    SELECT v_user_id, p_echo_user_id, 'quiz_master_50'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE echo_user_id = p_echo_user_id AND achievement_id = 'quiz_master_50'
    );
  END IF;
  
  -- Award "perfect_score" achievement
  IF v_perfect_scores >= 1 THEN
    INSERT INTO public.user_achievements (user_id, echo_user_id, achievement_id)
    SELECT v_user_id, p_echo_user_id, 'perfect_score'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE echo_user_id = p_echo_user_id AND achievement_id = 'perfect_score'
    );
  END IF;
  
  -- Award "streak_7" achievement
  IF v_current_streak >= 7 THEN
    INSERT INTO public.user_achievements (user_id, echo_user_id, achievement_id)
    SELECT v_user_id, p_echo_user_id, 'streak_7'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE echo_user_id = p_echo_user_id AND achievement_id = 'streak_7'
    );
  END IF;
  
  -- Award "category_explorer" achievement (5 different categories)
  IF v_categories_played >= 5 THEN
    INSERT INTO public.user_achievements (user_id, echo_user_id, achievement_id)
    SELECT v_user_id, p_echo_user_id, 'category_explorer'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE echo_user_id = p_echo_user_id AND achievement_id = 'category_explorer'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON public.users FOR UPDATE USING (true);

-- RLS Policies for quiz_sessions table
CREATE POLICY "Anyone can view quiz sessions" ON public.quiz_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own sessions" ON public.quiz_sessions FOR UPDATE USING (true);

-- RLS Policies for achievements table
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Only admins can modify achievements" ON public.achievements FOR ALL USING (false);

-- RLS Policies for user_achievements table
CREATE POLICY "Anyone can view user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- RLS Policies for daily_streaks table
CREATE POLICY "Anyone can view streaks" ON public.daily_streaks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert streaks" ON public.daily_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update streaks" ON public.daily_streaks FOR UPDATE USING (true);
