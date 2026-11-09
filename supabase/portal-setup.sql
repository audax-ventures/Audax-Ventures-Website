-- Audax reporting portal: database setup
-- Run this once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run again: it only creates things that are missing.

-- ============================================================
-- Team members
-- ============================================================
create table if not exists public.portal_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  -- New logins start inactive until an admin turns them on.
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Every new login gets a profile. The very first one becomes an active admin.
create or replace function public.portal_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.portal_profiles) into first_user;
  insert into public.portal_profiles (id, email, full_name, role, active)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case when first_user then 'admin' else 'member' end,
    first_user
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists portal_on_auth_user_created on auth.users;
create trigger portal_on_auth_user_created
  after insert on auth.users
  for each row execute function public.portal_handle_new_user();

-- Add profiles for any logins that already existed before this script ran.
insert into public.portal_profiles (id, email, role, active)
select u.id, coalesce(u.email, ''), 'member', false
from auth.users u
on conflict (id) do nothing;

create or replace function public.portal_is_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.portal_profiles where id = auth.uid() and active);
$$;

create or replace function public.portal_is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.portal_profiles where id = auth.uid() and active and role = 'admin');
$$;

-- Only admins can change roles or turn people on/off.
create or replace function public.portal_guard_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active
      or new.email is distinct from old.email)
     and not public.portal_is_admin() then
    raise exception 'Only an admin can change roles or access.';
  end if;
  if old.id = auth.uid() and (new.role <> 'admin' or not new.active) and old.role = 'admin' then
    raise exception 'You cannot remove your own admin access.';
  end if;
  return new;
end;
$$;

drop trigger if exists portal_guard_profile on public.portal_profiles;
create trigger portal_guard_profile
  before update on public.portal_profiles
  for each row execute function public.portal_guard_profile();

-- ============================================================
-- Clients, templates, reports
-- ============================================================
create table if not exists public.portal_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_data text,                       -- PNG logo stored as a data URL
  brand_color text not null default '#2E5F8A',
  contact_name text,
  contact_email text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_templates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.portal_clients (id) on delete cascade,
  name text not null,
  cadence text not null default 'weekly' check (cadence in ('weekly', 'monthly', 'custom')),
  schema jsonb not null default '{"periodLabel":"Reporting period","sections":[]}'::jsonb,
  archived boolean not null default false,
  sort_order integer not null default 100,   -- order shown in lists (lower first)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- For databases set up before sort_order existed:
alter table public.portal_templates add column if not exists sort_order integer not null default 100;

create table if not exists public.portal_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.portal_clients (id) on delete cascade,
  template_id uuid not null references public.portal_templates (id) on delete restrict,
  title text not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'approved', 'sent')),
  schema jsonb not null,                -- copy of the template when the report was made
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  submitted_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  pdf_path text,                        -- saved copy of the approved PDF
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create index if not exists portal_reports_template_period on public.portal_reports (template_id, period_start);
create index if not exists portal_reports_client on public.portal_reports (client_id, period_start desc);
create index if not exists portal_reports_status on public.portal_reports (status);

