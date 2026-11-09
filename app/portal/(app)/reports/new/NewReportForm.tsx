"use client";

import { useState, useTransition } from "react";
import { CalendarRange, Copy, FileText } from "lucide-react";
import { createReport } from "@/lib/portal/actions";
import { daysInPeriod, formatPeriod } from "@/lib/portal/compute";
import type { Cadence } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Button, Card, ClientLogo, ErrorNote, Field, inputClass } from "@/components/portal/ui";

export interface TemplateOption {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  clientLogo: string | null;
  cadence: Cadence;
  suggestedStart: string;
  suggestedEnd: string;
  lastLabel: string | null;
  carrySections: string[];
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-6 sm:px-6">
      <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold text-[#0F2341]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F2341] text-xs font-semibold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function NewReportForm({ options, initialId }: { options: TemplateOption[]; initialId: string }) {
  const [templateId, setTemplateId] = useState(initialId);
  const selected = options.find((o) => o.id === templateId) ?? options[0];
  const clients = [...new Map(options.map((o) => [o.clientId, { id: o.clientId, name: o.clientName, logo: o.clientLogo }])).values()];
  const clientReports = options.filter((o) => o.clientId === selected.clientId);
  const [start, setStart] = useState(selected.suggestedStart);
  const [end, setEnd] = useState(selected.suggestedEnd);
  const [fromPrevious, setFromPrevious] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function chooseTemplate(id: string) {
    const t = options.find((o) => o.id === id);
    if (!t) return;
    setTemplateId(id);
    setStart(t.suggestedStart);
    setEnd(t.suggestedEnd);
  }

  const validDates = Boolean(start && end && end >= start);
  const carry = fromPrevious && Boolean(selected.lastLabel);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createReport({ templateId, periodStart: start, periodEnd: end, startFromPrevious: carry });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] [&>*]:min-w-0">
      <Card className="divide-y divide-[#EEF1F5]">
        <Step n={1} title="Client">
          <div className="flex items-center gap-3">
            <ClientLogo src={selected.clientLogo} name={selected.clientName} size={44} />
            <select
              aria-label="Client"
              value={selected.clientId}
              onChange={(e) => {
                const first = options.find((o) => o.clientId === e.target.value);
                if (first) chooseTemplate(first.id);
              }}
              className={inputClass}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </Step>

        <Step n={2} title="Report">
          <select aria-label="Report" value={templateId} onChange={(e) => chooseTemplate(e.target.value)} className={inputClass}>
            {clientReports.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.cadence === "custom" ? "custom dates" : o.cadence})
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            {selected.lastLabel ? <>Last one covered <span className="font-medium text-slate-700">{selected.lastLabel}</span>.</> : "This will be the first report of this kind."}
          </p>
        </Step>

        <Step n={3} title="Reporting period">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <p className={cn("mt-3 text-xs", validDates ? "text-slate-500" : "text-red-600")}>
            {validDates ? "We picked the period right after the last report. Change it if you need to." : "The end date is before the start date."}
          </p>
        </Step>

        <Step n={4} title="Starting point">
          <label
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 transition-colors",
              selected.lastLabel ? "cursor-pointer border-[#E4E9F0] hover:bg-[#F8FAFC]" : "border-dashed border-[#E4E9F0] opacity-70",
            )}
          >
            <input
              type="checkbox"
              checked={carry}
              disabled={!selected.lastLabel}
              onChange={(e) => setFromPrevious(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#0F2341]"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">Start from the last report</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                {!selected.lastLabel
                  ? "This will be the first report of this kind, so it starts empty."
                  : selected.carrySections.length
                    ? <>Copies these sections from the last report: <span className="font-medium text-slate-700">{selected.carrySections.join(", ")}</span>. For ad campaigns, only the ads and daily budgets are copied; results start blank so nothing old slips through.</>
                    : "This template doesn't copy any sections yet, so the report starts empty."}
              </span>
              <a href={`/portal/templates/${selected.id}`} className="mt-1.5 inline-block text-xs font-medium text-[#1F5A99] hover:underline">
                Choose which sections carry over →
              </a>
            </span>
          </label>
        </Step>
      </Card>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden">
          <div className="border-b border-[#EEF1F5] bg-gradient-to-br from-[#F4F7FB] to-[#E8EEF6] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Summary</p>
            <div className="mt-3 flex items-center gap-3">
              <ClientLogo src={selected.clientLogo} name={selected.clientName} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0F2341]">{selected.name}</p>
                <p className="truncate text-xs text-slate-500">{selected.clientName}</p>
              </div>
            </div>
          </div>
          <dl className="space-y-3.5 p-5 text-sm">
            <div className="flex gap-3">
              <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Period</dt>
                <dd className="font-medium text-slate-800">
                  {validDates ? `${formatPeriod(start, end)} · ${daysInPeriod(start, end)} days` : "Check the dates"}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Last report</dt>
                <dd className="font-medium text-slate-800">{selected.lastLabel ?? "None yet"}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Copy className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Starts</dt>
                <dd className="font-medium text-slate-800">{carry ? "Pre-filled from the last report" : "Empty"}</dd>
              </div>
            </div>
          </dl>
          <div className="space-y-3 border-t border-[#EEF1F5] p-5">
            <ErrorNote message={error} />
            <Button onClick={submit} disabled={pending || !validDates} className="w-full">
              {pending ? "Creating…" : "Create report"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
