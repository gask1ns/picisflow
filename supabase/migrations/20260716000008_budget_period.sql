-- Add weekly/monthly budget period support
alter table public.categories
  add column budget_period text not null default 'monthly'
  check (budget_period in ('weekly', 'monthly'));
