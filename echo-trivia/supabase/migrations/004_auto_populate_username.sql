-- Update get_or_create_user function to auto-populate username with Echo name if not provided
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
    -- Use provided username (which should be the Echo name by default)
    -- If still null, it will be null in the database
    INSERT INTO public.users (echo_user_id, username)
    VALUES (p_echo_user_id, p_username)
    RETURNING id INTO v_user_id;
  ELSE
    -- If user exists and username is provided, update it
    IF p_username IS NOT NULL AND p_username != '' THEN
      UPDATE public.users
      SET username = p_username,
          updated_at = now()
      WHERE id = v_user_id;
    END IF;
  END IF;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
