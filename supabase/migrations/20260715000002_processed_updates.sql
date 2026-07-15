-- Idempotency: track processed Telegram updates
create table if not exists public.processed_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

-- Cleanup trigger: auto-delete entries older than 7 days
create or replace function public.cleanup_old_updates()
returns trigger as $$
begin
  delete from public.processed_updates
  where processed_at < now() - interval '7 days';
  return null;
end;
$$ language plpgsql;

drop trigger if exists trigger_cleanup_old_updates on public.processed_updates;
create trigger trigger_cleanup_old_updates
  after insert on public.processed_updates
  for each statement execute function public.cleanup_old_updates();
