-- Pending sessions for inline keyboard flow
create table if not exists public.pending_sessions (
  chat_id bigint primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  step text not null default 'category',
  created_at timestamptz not null default now()
);

alter table public.pending_sessions enable row level security;

-- Allow service_role key to read/write
create policy "pending_sessions_service" on public.pending_sessions
  for all using (true) with check (true);
