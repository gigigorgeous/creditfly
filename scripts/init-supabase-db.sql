-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_admin boolean default false
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);

create policy "Users can insert their own profile."
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id);

-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

-- Set up Realtime!
alter publication supabase_realtime add table profiles;

-- Create a table for music generations
create table music_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  prompt text not null,
  audio_url text,
  created_at timestamp with time zone default now()
);

alter table music_generations enable row level security;

create policy "Music generations are viewable by owner."
  on music_generations for select using (auth.uid() = user_id);

create policy "Users can insert their own music generations."
  on music_generations for insert with check (auth.uid() = user_id);
