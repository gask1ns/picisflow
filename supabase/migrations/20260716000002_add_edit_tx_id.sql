-- Add edit_tx_id column untuk fitur edit inline
alter table public.pending_sessions
add column if not exists edit_tx_id uuid;
