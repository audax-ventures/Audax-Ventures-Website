-- Audax reporting portal: lets you choose the order report templates appear in.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.

alter table public.portal_templates add column if not exists sort_order integer not null default 100;

-- Starting order for existing templates: weekly, then monthly, then custom; A–Z within each.
-- Only applies to templates that haven't been ordered yet.
with ranked as (
  select id,
         row_number() over (
           partition by client_id
           order by case cadence when 'weekly' then 1 when 'monthly' then 2 else 3 end, name
         ) as pos
  from public.portal_templates
  where sort_order = 100
)
update public.portal_templates t
set sort_order = ranked.pos
from ranked
where t.id = ranked.id;
