-- Audax reporting portal: show Facebook and Instagram Post Views as full numbers
-- (64,598) instead of short numbers (64.6K) on the Weekly Marketing Report.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
--
-- Updates the template, plus any of its reports still in Draft or In review.
-- Approved and sent reports are locked and keep the format they were approved with.

create or replace function pg_temp.post_views_as_number(s jsonb)
returns jsonb
language sql
as $$
  select jsonb_set(s, '{sections}', coalesce((
    select jsonb_agg(
      case when sec->>'type' = 'stats' then jsonb_set(sec, '{fields}', coalesce((
        select jsonb_agg(
          case when f->>'label' in ('Facebook Post Views', 'Instagram Post Views') and f->>'format' = 'compact'
               then jsonb_set(f, '{format}', '"number"') else f end
          order by fi)
        from jsonb_array_elements(sec->'fields') with ordinality as x(f, fi)), '[]'::jsonb))
      else sec end
      order by si)
    from jsonb_array_elements(s->'sections') with ordinality as y(sec, si)), '[]'::jsonb))
$$;

update public.portal_templates
   set schema = pg_temp.post_views_as_number(schema)
 where name = 'Weekly Marketing Report'
   and schema::text like '%Post Views%';

update public.portal_reports
   set schema = pg_temp.post_views_as_number(schema)
 where status in ('draft', 'in_review')
   and schema::text like '%Post Views%';

-- Check: should list the two fields with format "number".
select t.name, f->>'label' as field, f->>'format' as format
  from public.portal_templates t,
       jsonb_array_elements(t.schema->'sections') sec,
       jsonb_array_elements(case when sec->>'type' = 'stats' then sec->'fields' else '[]'::jsonb end) f
 where f->>'label' like '%Post Views';
