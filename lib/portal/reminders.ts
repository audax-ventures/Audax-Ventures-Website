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
  const base = portalBaseUrl();
  const one = items.length === 1;
  const subject = one
    ? `Reminder: ${items[0].clientName} ${items[0].templateName.toLowerCase()} (${items[0].periodLabel})`
    : `Reminder: ${items.length} reports are due`;
  const preheader = one
    ? `${items[0].clientName} · ${items[0].templateName} for ${items[0].periodLabel} is ready to complete.`
    : `${items.length} reports are ready to complete.`;

  // Email-safe layout: tables, inline styles, web-safe fonts, no images except the logo.
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const card = (it: DueItem) => {
    const started = it.kind === "finish";
    const pill = started
      ? { text: "Draft in progress", bg: "#F1EEFD", fg: "#5B3FC4", dot: "#7C5CE0" }
      : { text: "Not started", bg: "#FFF4E0", fg: "#9A5B00", dot: "#E39200" };
    return `
      <tr><td style="padding:0 0 14px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E9F1;border-radius:14px;background:#FFFFFF">
          <tr>
            <td width="4" style="width:4px;background:#2E6FB8;border-radius:14px 0 0 14px;font-size:0;line-height:0">&nbsp;</td>
            <td style="padding:18px 20px 20px 18px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:${font};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#2E6FB8">${escapeHtml(it.clientName)}</td>
                  <td align="right" style="font-family:${font}">
                    <span style="display:inline-block;background:${pill.bg};color:${pill.fg};font-size:11px;font-weight:600;line-height:16px;padding:3px 10px;border-radius:999px;white-space:nowrap">
                      <span style="color:${pill.dot}">&#9679;</span>&nbsp;${pill.text}
                    </span>
                  </td>
                </tr>
              </table>
              <div style="font-family:${font};font-size:17px;font-weight:700;line-height:24px;color:#0B1B33;margin-top:6px">${escapeHtml(it.templateName)}</div>
              <div style="font-family:${font};font-size:14px;line-height:20px;color:#5A6478;margin-top:2px">${escapeHtml(it.periodLabel)}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px">
                <tr><td style="border-radius:10px;background:#0F2341">
                  <a href="${it.href}" style="display:inline-block;font-family:${font};font-size:14px;font-weight:600;line-height:20px;color:#FFFFFF;text-decoration:none;padding:11px 20px;border-radius:10px;background:#0F2341">${started ? "Finish the report" : "Start the report"} &rarr;</a>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>`;
  };

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#EEF3F9">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EEF3F9">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF3F9">
    <tr><td align="center" style="padding:32px 14px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

        <!-- Header -->
        <tr><td style="background:#0F2341;background-image:linear-gradient(135deg,#0B1B33 0%,#123660 100%);border-radius:18px 18px 0 0;padding:26px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td><img src="${base}/email/audax-logo-white.png" width="136" height="44" alt="Audax Ventures" style="display:block;border:0;outline:none;text-decoration:none;height:44px;width:136px"></td>
            <td align="right" style="font-family:${font};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9DB6D8">Team Portal</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#2E6FB8;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;padding:32px 32px 12px 32px">
          ${opts.test ? `<div style="font-family:${font};background:#FFF7E6;border:1px solid #F5D9A8;color:#8A5A00;font-size:13px;line-height:18px;border-radius:10px;padding:10px 14px;margin-bottom:22px">This is a test email sent from the Team page.</div>` : ""}
          <div style="font-family:${font};font-size:12px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:#2E6FB8">Report reminder</div>
          <div style="font-family:${font};font-size:24px;font-weight:700;line-height:32px;color:#0B1B33;margin-top:6px">Hi ${escapeHtml(firstName)},</div>
          <p style="font-family:${font};font-size:15px;line-height:24px;color:#3B4456;margin:8px 0 24px 0">
            ${one ? "You have a report ready to complete." : `You have <strong style="color:#0B1B33">${items.length} reports</strong> ready to complete.`}
            It only takes a few minutes, and it saves as you go.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(card).join("")}</table>
        </td></tr>
        <tr><td style="background:#FFFFFF;padding:4px 32px 30px 32px;border-radius:0 0 18px 18px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-top:1px solid #EEF1F5;padding-top:18px;font-family:${font};font-size:13px;line-height:20px;color:#7A8394">
              Once a report is submitted for review, reminders stop until the next one is due.
              <a href="${base}/portal" style="color:#2E6FB8;text-decoration:none;font-weight:600">Open the portal</a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:20px 24px 0 24px;font-family:${font};font-size:12px;line-height:18px;color:#8A93A3">
          You're getting this because report reminders are turned on for you in the Audax Portal.<br>
          An admin can change them on the Team page.<br><br>
          <strong style="color:#5A6478">Audax Ventures</strong> &middot; Winnipeg, Manitoba &middot; <a href="https://audaxventures.ca" style="color:#8A93A3;text-decoration:underline">audaxventures.ca</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    "AUDAX VENTURES · TEAM PORTAL",
    "",
    `Hi ${firstName},`,
    "",
    one ? "You have a report ready to complete:" : `You have ${items.length} reports ready to complete:`,
    "",
    ...items.map(
      (it) =>
        `- ${it.clientName}: ${it.templateName} (${it.periodLabel}), ${it.kind === "finish" ? "draft in progress" : "not started"}\n  ${it.href}`,
    ),
    "",
    "Once a report is submitted for review, reminders stop until the next one is due.",
    "",
    "You're getting this because report reminders are turned on for you in the Audax Portal.",
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
