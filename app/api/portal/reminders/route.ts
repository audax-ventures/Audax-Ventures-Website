import { createClient } from "@supabase/supabase-js";
import { todayInWinnipeg } from "@/lib/portal/compute";
import {
  buildReminderEmail,
  dueItemsForTemplates,
  firstName,
  isScheduledFor,
  sendEmail,
  type ReminderRow,
} from "@/lib/portal/reminders";

// Runs once a day (Vercel Cron, see vercel.json). Sends each team member one
// email listing the reports they're reminded about today that still need work.
// Add ?dry=1 to see who would be emailed without sending anything.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ ok: false, error: "SUPABASE_SECRET_KEY is not set in Vercel." }, { status: 500 });
  }
  const dryRun = new URL(request.url).searchParams.has("dry");
  const today = new URL(request.url).searchParams.get("date") ?? todayInWinnipeg();
  // The secret key lets this scheduled job read reports without a signed-in user.
  // It never leaves the server.
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await db
    .from("portal_reminders")
    .select("id, profile_id, template_id, weekday, month_day, enabled, last_sent_on, profile:portal_profiles(email, full_name, active)")
    .eq("enabled", true);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  // Group today's reminders by person.
  type Row = ReminderRow & { profile: { email: string; full_name: string | null; active: boolean } | { email: string; full_name: string | null; active: boolean }[] | null };
  const byPerson = new Map<string, { email: string; name: string; reminders: Row[] }>();
  for (const r of (data ?? []) as Row[]) {
    const profile = Array.isArray(r.profile) ? r.profile[0] : r.profile;
    if (!profile?.active || !profile.email) continue;
    if (r.last_sent_on === today || !isScheduledFor(r, today)) continue;
    const entry = byPerson.get(r.profile_id) ?? { email: profile.email, name: firstName(profile.full_name, profile.email), reminders: [] };
    entry.reminders.push(r);
    byPerson.set(r.profile_id, entry);
  }

  const results: { to: string; reports: number; sent: boolean; error?: string }[] = [];
  for (const person of byPerson.values()) {
    const items = await dueItemsForTemplates(db, person.reminders.map((r) => r.template_id), today);
    if (!items.length) {
      results.push({ to: person.email, reports: 0, sent: false });
      continue;
    }
    if (dryRun) {
      results.push({ to: person.email, reports: items.length, sent: false });
      continue;
    }
    try {
      await sendEmail(person.email, buildReminderEmail(person.name, items));
      await db.from("portal_reminders").update({ last_sent_on: today }).in("id", person.reminders.map((r) => r.id));
      results.push({ to: person.email, reports: items.length, sent: true });
    } catch (e) {
      results.push({ to: person.email, reports: items.length, sent: false, error: e instanceof Error ? e.message : "Send failed" });
    }
  }
  return Response.json({ ok: true, date: today, dryRun, results });
}