create table if not exists public.portal_report_activity (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.portal_reports (id) on delete cascade,
  actor uuid references auth.users (id) on delete set null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists portal_report_activity_report on public.portal_report_activity (report_id, created_at);

create or replace function public.portal_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portal_clients_touch on public.portal_clients;
create trigger portal_clients_touch before update on public.portal_clients
  for each row execute function public.portal_touch_updated_at();
drop trigger if exists portal_templates_touch on public.portal_templates;
create trigger portal_templates_touch before update on public.portal_templates
  for each row execute function public.portal_touch_updated_at();
drop trigger if exists portal_reports_touch on public.portal_reports;
create trigger portal_reports_touch before update on public.portal_reports
  for each row execute function public.portal_touch_updated_at();

-- Review rules, enforced by the database itself:
--  * only an admin can approve, mark as sent, or reopen an approved/sent report
--  * approved and sent reports are locked
create or replace function public.portal_guard_report()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if (new.status in ('approved', 'sent') or old.status in ('approved', 'sent'))
       and not public.portal_is_admin() then
      raise exception 'Only an admin can approve, send or reopen a report.';
    end if;
  elsif old.status in ('approved', 'sent') then
    if (new.data is distinct from old.data or new.schema is distinct from old.schema
        or new.period_start is distinct from old.period_start
        or new.period_end is distinct from old.period_end
        or new.title is distinct from old.title) then
      raise exception 'This report is locked. Reopen it to make changes.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists portal_guard_report on public.portal_reports;
create trigger portal_guard_report before update on public.portal_reports
  for each row execute function public.portal_guard_report();

-- ============================================================
-- Row level security: only active team members can see anything
-- ============================================================
alter table public.portal_profiles enable row level security;
alter table public.portal_clients enable row level security;
alter table public.portal_templates enable row level security;
alter table public.portal_reports enable row level security;
alter table public.portal_report_activity enable row level security;

drop policy if exists "profiles read" on public.portal_profiles;
create policy "profiles read" on public.portal_profiles for select to authenticated
  using (id = auth.uid() or public.portal_is_member());
drop policy if exists "profiles update" on public.portal_profiles;
create policy "profiles update" on public.portal_profiles for update to authenticated
  using (id = auth.uid() or public.portal_is_admin())
  with check (id = auth.uid() or public.portal_is_admin());

drop policy if exists "clients read" on public.portal_clients;
create policy "clients read" on public.portal_clients for select to authenticated using (public.portal_is_member());
drop policy if exists "clients insert" on public.portal_clients;
create policy "clients insert" on public.portal_clients for insert to authenticated with check (public.portal_is_member());
drop policy if exists "clients update" on public.portal_clients;
create policy "clients update" on public.portal_clients for update to authenticated
  using (public.portal_is_member()) with check (public.portal_is_member());
drop policy if exists "clients delete" on public.portal_clients;
create policy "clients delete" on public.portal_clients for delete to authenticated using (public.portal_is_admin());

drop policy if exists "templates read" on public.portal_templates;
create policy "templates read" on public.portal_templates for select to authenticated using (public.portal_is_member());
drop policy if exists "templates insert" on public.portal_templates;
create policy "templates insert" on public.portal_templates for insert to authenticated with check (public.portal_is_member());
drop policy if exists "templates update" on public.portal_templates;
create policy "templates update" on public.portal_templates for update to authenticated
  using (public.portal_is_member()) with check (public.portal_is_member());
drop policy if exists "templates delete" on public.portal_templates;
create policy "templates delete" on public.portal_templates for delete to authenticated using (public.portal_is_admin());

drop policy if exists "reports read" on public.portal_reports;
create policy "reports read" on public.portal_reports for select to authenticated using (public.portal_is_member());
drop policy if exists "reports insert" on public.portal_reports;
create policy "reports insert" on public.portal_reports for insert to authenticated
  with check (public.portal_is_member() and status = 'draft');
drop policy if exists "reports update" on public.portal_reports;
create policy "reports update" on public.portal_reports for update to authenticated
  using (public.portal_is_member()) with check (public.portal_is_member());
drop policy if exists "reports delete" on public.portal_reports;
create policy "reports delete" on public.portal_reports for delete to authenticated
  using (public.portal_is_admin() or (public.portal_is_member() and status = 'draft' and created_by = auth.uid()));

drop policy if exists "activity read" on public.portal_report_activity;
create policy "activity read" on public.portal_report_activity for select to authenticated using (public.portal_is_member());
drop policy if exists "activity insert" on public.portal_report_activity;
create policy "activity insert" on public.portal_report_activity for insert to authenticated
  with check (public.portal_is_member() and actor = auth.uid());

-- ============================================================
-- Email reminders (also in portal-migration-002-reminders.sql)
-- ============================================================
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

-- ============================================================
-- Saved PDFs (private file storage)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('portal-reports', 'portal-reports', false)
on conflict (id) do nothing;

drop policy if exists "portal pdf read" on storage.objects;
create policy "portal pdf read" on storage.objects for select to authenticated
  using (bucket_id = 'portal-reports' and public.portal_is_member());
drop policy if exists "portal pdf write" on storage.objects;
create policy "portal pdf write" on storage.objects for insert to authenticated
  with check (bucket_id = 'portal-reports' and public.portal_is_admin());
drop policy if exists "portal pdf update" on storage.objects;
create policy "portal pdf update" on storage.objects for update to authenticated
  using (bucket_id = 'portal-reports' and public.portal_is_admin());
drop policy if exists "portal pdf delete" on storage.objects;
create policy "portal pdf delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portal-reports' and public.portal_is_admin());

-- ============================================================
-- Keep-alive: the website calls this once a day so the free
-- Supabase project never pauses for inactivity.
-- ============================================================
create or replace function public.portal_keepalive()
returns timestamptz
language sql stable security definer set search_path = public
as $$ select now(); $$;

revoke all on function public.portal_keepalive() from public;
grant execute on function public.portal_keepalive() to anon, authenticated;
