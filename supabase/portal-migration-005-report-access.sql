-- Audax reporting portal: control which clients and reports each team member can see.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
--
-- Admins always see everything. Team members have full access unless an admin
-- switches them to "Only selected reports" on the Team page; they then see only
-- the report templates ticked for them (and those templates' clients and reports).
-- People limited to selected reports can't add or edit clients or templates.

-- ============================================================
-- Settings
-- ============================================================
alter table public.portal_profiles add column if not exists restricted boolean not null default false;

create table if not exists public.portal_template_access (
  profile_id uuid not null references public.portal_profiles (id) on delete cascade,
  template_id uuid not null references public.portal_templates (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, template_id)
);

alter table public.portal_template_access enable row level security;

drop policy if exists "template access read" on public.portal_template_access;
create policy "template access read" on public.portal_template_access for select to authenticated
  using (public.portal_is_admin() or (public.portal_is_member() and profile_id = auth.uid()));
drop policy if exists "template access insert" on public.portal_template_access;
create policy "template access insert" on public.portal_template_access for insert to authenticated
  with check (public.portal_is_admin());
drop policy if exists "template access delete" on public.portal_template_access;
create policy "template access delete" on public.portal_template_access for delete to authenticated
  using (public.portal_is_admin());

-- Only admins can change who is restricted.
create or replace function public.portal_guard_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active
      or new.email is distinct from old.email or new.restricted is distinct from old.restricted)
     and not public.portal_is_admin() then
    raise exception 'Only an admin can change roles or access.';
  end if;
  if old.id = auth.uid() and (new.role <> 'admin' or not new.active) and old.role = 'admin' then
    raise exception 'You cannot remove your own admin access.';
  end if;
  return new;
end;
$$;

-- ============================================================
-- Access checks
-- ============================================================

-- Active member who can see every client and report (admins, and members who aren't restricted).
create or replace function public.portal_has_full_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.portal_profiles
    where id = auth.uid() and active and (role = 'admin' or not restricted)
  );
$$;

create or replace function public.portal_can_see_template(p_template uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.portal_has_full_access()
      or (public.portal_is_member() and exists (
            select 1 from public.portal_template_access a
            where a.profile_id = auth.uid() and a.template_id = p_template));
$$;

create or replace function public.portal_can_see_client(p_client uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.portal_has_full_access()
      or (public.portal_is_member() and exists (
            select 1 from public.portal_template_access a
            join public.portal_templates t on t.id = a.template_id
            where a.profile_id = auth.uid() and t.client_id = p_client));
$$;

create or replace function public.portal_can_see_report(p_report uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.portal_reports r
    where r.id = p_report and public.portal_can_see_template(r.template_id));
$$;

-- Saved PDFs are stored as <client id>/<report id>/<file>.pdf
create or replace function public.portal_can_see_pdf(p_name text)
returns boolean
language plpgsql stable security definer set search_path = public
as $$
begin
  return public.portal_can_see_report(split_part(p_name, '/', 2)::uuid);
exception when others then
  return false;
end;
$$;

-- ============================================================
-- Rules that use the access checks
-- ============================================================
drop policy if exists "clients read" on public.portal_clients;
create policy "clients read" on public.portal_clients for select to authenticated
  using (public.portal_can_see_client(id));
drop policy if exists "clients insert" on public.portal_clients;
create policy "clients insert" on public.portal_clients for insert to authenticated
  with check (public.portal_has_full_access());
drop policy if exists "clients update" on public.portal_clients;
create policy "clients update" on public.portal_clients for update to authenticated
  using (public.portal_has_full_access()) with check (public.portal_has_full_access());

drop policy if exists "templates read" on public.portal_templates;
create policy "templates read" on public.portal_templates for select to authenticated
  using (public.portal_can_see_template(id));
drop policy if exists "templates insert" on public.portal_templates;
create policy "templates insert" on public.portal_templates for insert to authenticated
  with check (public.portal_has_full_access());
drop policy if exists "templates update" on public.portal_templates;
create policy "templates update" on public.portal_templates for update to authenticated
  using (public.portal_has_full_access()) with check (public.portal_has_full_access());

drop policy if exists "reports read" on public.portal_reports;
create policy "reports read" on public.portal_reports for select to authenticated
  using (public.portal_can_see_template(template_id));
drop policy if exists "reports insert" on public.portal_reports;
create policy "reports insert" on public.portal_reports for insert to authenticated
  with check (public.portal_can_see_template(template_id) and status = 'draft');
drop policy if exists "reports update" on public.portal_reports;
create policy "reports update" on public.portal_reports for update to authenticated
  using (public.portal_can_see_template(template_id)) with check (public.portal_can_see_template(template_id));
drop policy if exists "reports delete" on public.portal_reports;
create policy "reports delete" on public.portal_reports for delete to authenticated
  using (public.portal_is_admin()
         or (public.portal_can_see_template(template_id) and status = 'draft' and created_by = auth.uid()));

drop policy if exists "activity read" on public.portal_report_activity;
create policy "activity read" on public.portal_report_activity for select to authenticated
  using (public.portal_can_see_report(report_id));
drop policy if exists "activity insert" on public.portal_report_activity;
create policy "activity insert" on public.portal_report_activity for insert to authenticated
  with check (public.portal_can_see_report(report_id) and actor = auth.uid());

drop policy if exists "portal pdf read" on storage.objects;
create policy "portal pdf read" on storage.objects for select to authenticated
  using (bucket_id = 'portal-reports' and public.portal_is_member() and public.portal_can_see_pdf(name));
