create table if not exists public.export_tokens (
  token text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text,
  from_date text,
  to_date text,
  expires_at timestamptz not null default now() + interval '5 minutes'
);
