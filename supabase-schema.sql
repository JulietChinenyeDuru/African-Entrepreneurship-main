-- ============================================================
-- ApplyAI (jobapp.best) Supabase Schema
-- Ran this in my Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────
create table public.profiles (
  id                        uuid references auth.users(id) on delete cascade primary key,
  email                     text,
  full_name                 text,
  avatar_url                text,
  plan                      text not null default 'free',
  applications_used         int not null default 0,
  applications_used_month   int not null default 0,
  applications_reset_date   date default current_date,
  stripe_customer_id        text,
  stripe_subscription_id    text,
  push_token                text,
  -- Auto-apply email settings
  email_provider            text,
  email_address             text,
  email_app_password        text,
  auto_apply_enabled        boolean default false,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── cv_profiles ───────────────────────────────────────────────
create table public.cv_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete cascade,
  cv_raw          text not null,
  career_level    text,
  top_skills      text[],
  suggested_roles text[],
  ats_score       int,
  ats_reason      text,
  quick_wins      text[],
  summary         text,
  created_at      timestamptz not null default now()
);

alter table public.cv_profiles enable row level security;

create policy "Users manage own CVs"
  on public.cv_profiles for all using (auth.uid() = user_id);

-- ── applications ──────────────────────────────────────────────
create table public.applications (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references public.profiles(id) on delete cascade,
  job_title           text not null,
  company             text not null,
  location            text,
  salary              text,
  job_url             text,
  job_description     text,
  recruiter_email     text,
  match_score         int,
  tailored_cv         text,
  cover_letter        text,
  ats_keywords        jsonb,
  changes_made        text[],
  interview_prep      jsonb,
  status              text not null default 'submitted',
  submission_method   text default 'manual',
  email_message_id    text,
  user_notified_at    timestamptz,
  submitted_at        timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "Users manage own applications"
  on public.applications for all using (auth.uid() = user_id);

-- ── plan limits function ──────────────────────────────────────
create or replace function public.check_plan_limit(user_uuid uuid)
returns boolean as $$
declare
  user_plan text;
  used int;
begin
  select plan, applications_used_month
  into user_plan, used
  from public.profiles
  where id = user_uuid;

  if user_plan = 'pro' then return true; end if;
  if user_plan = 'africa' and used < 30 then return true; end if;
  if used < 5 then return true; end if;
  return false;
end;
$$ language plpgsql security definer;
