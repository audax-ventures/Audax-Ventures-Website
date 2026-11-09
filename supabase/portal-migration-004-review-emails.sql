-- Audax reporting portal: per-admin setting for "ready for review" emails.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- (Until this is run, every admin gets the emails.)

alter table public.portal_profiles add column if not exists notify_on_submit boolean not null default true;
