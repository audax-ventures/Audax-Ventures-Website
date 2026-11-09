import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { formatPeriod, nextReportState } from "./compute";
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

export interface DueItem {
  clientName: string;
  templateName: string;
  cadence: Cadence;
  periodLabel: string;
  kind: "start" | "finish";
  href: string;
}

const FROM_ADDRESS = "Audax Portal <portal@audaxventures.ca>";

export function portalBaseUrl(): string {
  return (process.env.PORTAL_BASE_URL || "https://audaxventures.ca").replace(/\/$/, "");
}

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

/** Escape text for HTML, writing any non-ASCII character (– · é) as a numeric entity so every email app shows it. */
function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/[^\x00-\x7F]/g, (c) => `&#${c.codePointAt(0)};`);
}

export function buildReminderEmail(firstName: string, items: DueItem[], opts: { test?: boolean } = {}) {
  const subject =
    items.length === 1
      ? `Reminder: ${items[0].clientName} ${items[0].templateName.toLowerCase()} (${items[0].periodLabel})`
      : `Reminder: ${items.length} reports are due`;
  const rows = items
    .map(
      (it) => `
      <tr><td style="padding:0 0 12px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E4E9F0;border-radius:12px">
          <tr><td style="padding:16px 18px">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#2E5F8A">${escapeHtml(it.clientName)}</div>
            <div style="font-size:16px;font-weight:700;color:#0B1B33;margin-top:4px">${escapeHtml(it.templateName)}</div>
            <div style="font-size:14px;color:#5A6478;margin-top:2px">${escapeHtml(it.periodLabel)} &middot; ${it.kind === "finish" ? "draft started, not submitted yet" : "not started yet"}</div>
            <a href="${it.href}" style="display:inline-block;margin-top:14px;background:#0F2341;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:10px">${it.kind === "finish" ? "Finish the report" : "Start the report"} &rarr;</a>
          </td></tr>
        </table>
      </td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#F4F7FB;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="background:#0F2341;border-radius:16px 16px 0 0;padding:22px 28px">
          <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:2px">AUDAX VENTURES</div>
          <div style="color:#9DB3D1;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px">Team Portal</div>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px">
          ${opts.test ? `<div style="background:#FFF7E6;border:1px solid #F5D9A8;color:#8A5A00;font-size:13px;border-radius:10px;padding:10px 14px;margin-bottom:18px">This is a test email sent from the Team page.</div>` : ""}
          <div style="font-size:20px;font-weight:700;color:#0B1B33">Hi ${escapeHtml(firstName)},</div>
          <p style="font-size:15px;line-height:1.6;color:#3B4456;margin:10px 0 20px">
            ${items.length === 1 ? "A report is ready to be completed:" : `These ${items.length} reports are ready to be completed:`}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <p style="font-size:13px;line-height:1.6;color:#8A93A3;margin:18px 0 0">
            Once you submit it for review, these reminders stop until the next report is due.
          </p>
        </td></tr>
        <tr><td style="padding:16px 4px;text-align:center;font-size:12px;color:#8A93A3">
          Sent by the Audax Portal &middot; audaxventures.ca/portal
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
  const text = [
    `Hi ${firstName},`,
    "",
    items.length === 1 ? "A report is ready to be completed:" : `These ${items.length} reports are ready to be completed:`,
    "",
    ...items.map((it) => `- ${it.clientName} · ${it.templateName} · ${it.periodLabel}\n  ${it.href}`),
    "",
    "Once you submit it for review, these reminders stop until the next report is due.",
  ].join("\n");
  return { subject, html, text };
}

export async function sendEmail(to: string, email: { subject: string; html: string; text: string }) {
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
