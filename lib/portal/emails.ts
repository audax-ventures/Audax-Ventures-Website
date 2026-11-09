import "server-only";
import type { Cadence } from "./types";

// Branded portal emails. Built with tables and inline styles so they look the
// same in Gmail, Outlook and Apple Mail, and adapt to phone screens.

export function portalBaseUrl(): string {
  return (process.env.PORTAL_BASE_URL || "https://audaxventures.ca").replace(/\/$/, "");
}

/** Escape text for HTML, writing any non-ASCII character (– · é) as a numeric entity so every email app shows it. */
export function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/[^\x00-\x7F]/g, (c) => `&#${c.codePointAt(0)};`);
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/** The shared layout: navy header with logo, white card, footer explaining why the email was sent. */
function emailShell(opts: {
  subject: string;
  preheader: string;
  eyebrow: string;
  greeting: string;
  intro: string;
  body: string;
  closingNote: string;
  footerReason: string;
  test?: boolean;
}) {
  const base = portalBaseUrl();
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(opts.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#EEF3F9">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EEF3F9">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF3F9">
    <tr><td align="center" style="padding:32px 14px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

        <!-- Header -->
        <tr><td style="background:#0F2341;background-image:linear-gradient(135deg,#0B1B33 0%,#123660 100%);border-radius:18px 18px 0 0;padding:26px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td><img src="${base}/email/audax-logo-white.png" width="136" height="44" alt="Audax Ventures" style="display:block;border:0;outline:none;text-decoration:none;height:44px;width:136px"></td>
            <td align="right" style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9DB6D8">Team Portal</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#2E6FB8;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;padding:32px 32px 12px 32px">
          ${opts.test ? `<div style="font-family:${FONT};background:#FFF7E6;border:1px solid #F5D9A8;color:#8A5A00;font-size:13px;line-height:18px;border-radius:10px;padding:10px 14px;margin-bottom:22px">This is a test email sent from the Team page.</div>` : ""}
          <div style="font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:#2E6FB8">${escapeHtml(opts.eyebrow)}</div>
          <div style="font-family:${FONT};font-size:24px;font-weight:700;line-height:32px;color:#0B1B33;margin-top:6px">${opts.greeting}</div>
          <p style="font-family:${FONT};font-size:15px;line-height:24px;color:#3B4456;margin:8px 0 24px 0">${opts.intro}</p>
          ${opts.body}
        </td></tr>
        <tr><td style="background:#FFFFFF;padding:4px 32px 30px 32px;border-radius:0 0 18px 18px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-top:1px solid #EEF1F5;padding-top:18px;font-family:${FONT};font-size:13px;line-height:20px;color:#7A8394">
              ${opts.closingNote}
              <a href="${base}/portal" style="color:#2E6FB8;text-decoration:none;font-weight:600">Open the portal</a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:20px 24px 0 24px;font-family:${FONT};font-size:12px;line-height:18px;color:#8A93A3">
          ${opts.footerReason}<br><br>
          <strong style="color:#5A6478">Audax Ventures</strong> &middot; Winnipeg, Manitoba &middot; <a href="https://audaxventures.ca" style="color:#8A93A3;text-decoration:underline">audaxventures.ca</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function pillHtml(text: string, bg: string, fg: string, dot: string) {
  return `<span style="display:inline-block;background:${bg};color:${fg};font-size:11px;font-weight:600;line-height:16px;padding:3px 10px;border-radius:999px;white-space:nowrap"><span style="color:${dot}">&#9679;</span>&nbsp;${text}</span>`;
}

function buttonHtml(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px">
    <tr><td style="border-radius:10px;background:#0F2341">
      <a href="${href}" style="display:inline-block;font-family:${FONT};font-size:14px;font-weight:600;line-height:20px;color:#FFFFFF;text-decoration:none;padding:11px 20px;border-radius:10px;background:#0F2341">${label} &rarr;</a>
    </td></tr>
  </table>`;
}

/** A report card: blue edge, client name, status pill, report name, dates, extra content, button. */
function reportCard(o: { clientName: string; pill: string; title: string; period: string; extra?: string; button: string }) {
  return `
    <tr><td style="padding:0 0 14px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E9F1;border-radius:14px;background:#FFFFFF">
        <tr>
          <td width="4" style="width:4px;background:#2E6FB8;border-radius:14px 0 0 14px;font-size:0;line-height:0">&nbsp;</td>
          <td style="padding:18px 20px 20px 18px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#2E6FB8">${escapeHtml(o.clientName)}</td>
                <td align="right" style="font-family:${FONT}">${o.pill}</td>
              </tr>
            </table>
            <div style="font-family:${FONT};font-size:17px;font-weight:700;line-height:24px;color:#0B1B33;margin-top:6px">${escapeHtml(o.title)}</div>
            <div style="font-family:${FONT};font-size:14px;line-height:20px;color:#5A6478;margin-top:2px">${escapeHtml(o.period)}</div>
            ${o.extra ?? ""}
            ${o.button}
          </td>
        </tr>
      </table>
    </td></tr>`;
}

// ----- Reminder: "a new report is due" -----

export interface DueItem {
  clientName: string;
  templateName: string;
  cadence: Cadence;
  periodLabel: string;
  kind: "start" | "finish";
  href: string;
}

export function buildReminderEmail(firstName: string, items: DueItem[], opts: { test?: boolean } = {}): EmailContent {
  const one = items.length === 1;
  const subject = "Reminder: A New Report is Due";
  const preheader = one
    ? `${items[0].clientName} · ${items[0].templateName} for ${items[0].periodLabel} is ready to complete.`
    : `${items.length} reports are ready to complete.`;
  const cards = items
    .map((it) => {
      const started = it.kind === "finish";
      return reportCard({
        clientName: it.clientName,
        pill: started ? pillHtml("Draft in progress", "#F1EEFD", "#5B3FC4", "#7C5CE0") : pillHtml("Not started", "#FFF4E0", "#9A5B00", "#E39200"),
        title: it.templateName,
        period: it.periodLabel,
        button: buttonHtml(it.href, started ? "Finish the report" : "Start the report"),
      });
    })
    .join("");
  const html = emailShell({
    subject,
    preheader,
    test: opts.test,
    eyebrow: "Report reminder",
    greeting: `Hi ${escapeHtml(firstName)},`,
    intro: `${one ? "You have a report ready to complete." : `You have <strong style="color:#0B1B33">${items.length} reports</strong> ready to complete.`} It only takes a few minutes, and it saves as you go.`,
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cards}</table>`,
    closingNote: "Once a report is submitted for review, reminders stop until the next one is due.",
    footerReason: "You're getting this because report reminders are turned on for you in the Audax Portal.<br>An admin can change them on the Team page.",
  });
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

// ----- Review: "a report is ready for your review" -----

export interface ReviewItem {
  submitterName: string;
  clientName: string;
  templateName: string;
  periodLabel: string;
  note: string | null;
  href: string;
}

export function buildReviewEmail(firstName: string, it: ReviewItem, opts: { test?: boolean } = {}): EmailContent {
  const subject = `Ready for review: ${it.clientName} – ${it.templateName}`;
  const preheader = `${it.submitterName} submitted the ${it.templateName} for ${it.periodLabel}.`;
  const note = it.note?.trim()
    ? `<div style="font-family:${FONT};margin-top:14px;background:#F6F8FB;border:1px solid #E8EEF5;border-radius:10px;padding:12px 14px">
         <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8A93A3">Note from ${escapeHtml(it.submitterName)}</div>
         <div style="font-size:14px;line-height:21px;color:#3B4456;margin-top:4px;white-space:pre-wrap">${escapeHtml(it.note.trim())}</div>
       </div>`
    : "";
  const html = emailShell({
    subject,
    preheader,
    test: opts.test,
    eyebrow: "Ready for review",
    greeting: `Hi ${escapeHtml(firstName)},`,
    intro: `<strong style="color:#0B1B33">${escapeHtml(it.submitterName)}</strong> submitted a report for your review.`,
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${reportCard({
      clientName: it.clientName,
      pill: pillHtml("In review", "#FFF4E0", "#9A5B00", "#E39200"),
      title: it.templateName,
      period: it.periodLabel,
      extra: note,
      button: buttonHtml(it.href, "Review report"),
    })}</table>`,
    closingNote: "Approve it, or send it back with a note if anything needs changing.",
    footerReason: "You're getting this because review emails are turned on for you in the Audax Portal.<br>You can turn them off on the Team page.",
  });
  const text = [
    "AUDAX VENTURES · TEAM PORTAL",
    "",
    `Hi ${firstName},`,
    "",
    `${it.submitterName} submitted a report for your review:`,
    "",
    `${it.clientName}: ${it.templateName} (${it.periodLabel})`,
    ...(it.note?.trim() ? ["", `Note: ${it.note.trim()}`] : []),
    "",
    `Review it here: ${it.href}`,
    "",
    "You're getting this because review emails are turned on for you in the Audax Portal.",
  ].join("\n");
  return { subject, html, text };
}
