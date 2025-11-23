-- Create faceoff_challenges table for shareable quiz challenges
create table public.faceoff_challenges (
  id uuid primary key default gen_random_uuid(),
  creator_echo_user_id text not null,
  creator_username text,

  -- Store the entire quiz as JSON (questions, answers, choices, explanations)
  quiz_data jsonb not null,

  -- Quiz settings for display
  settings jsonb not null, -- {category, difficulty, num_questions, quiz_type}

  -- Shareable short code (e.g., "abc123")
  share_code text unique not null,

  -- Timestamps
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '30 days'),

  -- Stats
  times_played integer default 0,

  -- Indexes
  constraint faceoff_challenges_share_code_key unique (share_code)
);

-- Create index for fast lookups by share code
create index idx_faceoff_challenges_share_code on public.faceoff_challenges(share_code);

-- Create index for creator lookups
create index idx_faceoff_challenges_creator on public.faceoff_challenges(creator_echo_user_id);

-- RLS policies
alter table public.faceoff_challenges enable row level security;

-- Anyone can read challenges (they're meant to be shared)
create policy "Faceoff challenges are publicly readable"
  on public.faceoff_challenges
  for select
  using (true);

-- Authenticated users can create challenges
create policy "Authenticated users can create faceoff challenges"
  on public.faceoff_challenges
  for insert
  with check (true);

-- Only creator can update their challenges
create policy "Creators can update their own challenges"
  on public.faceoff_challenges
  for update
  using (creator_echo_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to generate unique share codes
create or replace function generate_share_code()
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer;
  code_exists boolean;
begin
  loop
    result := '';
    -- Generate 6-character code
    for i in 1..6 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    end loop;

    -- Check if code already exists
    select exists(select 1 from public.faceoff_challenges where share_code = result) into code_exists;

    -- If unique, return it
    if not code_exists then
      return result;
    end if;
  end loop;
end;
$$;

-- Add comment for documentation
comment on table public.faceoff_challenges is 'Stores shareable quiz challenges for Faceoff game mode';
