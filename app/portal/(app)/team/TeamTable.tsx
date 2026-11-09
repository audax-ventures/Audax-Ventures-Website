"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, ChevronDown, Mail } from "lucide-react";
import { saveReminder, sendTestReminder, sendTestReviewEmail, updateMember } from "@/lib/portal/actions";
import type { Cadence, Profile, Role } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Avatar, Button, ErrorNote, thClass } from "@/components/portal/ui";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ReportType {
  id: string;
  name: string;
  cadence: Cadence;
  clientName: string;
}

interface Reminder {
  id: string;
  profile_id: string;
  template_id: string;
  weekday: number | null;
  month_day: number | null;
  enabled: boolean;
  last_sent_on: string | null;
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function scheduleText(r: Reminder) {
  return r.weekday !== null ? `${WEEKDAYS[r.weekday]}s` : r.month_day !== null ? `the ${ordinal(r.month_day)} of each month` : "";
}

function ReminderPanel({
  person,
  reportTypes,
  reminders,
}: {
  person: Profile;
  reportTypes: ReportType[];
  reminders: Reminder[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const byTemplate = new Map(reminders.map((r) => [r.template_id, r]));

  function save(templateId: string, enabled: boolean, cadence: Cadence, day: number) {
    setMessage(null);
    startTransition(async () => {
      const monthly = cadence === "monthly";
      const res = await saveReminder(person.id, templateId, {
        enabled,
        weekday: monthly ? null : day,
        monthDay: monthly ? day : null,
      });
      if (!res.ok) setMessage({ ok: false, text: res.error });
      router.refresh();
    });
  }

  function sendTest() {
    setMessage(null);
    startTransition(async () => {
      const res = await sendTestReminder(person.id);
      setMessage(res.ok ? { ok: true, text: `Test email sent to ${res.to}.` } : { ok: false, text: res.error });
    });
  }

  return (
    <div className="space-y-3 bg-gradient-to-b from-[#F6F9FD] to-white px-5 py-5">
      <p className="text-sm text-slate-600">
        Choose which reports <strong className="text-[#0B1B33]">{person.full_name || person.email}</strong> is reminded about, and on which day.
        Emails go out each morning (8 a.m. Winnipeg time in winter, 9 a.m. in summer) and only when the report still needs to be done.
      </p>
      {reportTypes.length === 0 ? <p className="text-sm text-slate-500">Add a report template first.</p> : null}
      <div className="space-y-2">
        {reportTypes.map((t) => {
          const r = byTemplate.get(t.id);
          const monthly = t.cadence === "monthly";
          const day = r ? (monthly ? r.month_day ?? 3 : r.weekday ?? 1) : monthly ? 3 : 1;
          return (
            <div key={t.id} className={cn("flex flex-wrap items-center gap-3 rounded-xl border bg-white px-4 py-3", r ? "border-[#BFD3EA]" : "border-[#E4E9F0]")}>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(r)}
                aria-label={`Remind about ${t.clientName} ${t.name}`}
                disabled={pending}
                onClick={() => save(t.id, !r, t.cadence, day)}
                className="shrink-0 disabled:opacity-60"
              >
                <span className={cn("relative block h-6 w-11 rounded-full transition-colors", r ? "bg-[#2E6FB8]" : "bg-slate-300")}>
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", r ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0B1B33]">{t.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {t.clientName} · {t.cadence === "custom" ? "custom dates" : t.cadence}
                  {r?.last_sent_on ? ` · last reminder ${r.last_sent_on}` : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                {monthly ? "On the" : "Every"}
                <select
                  value={day}
                  disabled={pending || !r}
                  onChange={(e) => save(t.id, true, t.cadence, Number(e.target.value))}
                  aria-label="Reminder day"
                  className="rounded-lg border border-[#D5DCE6] bg-white px-2.5 py-1.5 text-sm focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:bg-[#F6F8FB] disabled:text-slate-400"
                >
                  {monthly
                    ? Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{ordinal(d)}</option>
                      ))
                    : WEEKDAYS.map((w, i) => (
                        <option key={w} value={i}>{w}</option>
                      ))}
                </select>
                {monthly ? "of the month" : null}
              </label>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-500">Changes save as you make them.</p>
        <Button variant="secondary" size="sm" onClick={sendTest} disabled={pending || reminders.length === 0}>
          <Mail className="h-3.5 w-3.5" /> Send test email
        </Button>
      </div>
      {message ? (message.ok ? <p className="text-sm text-emerald-700">{message.text}</p> : <ErrorNote message={message.text} />) : null}
    </div>
  );
}

export default function TeamTable({
  people,
  currentUserId,
  reportTypes,
  reminders,
  remindersReady,
}: {
  people: Profile[];
  currentUserId: string;
  reportTypes: ReportType[];
  reminders: Reminder[];
  remindersReady: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function sendReviewTest(id: string) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await sendTestReviewEmail(id);
      if (res.ok) setNotice(`Test review email sent to ${res.to}.`);
      else setError(res.error);
    });
  }

  function change(id: string, changes: { role?: Role; active?: boolean; notify_on_submit?: boolean }) {
    setError(null);
    startTransition(async () => {
      const res = await updateMember(id, changes);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      {error ? <div className="p-4"><ErrorNote message={error} /></div> : null}
      {notice ? <p className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">{notice}</p> : null}
      {!remindersReady ? (
        <p className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
          Email reminders need one more database step. Run <code>supabase/portal-migration-002-reminders.sql</code> in the Supabase SQL Editor.
        </p>
      ) : null}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-[#EEF1F5] bg-[#F8FAFC]">
            <tr>
              <th className={`${thClass} pl-5`}>Person</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Access</th>
              <th className={thClass} title="Admins: email me when a report is submitted for review">Review emails</th>
              <th className={`${thClass} pr-5`}>Reminders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF1F5]">
            {people.map((p) => {
              const me = p.id === currentUserId;
              const name = p.full_name || p.email;
              const mine = reminders.filter((r) => r.profile_id === p.id);
              const isOpen = open === p.id;
              return (
                <Fragment key={p.id}>
                  <tr className={cn(!p.active && "bg-[#FBFCFE]")}>
                    <td className="py-3.5 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} size={34} className={cn(!p.active && "opacity-50")} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-[#0F2341]">
                            {name}
                            {me ? <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span> : null}
                          </div>
                          {p.full_name ? <div className="truncate text-xs text-slate-500">{p.email}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={p.role}
                        disabled={me || pending}
                        aria-label={`Role for ${name}`}
                        onChange={(e) => change(p.id, { role: e.target.value as Role })}
                        className="rounded-lg border border-[#D5DCE6] bg-white px-2.5 py-1.5 text-sm focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:bg-[#F6F8FB] disabled:text-slate-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.active}
                        aria-label={`${name} can sign in`}
                        disabled={me || pending}
                        onClick={() => change(p.id, { active: !p.active })}
                        className="group inline-flex items-center gap-2.5 disabled:cursor-not-allowed"
                      >
                        <span className={cn("relative h-6 w-11 rounded-full transition-colors", p.active ? "bg-emerald-600" : "bg-slate-300", (me || pending) && "opacity-60")}>
                          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", p.active ? "left-[22px]" : "left-0.5")} />
                        </span>
                        <span className={cn("whitespace-nowrap text-sm", p.active ? "text-emerald-700" : "text-slate-500")}>{p.active ? "Can sign in" : "No access"}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.role === "admin" ? (
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.notify_on_submit !== false}
                            aria-label={`Email ${name} when a report is submitted for review`}
                            disabled={pending || !p.active}
                            onClick={() => change(p.id, { notify_on_submit: p.notify_on_submit === false })}
                            className="disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className={cn("relative block h-6 w-11 rounded-full transition-colors", p.notify_on_submit !== false ? "bg-[#2E6FB8]" : "bg-slate-300")}>
                              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", p.notify_on_submit !== false ? "left-[22px]" : "left-0.5")} />
                            </span>
                          </button>
                          {p.notify_on_submit !== false && p.active ? (
                            <button
                              type="button"
                              onClick={() => sendReviewTest(p.id)}
                              disabled={pending}
                              className="whitespace-nowrap text-xs font-medium text-[#1F5A99] hover:underline disabled:opacity-50"
                            >
                              Send test
                            </button>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400" title="Only admins review reports">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 pr-5">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : p.id)}
                        disabled={!remindersReady || !p.active}
                        aria-expanded={isOpen}
                        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 transition-colors hover:bg-[#EEF4FB] hover:text-[#0B1B33] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <BellRing className={cn("h-4 w-4", mine.length ? "text-[#2E6FB8]" : "text-slate-400")} />
                        <span className="max-w-[220px] truncate">
                          {mine.length === 0 ? "Off" : mine.length === 1 ? `On · ${scheduleText(mine[0])}` : `${mine.length} reminders`}
                        </span>
                        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                      </button>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <ReminderPanel person={p} reportTypes={reportTypes} reminders={mine} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
