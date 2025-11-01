-- Creates user_plans table to track plan tier and credit consumption per Supabase auth user
-- Run via Supabase CLI: supabase db push

create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_tier text not null default 'free',
  monthly_credit_limit integer not null default 1000,
  credits_used integer not null default 0,
  reset_at timestamptz not null default date_trunc('month', timezone('utc', now())) + interval '1 month',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_plans_plan_tier_idx on public.user_plans (plan_tier);

alter table public.user_plans enable row level security;

create or replace function public.set_user_plans_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_plans_set_updated_at on public.user_plans;

create trigger user_plans_set_updated_at
before update on public.user_plans
for each row execute function public.set_user_plans_updated_at();

create or replace function public.ensure_user_plan(p_user_id uuid)
returns public.user_plans
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.user_plans;
  current_ts timestamptz := timezone('utc', now());
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  select * into result from public.user_plans where user_id = p_user_id;

  if not found then
    insert into public.user_plans (user_id, reset_at)
    values (p_user_id, date_trunc('month', current_ts) + interval '1 month')
    returning * into result;
  end if;

  if result.reset_at <= current_ts then
    update public.user_plans
    set credits_used = 0,
        reset_at = date_trunc('month', current_ts) + interval '1 month',
        updated_at = current_ts
    where user_id = p_user_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.ensure_user_plan(uuid) from public;
grant execute on function public.ensure_user_plan(uuid) to authenticated;

create or replace function public.consume_user_plan_credits(p_user_id uuid, p_credits integer)
returns public.user_plans
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.user_plans;
  current_ts timestamptz := timezone('utc', now());
begin
  if p_credits is null or p_credits <= 0 then
    raise exception 'INVALID_CREDITS';
  end if;

  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  select * into result from public.ensure_user_plan(p_user_id);

  if result.monthly_credit_limit > 0 and result.credits_used + p_credits > result.monthly_credit_limit then
    raise exception 'CREDIT_LIMIT_EXCEEDED';
  end if;

  update public.user_plans
  set credits_used = result.credits_used + p_credits,
      updated_at = current_ts
  where user_id = p_user_id
  returning * into result;

  return result;
end;
$$;

revoke all on function public.consume_user_plan_credits(uuid, integer) from public;
grant execute on function public.consume_user_plan_credits(uuid, integer) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_plans'
      and policyname = 'Users can view their plan'
  ) then
    create policy "Users can view their plan" on public.user_plans
for select using (auth.uid() = user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_plans'
      and policyname = 'Users can update their plan'
  ) then
    create policy "Users can update their plan" on public.user_plans
      for update using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end;
$$;

comment on table public.user_plans is 'Tracks per-user plan tier and credit consumption for managed AI usage.';
comment on function public.consume_user_plan_credits(uuid, integer) is 'Atomically validates limits and increments credit usage for a user plan.';

