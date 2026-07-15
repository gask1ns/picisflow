-- Fix C1: goal_id di pending_sessions
alter table public.pending_sessions add column if not exists goal_id uuid;

-- Fix C2: RLS untuk processed_updates
alter table public.processed_updates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'processed_updates' and policyname = 'processed_updates_service') then
    create policy "processed_updates_service" on public.processed_updates
      for all using (true) with check (true);
  end if;
end $$;

-- Fix C2: RLS untuk export_tokens
alter table public.export_tokens enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'export_tokens' and policyname = 'export_tokens_service') then
    create policy "export_tokens_service" on public.export_tokens
      for all using (true) with check (true);
  end if;
end $$;
