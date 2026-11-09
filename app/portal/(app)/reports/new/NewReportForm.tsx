"use client";

import { useState, useTransition } from "react";
import { createReport } from "@/lib/portal/actions";
import { daysInPeriod, formatPeriod } from "@/lib/portal/compute";
import type { Cadence } from "@/lib/portal/types";
import { Button, ErrorNote, Field, inputClass } from "@/components/portal/ui";

export interface TemplateOption {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  cadence: Cadence;
  suggestedStart: string;
  suggestedEnd: string;
  lastLabel: string | null;
}

export default function NewReportForm({ options, initialId }: { options: TemplateOption[]; initialId: string }) {
  const [templateId, setTemplateId] = useState(initialId);
  const selected = options.find((o) => o.id === templateId) ?? options[0];
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

  const clients = [...new Set(options.map((o) => o.clientName))];
  const validDates = start && end && end >= start;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createReport({
        templateId,
        periodStart: start,
        periodEnd: end,
        startFromPrevious: fromPrevious && Boolean(selected.lastLabel),
      });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="space-y-5 p-5">
      <Field label="Report">
        <select value={templateId} onChange={(e) => chooseTemplate(e.target.value)} className={inputClass}>
          {clients.map((c) => (
            <optgroup key={c} label={c}>
              {options
                .filter((o) => o.clientName === c)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Period start">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Period end">
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        {validDates ? (
          <>
            {formatPeriod(start, end)} · {daysInPeriod(start, end)} days
          </>
        ) : (
          "Choose a start and end date."
        )}
        {selected.lastLabel ? <> · Last report: {selected.lastLabel}</> : <> · This will be the first one.</>}
      </p>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={fromPrevious && Boolean(selected.lastLabel)}
          disabled={!selected.lastLabel}
          onChange={(e) => setFromPrevious(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#2E5F8A]"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">Start from the last report</span>
          <span className="block text-xs text-slate-500">
            Copies sections set to carry over, such as running ads and upcoming emails. Results from last time are
            left blank so nothing old slips through.
          </span>
        </span>
      </label>

      <ErrorNote message={error} />
      <div className="flex justify-end">
        <Button onClick={submit} disabled={pending || !validDates}>
          {pending ? "Creating…" : "Create report"}
        </Button>
      </div>
    </div>
  );
}
