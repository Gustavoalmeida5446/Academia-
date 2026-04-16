create extension if not exists pgcrypto;

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  name text not null,
  sets text not null default '',
  reps text not null default '',
  video_query text not null default '',
  muscle_group text not null default '',
  media_url text not null default '',
  external_id text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_name text not null,
  exercise_name text not null,
  checked boolean not null default false,
  used_weight numeric,
  updated_at timestamptz not null default now(),
  unique (user_id, workout_name, exercise_name)
);

create table if not exists public.workout_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_name text not null,
  record_date date not null,
  body_weight numeric,
  completed_at timestamptz not null default now(),
  exercises jsonb not null default '[]'::jsonb
);

create table if not exists public.body_weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  record_date date not null,
  weight numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, record_date)
);

create table if not exists public.foods (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  external_id text not null default '',
  name text not null,
  protein numeric not null default 0,
  calories numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  serving_size numeric not null default 100,
  serving_unit text not null default 'g',
  source text not null default 'manual',
  sort_order integer not null default 0,
  primary key (user_id, id)
);

create table if not exists public.diet_meals (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  day_key text not null,
  meal_name text not null,
  food_id text not null,
  servings numeric not null default 1,
  sort_order integer not null default 0,
  primary key (user_id, id)
);

create table if not exists public.plan_parameters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  sex text not null default 'male',
  age integer not null default 0,
  height_cm numeric not null default 0,
  weight_kg numeric not null default 0,
  activity_factor numeric not null default 1,
  deficit_percent numeric not null default 0,
  protein_target_g numeric not null default 0,
  carbs_target_g numeric not null default 0,
  wake_time text not null default '',
  training_time text not null default '',
  meal_time text not null default '',
  sleep_time text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  record_date date not null,
  workout_done boolean not null default false,
  diet_done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, record_date)
);

alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_state enable row level security;
alter table public.workout_history enable row level security;
alter table public.body_weight_entries enable row level security;
alter table public.foods enable row level security;
alter table public.diet_meals enable row level security;
alter table public.plan_parameters enable row level security;
alter table public.daily_logs enable row level security;

create policy "Users can read own workouts" on public.workouts for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own workouts" on public.workouts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own exercises" on public.exercises for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own exercises" on public.exercises for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own exercise state" on public.exercise_state for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own exercise state" on public.exercise_state for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own history" on public.workout_history for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own history" on public.workout_history for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own body weight" on public.body_weight_entries for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own body weight" on public.body_weight_entries for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own foods" on public.foods for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own foods" on public.foods for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own diet meals" on public.diet_meals for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own diet meals" on public.diet_meals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own parameters" on public.plan_parameters for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own parameters" on public.plan_parameters for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own daily logs" on public.daily_logs for select to authenticated using (auth.uid() = user_id);
create policy "Users can write own daily logs" on public.daily_logs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
