-- Add avatar_id column to users table
ALTER TABLE public.users
ADD COLUMN avatar_id text DEFAULT NULL;

-- Create a function to assign random avatar to users without one
CREATE OR REPLACE FUNCTION public.get_random_avatar_id()
RETURNS text
LANGUAGE sql
AS $$
  SELECT (ARRAY['skull', 'ghost', 'cat', 'swords', 'shield', 'target', 'glasses', 'tree', 'flame', 'zap', 'crown', 'anchor', 'bird', 'bug', 'snowflake', 'cherry'])[floor(random() * 16 + 1)];
$$;

-- Assign random avatars to existing users who don't have one
UPDATE public.users
SET avatar_id = public.get_random_avatar_id()
WHERE avatar_id IS NULL;

-- Update get_or_create_user function to assign random avatar
CREATE OR REPLACE FUNCTION public.get_or_create_user(p_echo_user_id text, p_username text default null)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Try to get existing user
  SELECT id INTO v_user_id
  FROM public.users
  WHERE echo_user_id = p_echo_user_id;

  -- If not exists, create new user with random avatar
  IF v_user_id IS NULL THEN
    INSERT INTO public.users (echo_user_id, username, avatar_id)
    VALUES (p_echo_user_id, p_username, public.get_random_avatar_id())
    RETURNING id INTO v_user_id;
  END IF;

  RETURN v_user_id;
END;
$$;
