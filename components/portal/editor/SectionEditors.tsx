"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ClipboardPaste, Plus, Trash2 } from "lucide-react";
import {
  adChannelTotals,
  computeBudget,
  daysInPeriod,
  formatCompact,
  formatCurrency,
  formatDelta,
  formatValue,
  isNumericFormat,
  newId,
  tableColumnTotal,
  toNum,
  type ReportContext,
} from "@/lib/portal/compute";
import type {
  AdRow,
  AdsData,
  AdsSection,
  BudgetData,
  BudgetSection,
  StatsData,
  StatsSection,
  TableData,
  TableRow,
  TableSection,
  TextData,
  TextSection,
  ValueFormat,
} from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Button, inputClass } from "../ui";

const cellInput =
  "block w-full rounded-lg border border-[#D5DCE6] bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:border-transparent disabled:bg-[#F6F8FB]";

function placeholderFor(format: ValueFormat): string {
  switch (format) {
    case "compact":
      return "e.g. 35.4K";
    case "currency":
      return "$0.00";
    case "percent":
      return "e.g. 24.5";
    case "change":
      return "e.g. 156 or -42";
    case "number":
      return "0";
    default:
      return "";
  }
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function RowActions({
  index,
  count,
  onMove,
  onRemove,
  disabled,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  if (disabled) return null;
  return (
    <div className="flex items-center justify-end gap-0.5">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move up">
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move down">
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onRemove} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ----- Key numbers -----

export function StatsEditor({
  section,
  data,
  onChange,
  ctx,
  disabled,
}: {
  section: StatsSection;
  data: StatsData;
  onChange: (d: StatsData) => void;
  ctx: ReportContext;
  disabled?: boolean;
}) {
  const prev = ctx.history.length ? (ctx.history[ctx.history.length - 1].data[section.id] as StatsData | undefined) : undefined;
  const lastWord = ctx.cadence === "weekly" ? "Last week" : ctx.cadence === "monthly" ? "Last month" : "Last report";
  if (!section.fields.length) return <p className="text-sm text-slate-500">This section has no fields yet. Add some in the template.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {section.fields.map((f) => {
        const raw = data.values[f.id] ?? "";
        const n = toNum(raw);
        const prevN = f.compare ? toNum(prev?.values?.[f.id]) : null;
        const shown = raw.trim() && isNumericFormat(f.format) ? formatValue(raw, f.format) : null;
        return (
          <div key={f.id}>
            <label htmlFor={`${section.id}-${f.id}`} className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">{f.label}</label>
            <input
              id={`${section.id}-${f.id}`}
              type={f.format === "date" ? "date" : "text"}
              inputMode={isNumericFormat(f.format) ? "decimal" : undefined}
              value={raw}
              disabled={disabled}
              placeholder={placeholderFor(f.format)}
              onChange={(e) => onChange({ values: { ...data.values, [f.id]: e.target.value } })}
              className={inputClass}
            />
            <span className="mt-1 flex min-h-4 flex-wrap gap-x-2 text-xs text-slate-500">
              {shown && shown !== raw ? <span>Shows as <strong className="font-medium text-slate-700">{shown}</strong></span> : null}
              {prevN !== null ? (
                <span>
                  {lastWord}: {formatValue(prevN, f.format)}
                  {n !== null ? (
                    <span className={cn("ml-1 font-medium", n - prevN > 0 ? "text-emerald-700" : n - prevN < 0 ? "text-red-600" : "")}>
                      ({formatDelta(n - prevN, f.format)})
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ----- Table -----

function PasteBox({ onPaste, onClose, columns }: { onPaste: (text: string) => void; onClose: () => void; columns: string[] }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-3 rounded-xl border border-[#E4E9F0] bg-[#F8FAFC] p-4">
      <p className="mb-2 text-xs text-slate-600">
        Copy rows from Excel or Google Sheets and paste them here. Columns should be in this order:{" "}
        <strong>{columns.join(" · ")}</strong>
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={inputClass} autoFocus />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={() => { onPaste(text); onClose(); }} disabled={!text.trim()}>Add rows</Button>
      </div>
    </div>
  );
}

export function TableEditor({
  section,
  data,
  onChange,
  disabled,
}: {
  section: TableSection;
  data: TableData;
  onChange: (d: TableData) => void;
  disabled?: boolean;
}) {
  const [pasting, setPasting] = useState(false);
  const rows = data.rows;
  const setRows = (next: TableRow[]) => onChange({ rows: next });
  const setCell = (rowId: string, colId: string, value: string) =>
    setRows(rows.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: value } } : r)));
  const addRow = () => setRows([...rows, { id: newId(), cells: {} }]);
  const hasTotals = section.columns.some((c) => c.total);

  function pasteRows(text: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const added = lines.map<TableRow>((line) => {
      const parts = line.split("\t");
      const cells: Record<string, string> = {};
      section.columns.forEach((c, i) => {
        cells[c.id] = (parts[i] ?? "").trim();
      });
      return { id: newId(), cells };
    });
    setRows([...rows.filter((r) => Object.values(r.cells).some((v) => v?.trim())), ...added]);
  }

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              {section.numberLabel ? <th className="w-16 pb-2 pr-2 font-medium">#</th> : null}
              {section.columns.map((c) => (
                <th key={c.id} className={cn("pb-2 pr-2 font-medium", isNumericFormat(c.format) && "text-right")}>
                  {c.label}
                </th>
              ))}
              {!disabled ? <th className="w-20 pb-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="align-top">
                {section.numberLabel ? (
                  <td className="whitespace-nowrap py-1 pr-2 pt-2.5 text-xs text-slate-500">
                    {section.numberLabel} {i + 1}
                  </td>
                ) : null}
                {section.columns.map((c) => {
                  const value = r.cells[c.id] ?? "";
                  return (
                    <td key={c.id} className={cn("py-1 pr-2", c.format === "text" ? "min-w-[180px]" : "min-w-[110px]")}>
                      {c.options?.length ? (
                        <select value={value} aria-label={`${c.label}, row ${i + 1}`} disabled={disabled} onChange={(e) => setCell(r.id, c.id, e.target.value)} className={cellInput}>
                          <option value="">—</option>
                          {[...c.options, ...(value && !c.options.includes(value) ? [value] : [])].map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          aria-label={`${c.label}, row ${i + 1}`}
                          type={c.format === "date" ? "date" : "text"}
                          inputMode={isNumericFormat(c.format) ? "decimal" : undefined}
                          value={value}
                          disabled={disabled}
                          placeholder={placeholderFor(c.format)}
                          onChange={(e) => setCell(r.id, c.id, e.target.value)}
                          className={cn(cellInput, isNumericFormat(c.format) && "text-right")}
                        />
                      )}
                    </td>
                  );
                })}
                {!disabled ? (
                  <td className="py-1 pt-1.5">
                    <RowActions
                      index={i}
                      count={rows.length}
                      onMove={(dir) => setRows(moveItem(rows, i, dir))}
                      onRemove={() => setRows(rows.filter((x) => x.id !== r.id))}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={section.columns.length + 2} className="py-3 text-sm text-slate-400">
                  No rows yet. The PDF will say “{section.emptyText || "Nothing to report."}”
                </td>
              </tr>
            ) : null}
            {hasTotals && rows.length > 0 ? (
              <tr className="border-t border-slate-200 text-sm font-semibold">
                {section.numberLabel ? <td className="pt-2 text-xs text-slate-500">Total</td> : null}
                {section.columns.map((c, i) => (
                  <td key={c.id} className={cn("px-2 pt-2", isNumericFormat(c.format) && "text-right")}>
                    {c.total ? formatValue(tableColumnTotal(data, c.id), c.format) : !section.numberLabel && i === 0 ? "Total" : ""}
                  </td>
                ))}
                {!disabled ? <td /> : null}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {!disabled ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" /> Add row
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPasting((p) => !p)}>
            <ClipboardPaste className="h-3.5 w-3.5" /> Paste from Excel
          </Button>
        </div>
      ) : null}
      {pasting ? <PasteBox columns={section.columns.map((c) => c.label)} onPaste={pasteRows} onClose={() => setPasting(false)} /> : null}
    </div>
  );
}

// ----- Ads -----

export function AdsEditor({
  section,
  data,
  onChange,
  ctx,
  disabled,
}: {
  section: AdsSection;
  data: AdsData;
  onChange: (d: AdsData) => void;
  ctx: ReportContext;
  disabled?: boolean;
}) {
  const days = daysInPeriod(ctx.periodStart, ctx.periodEnd);
  const setRows = (channelId: string, rows: AdRow[]) =>
    onChange({ channels: { ...data.channels, [channelId]: { rows } } });

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        Leave <em>Spend</em> blank to use daily budget × {days} days.
      </p>
      {section.channels.map((c) => {
        const rows = data.channels[c.id]?.rows ?? [];
        const totals = adChannelTotals(section, data, c.id, days);
        const update = (rowId: string, patch: Partial<AdRow>) =>
          setRows(c.id, rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
        return (
          <div key={c.id}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-[#0F2341]">{c.name}</h4>
              <span className="text-xs text-slate-500">
                {formatCurrency(totals.spend)} spent · {formatCompact(totals.impressions)} impressions ·{" "}
                {formatCompact(totals.metric)} {c.metricLabel.toLowerCase()}
              </span>
            </div>
            <div className="-mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    <th className="min-w-[240px] pb-1.5 pr-2 font-medium">Ad</th>
                    <th className="w-[110px] pb-1.5 pr-2 text-right font-medium">Daily budget</th>
                    <th className="w-[110px] pb-1.5 pr-2 text-right font-medium">Spend</th>
                    <th className="w-[110px] pb-1.5 pr-2 text-right font-medium">Impressions</th>
                    <th className="w-[110px] pb-1.5 pr-2 text-right font-medium">{c.metricLabel}</th>
                    {!disabled ? <th className="w-20" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const daily = toNum(r.dailyBudget);
                    return (
                      <tr key={r.id}>
                        <td className="py-1 pr-2">
                          <input aria-label={`Ad ${i + 1} description`} value={r.description} disabled={disabled} placeholder="e.g. Ad 1 - General Promotion" onChange={(e) => update(r.id, { description: e.target.value })} className={cellInput} />
                        </td>
                        <td className="py-1 pr-2">
                          <input aria-label={`Ad ${i + 1} daily budget`} inputMode="decimal" value={r.dailyBudget} disabled={disabled} placeholder="$0.00" onChange={(e) => update(r.id, { dailyBudget: e.target.value })} className={cn(cellInput, "text-right")} />
                        </td>
                        <td className="py-1 pr-2">
                          <input
                            aria-label={`Ad ${i + 1} spend`}
                            inputMode="decimal"
                            value={r.totalSpend}
                            disabled={disabled}
                            placeholder={daily !== null ? formatCurrency(daily * days) : "$0.00"}
                            onChange={(e) => update(r.id, { totalSpend: e.target.value })}
                            className={cn(cellInput, "text-right")}
                          />
                        </td>
                        <td className="py-1 pr-2">
                          <input aria-label={`Ad ${i + 1} impressions`} inputMode="decimal" value={r.impressions} disabled={disabled} placeholder="0" onChange={(e) => update(r.id, { impressions: e.target.value })} className={cn(cellInput, "text-right")} />
                        </td>
                        <td className="py-1 pr-2">
                          <input aria-label={`Ad ${i + 1} ${c.metricLabel}`} inputMode="decimal" value={r.metric} disabled={disabled} placeholder="0" onChange={(e) => update(r.id, { metric: e.target.value })} className={cn(cellInput, "text-right")} />
                        </td>
                        {!disabled ? (
                          <td className="py-1">
                            <RowActions
                              index={i}
                              count={rows.length}
                              onMove={(dir) => setRows(c.id, moveItem(rows, i, dir))}
                              onRemove={() => setRows(c.id, rows.filter((x) => x.id !== r.id))}
                            />
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-2 text-sm text-slate-400">No {c.name.toLowerCase()} this period. This channel will be left off the PDF.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {!disabled ? (
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setRows(c.id, [...rows, { id: newId(), description: "", dailyBudget: "", totalSpend: "", impressions: "", metric: "" }])
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add ad
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ----- Budget -----

export function BudgetEditor({
  section,
  data,
  onChange,
  ctx,
  disabled,
  templateHref,
}: {
  section: BudgetSection;
  data: BudgetData;
  onChange: (d: BudgetData) => void;
  ctx: ReportContext;
  disabled?: boolean;
  templateHref: string;
}) {
  const { rows, totals } = computeBudget(section, ctx);
  const manualLines = section.lines.filter((l) => l.source.kind === "manual");
  const periodWord = ctx.cadence === "weekly" ? "This week" : ctx.cadence === "monthly" ? "This month" : "This period";
  return (
    <div>
      {manualLines.length ? (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {manualLines.map((l) => (
            <label key={l.id} className="block">
              <span className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">{l.label} · spend {periodWord.toLowerCase()}</span>
              <input
                inputMode="decimal"
                value={data.manual[l.id] ?? ""}
                disabled={disabled}
                placeholder="$0.00"
                onChange={(e) => onChange({ manual: { ...data.manual, [l.id]: e.target.value } })}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      ) : null}
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[#E4E9F0] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <th className="pb-2 font-medium" />
              <th className="pb-2 text-right font-medium">{section.year} budget</th>
              <th className="pb-2 text-right font-medium">{periodWord}</th>
              <th className="pb-2 text-right font-medium">Year to date</th>
              <th className="pb-2 text-right font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <div className="font-medium text-slate-800">{r.label}</div>
                  <div className="mt-1 h-1.5 w-full max-w-[160px] rounded-full bg-slate-100">
                    <div
                      className={cn("h-1.5 rounded-full", r.pctUsed > 1 ? "bg-red-500" : "bg-[#0F2341]")}
                      style={{ width: `${Math.min(100, r.pctUsed * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(r.annual)}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(r.thisPeriod)}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(r.ytd)}</td>
                <td className={cn("py-2 text-right tabular-nums", r.remaining < 0 && "text-red-600")}>{formatCurrency(r.remaining)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-2">Total</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(totals.annual)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(totals.thisPeriod)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(totals.ytd)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(totals.remaining)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Calculated for you: ad spend comes from the ad section, and year-to-date adds up earlier reports from {section.year}.
        Yearly budgets are set in the{" "}
        <a href={templateHref} className="font-medium text-[#2E5F8A] hover:underline">template</a>.
      </p>
    </div>
  );
}

// ----- Notes -----

export function TextEditor({
  section,
  data,
  onChange,
  disabled,
}: {
  section: TextSection;
  data: TextData;
  onChange: (d: TextData) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <textarea
        value={data.text}
        disabled={disabled}
        rows={Math.max(4, Math.min(16, data.text.split("\n").length + 2))}
        placeholder={section.placeholder || "Write here…"}
        onChange={(e) => onChange({ text: e.target.value })}
        className={cn(inputClass, "leading-relaxed")}
      />
      <p className="mt-1 text-xs text-slate-500">Leave a blank line between paragraphs. Start lines with “- ” for bullet points.</p>
    </div>
  );
}
