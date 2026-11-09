// Builds supabase/portal-seed-elkhorn.sql: the Elkhorn Resort client with
// its weekly and monthly templates. Run with: npx tsx scripts/portal/build-elkhorn-seed.ts
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { monthlyAdsTemplate, weeklySocialTemplate } from "../../lib/portal/starter-templates";
import type { BudgetSection } from "../../lib/portal/types";

async function main() {
  const png = await sharp(readFileSync("public/logos/elkhorn-resort.avif"))
    .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const logo = `data:image/png;base64,${png.toString("base64")}`;

  // Year-to-date spend through September 2026, from the last Excel report.
  // The portal adds each new monthly report on top of these.
  const monthly = monthlyAdsTemplate(2026);
  const budget = monthly.schema.sections.find((s) => s.type === "budget") as BudgetSection;
  const opening: Record<string, number> = { social: 26890.5, youtube: 17949.75, google: 8968.05, seo: 9000 };
  for (const line of budget.lines) line.openingSpend = opening[line.id] ?? 0;

  const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
  const sql = `-- Elkhorn Resort: client and its two report templates.
-- Run once in Supabase → SQL Editor, after portal-setup.sql.
-- Budget "opening spend" = year-to-date spend through September 2026.

do $$
declare
  client_id uuid;
begin
  if exists (select 1 from public.portal_clients where name = 'Elkhorn Resort') then
    raise notice 'Elkhorn Resort already exists, skipping.';
    return;
  end if;

  insert into public.portal_clients (name, brand_color, logo_data)
  values ('Elkhorn Resort', '#0B6B57', ${q(logo)})
  returning id into client_id;

  insert into public.portal_templates (client_id, name, cadence, schema) values
    (client_id, ${q(weeklySocialTemplate.name)}, 'weekly', ${q(JSON.stringify(weeklySocialTemplate.schema))}::jsonb),
    (client_id, ${q(monthly.name)}, 'monthly', ${q(JSON.stringify(monthly.schema))}::jsonb);
end $$;
`;
  writeFileSync("supabase/portal-seed-elkhorn.sql", sql);
  console.log("Wrote supabase/portal-seed-elkhorn.sql", sql.length, "bytes");
}

main();
