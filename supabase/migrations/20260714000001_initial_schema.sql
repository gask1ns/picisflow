-- PicisFlow — Initial Schema
-- Run via Supabase Dashboard SQL Editor or `supabase db push`

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text not null default 'IDR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2. Telegram Links
create table if not exists public.telegram_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  telegram_chat_id bigint unique,
  telegram_username text,
  verification_code text,
  verification_code_expires_at timestamptz,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.telegram_links enable row level security;

create policy "telegram_links_select_own" on public.telegram_links
  for select using (auth.uid() = user_id);

create policy "telegram_links_insert_own" on public.telegram_links
  for insert with check (auth.uid() = user_id);

create policy "telegram_links_update_own" on public.telegram_links
  for update using (auth.uid() = user_id);

create policy "telegram_links_delete_own" on public.telegram_links
  for delete using (auth.uid() = user_id);

-- 3. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  aliases text[] not null default '{}',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name, type)
);

alter table public.categories enable row level security;

create policy "categories_select_own_or_default" on public.categories
  for select using (auth.uid() = user_id or user_id is null);

create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);

create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- 4. Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  description text,
  date date not null default current_date,
  source text not null check (source in ('web', 'telegram')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);

create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- 5. Recurring Transactions
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  description text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  interval_value integer not null default 1 check (interval_value > 0),
  day_of_month integer check (day_of_month between 1 and 31),
  day_of_week integer check (day_of_week between 0 and 6),
  start_date date not null,
  end_date date,
  last_generated_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

create policy "recurring_select_own" on public.recurring_transactions
  for select using (auth.uid() = user_id);

create policy "recurring_insert_own" on public.recurring_transactions
  for insert with check (auth.uid() = user_id);

create policy "recurring_update_own" on public.recurring_transactions
  for update using (auth.uid() = user_id);

create policy "recurring_delete_own" on public.recurring_transactions
  for delete using (auth.uid() = user_id);

-- 6. Savings Goals
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  deadline date,
  category_id uuid references public.categories(id) on delete set null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint current_not_exceed_target check (current_amount <= target_amount)
);

alter table public.savings_goals enable row level security;

create policy "savings_select_own" on public.savings_goals
  for select using (auth.uid() = user_id);

create policy "savings_insert_own" on public.savings_goals
  for insert with check (auth.uid() = user_id);

create policy "savings_update_own" on public.savings_goals
  for update using (auth.uid() = user_id);

create policy "savings_delete_own" on public.savings_goals
  for delete using (auth.uid() = user_id);

-- 7. Debts
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  counterparty_name text not null,
  type text not null check (type in ('owe', 'owed')),
  amount numeric not null check (amount > 0),
  description text,
  due_date date,
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts enable row level security;

create policy "debts_select_own" on public.debts
  for select using (auth.uid() = user_id);

create policy "debts_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);

create policy "debts_update_own" on public.debts
  for update using (auth.uid() = user_id);

create policy "debts_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

-- 8. Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'telegram_links', 'transactions',
    'recurring_transactions', 'savings_goals', 'debts'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I',
      t
    );
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.handle_updated_at()',
      t
    );
  end loop;
end;
$$;

-- 9. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
