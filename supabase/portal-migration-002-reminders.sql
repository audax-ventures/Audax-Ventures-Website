-- Audax reporting portal: email reminders for team members.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run again.

create table if not exists public.portal_reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.portal_profiles (id) on delete cascade,
  template_id uuid not null references public.portal_templates (id) on delete cascade,
  -- Weekly and custom reports: day of the week (0 = Sunday … 6 = Saturday).
  weekday smallint check (weekday between 0 and 6),
  -- Monthly reports: day of the month (1–28).
  month_day smallint check (month_day between 1 and 28),
  enabled boolean not null default true,
  last_sent_on date,
  created_at timestamptz not null default now(),
  unique (profile_id, template_id),
  check (weekday is not null or month_day is not null)
);

alter table public.portal_reminders enable row level security;

drop policy if exists "reminders read" on public.portal_reminders;
create policy "reminders read" on public.portal_reminders for select to authenticated
  using (public.portal_is_admin() or (public.portal_is_member() and profile_id = auth.uid()));
drop policy if exists "reminders insert" on public.portal_reminders;
create policy "reminders insert" on public.portal_reminders for insert to authenticated
  with check (public.portal_is_admin());
drop policy if exists "reminders update" on public.portal_reminders;
create policy "reminders update" on public.portal_reminders for update to authenticated
  using (public.portal_is_admin()) with check (public.portal_is_admin());
drop policy if exists "reminders delete" on public.portal_reminders;
create policy "reminders delete" on public.portal_reminders for delete to authenticated
  using (public.portal_is_admin());
