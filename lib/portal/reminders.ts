import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { formatPeriod, nextReportState } from "./compute";
import { portalBaseUrl, type DueItem, type EmailContent } from "./emails";

export { buildReminderEmail, buildReviewEmail, portalBaseUrl, type DueItem } from "./emails";
import type { Cadence, ReportStatus } from "./types";

// Email reminders for team members: "your report for last week is due".
// A reminder only goes out when there is something to do, so if the report
// is already submitted, nobody is bothered.

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface ReminderRow {
  id: string;
  profile_id: string;
  template_id: string;
  weekday: number | null;
  month_day: number | null;
  enabled: boolean;
  last_sent_on: string | null;
}

const FROM_ADDRESS = "Audax Ventures Portal <portal@audaxventures.ca>";

/** The reports (from these templates) that still need work today. */
export async function dueItemsForTemplates(
  db: SupabaseClient,
  templateIds: string[],
  today: string,
  opts: { includeNotDue?: boolean } = {},
): Promise<DueItem[]> {
  if (!templateIds.length) return [];
  const { data: templates, error } = await db
    .from("portal_templates")
    .select("id, name, cadence, archived, client:portal_clients(name, archived)")
    .in("id", templateIds);
  if (error) throw new Error(error.message);

  const items: DueItem[] = [];
  for (const t of templates ?? []) {
    const client = (Array.isArray(t.client) ? t.client[0] : t.client) as { name: string; archived: boolean } | null;
    if (t.archived || !client || client.archived) continue;
    const { data: last } = await db
      .from("portal_reports")
      .select("id, status, period_start, period_end")
      .eq("template_id", t.id)
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; status: ReportStatus; period_start: string; period_end: string }>();
    const next = nextReportState(t.cadence as Cadence, last, today);
    // In review = waiting on an admin, not the team member, so no reminder.
    if (opts.includeNotDue || next.state === "due" || (next.state === "progress" && next.inProgress?.status === "draft")) {
      items.push({
        clientName: client.name,
        templateName: t.name,
        cadence: t.cadence as Cadence,
        periodLabel: formatPeriod(next.period.start, next.period.end),
        kind: next.inProgress ? "finish" : "start",
        href: next.inProgress
          ? `${portalBaseUrl()}/portal/reports/${next.inProgress.id}`
          : `${portalBaseUrl()}/portal/reports/new?template=${t.id}`,
      });
    }
  }
  return items;
}

export async function sendEmail(to: string, email: EmailContent) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email isn't set up: RESEND_API_KEY is missing in Vercel.");
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject: email.subject, html: email.html, text: email.text });
  if (error) throw new Error(error.message);
}

/** Whether a reminder is scheduled for this date. */
export function isScheduledFor(r: Pick<ReminderRow, "weekday" | "month_day">, isoDate: string): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (r.weekday !== null && r.weekday !== undefined) return r.weekday === weekday;
  if (r.month_day !== null && r.month_day !== undefined) return r.month_day === d;
  return false;
}

export function firstName(fullName: string | null, email: string) {
  const n = (fullName?.trim() || email.split("@")[0]).split(" ")[0];
  return n.charAt(0).toUpperCase() + n.slice(1);
}
