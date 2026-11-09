"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import { duplicateTemplate, saveTemplate, setTemplateArchived } from "@/lib/portal/actions";
import { newId } from "@/lib/portal/compute";
import {
  SECTION_TYPES,
  VALUE_FORMATS,
  type AdsSection,
  type BudgetSection,
  type Cadence,
  type Section,
  type SectionType,
  type StatsSection,
  type TableSection,
  type TemplateSchema,
  type TextSection,
  type ValueFormat,
} from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Button, Card, ErrorNote, Field, inputClass } from "./ui";

const small =
  "block w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2E5F8A] focus:outline-none focus:ring-2 focus:ring-[#2E5F8A]/15";

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function ListControls({ i, count, onMove, onRemove }: { i: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" onClick={() => onMove(-1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move up">
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={i === count - 1} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move down">
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onRemove} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function FormatSelect({ value, onChange }: { value: ValueFormat; onChange: (v: ValueFormat) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as ValueFormat)} className={small}>
      {VALUE_FORMATS.map((f) => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
  );
}

function newSection(type: SectionType): Section {
  const id = newId();
  switch (type) {
    case "stats":
      return { id, type, title: "Key Numbers", fields: [{ id: newId(), label: "New stat", format: "number" }] };
    case "table":
      return {
        id,
        type,
        title: "Table",
        columns: [
          { id: newId(), label: "Description", format: "text" },
          { id: newId(), label: "Value", format: "number" },
        ],
      };
    case "ads":
      return { id, type, title: "Ad Campaigns", carryOver: true, channels: [{ id: newId(), name: "Social Media Ads", metricLabel: "Clicks" }] };
    case "budget":
      return { id, type, title: "Budget Overview", year: new Date().getFullYear(), lines: [] };
    case "text":
      return { id, type, title: "Notes" };
  }
}

// ----- Per-type settings -----

function StatsSettings({ section, onChange }: { section: StatsSection; onChange: (s: StatsSection) => void }) {
  const set = (fields: StatsSection["fields"]) => onChange({ ...section, fields });
  return (
    <div>
      <div className="hidden grid-cols-[1fr_190px_80px_70px_76px] gap-2 pb-1 text-xs font-medium text-slate-500 md:grid">
        <span>Label</span><span>Format</span><span title="Show change since last report">Compare</span><span title="Small trend line on the PDF">Trend</span><span />
      </div>
      <div className="space-y-2">
        {section.fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-2 items-center gap-2 rounded-lg bg-slate-50 p-2 md:grid-cols-[1fr_190px_80px_70px_76px] md:bg-transparent md:p-0">
            <input value={f.label} onChange={(e) => set(section.fields.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)))} className={cn(small, "col-span-2 md:col-span-1")} placeholder="Label" />
            <div className="col-span-2 md:col-span-1">
              <FormatSelect value={f.format} onChange={(v) => set(section.fields.map((x) => (x.id === f.id ? { ...x, format: v } : x)))} />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={Boolean(f.compare)} onChange={(e) => set(section.fields.map((x) => (x.id === f.id ? { ...x, compare: e.target.checked } : x)))} />
              <span className="md:hidden">Compare</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={Boolean(f.trend)} onChange={(e) => set(section.fields.map((x) => (x.id === f.id ? { ...x, trend: e.target.checked } : x)))} />
              <span className="md:hidden">Trend</span>
            </label>
            <ListControls i={i} count={section.fields.length} onMove={(d) => set(move(section.fields, i, d))} onRemove={() => set(section.fields.filter((x) => x.id !== f.id))} />
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => set([...section.fields, { id: newId(), label: "", format: "number" }])}>
        <Plus className="h-3.5 w-3.5" /> Add stat
      </Button>
      <p className="mt-2 text-xs text-slate-500">
        <strong>Compare</strong> shows the change since the last report (e.g. “+312 since last week”). <strong>Trend</strong> adds a small line chart from past reports.
      </p>
    </div>
  );
}

function TableSettings({ section, onChange }: { section: TableSection; onChange: (s: TableSection) => void }) {
  const set = (columns: TableSection["columns"]) => onChange({ ...section, columns });
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Number the rows as" hint="e.g. “Post” gives Post 1, Post 2… Leave empty for no numbers.">
          <input value={section.numberLabel ?? ""} onChange={(e) => onChange({ ...section, numberLabel: e.target.value })} className={small} />
        </Field>
        <Field label="When there are no rows, the PDF says">
          <input value={section.emptyText ?? ""} placeholder="Nothing to report." onChange={(e) => onChange({ ...section, emptyText: e.target.value })} className={small} />
        </Field>
      </div>
      <div>
        <div className="hidden grid-cols-[1fr_190px_1fr_60px_76px] gap-2 pb-1 text-xs font-medium text-slate-500 md:grid">
          <span>Column</span><span>Format</span><span>Dropdown choices (comma separated)</span><span>Total</span><span />
        </div>
        <div className="space-y-2">
          {section.columns.map((c, i) => (
            <div key={c.id} className="grid grid-cols-2 items-center gap-2 rounded-lg bg-slate-50 p-2 md:grid-cols-[1fr_190px_1fr_60px_76px] md:bg-transparent md:p-0">
              <input value={c.label} placeholder="Column name" onChange={(e) => set(section.columns.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)))} className={cn(small, "col-span-2 md:col-span-1")} />
              <div className="col-span-2 md:col-span-1">
                <FormatSelect value={c.format} onChange={(v) => set(section.columns.map((x) => (x.id === c.id ? { ...x, format: v } : x)))} />
              </div>
              <input
                key={`${c.id}-opts`}
                defaultValue={(c.options ?? []).join(", ")}
                placeholder="Optional"
                onBlur={(e) => {
                  const options = e.target.value.split(",").map((o) => o.trim()).filter(Boolean);
                  set(section.columns.map((x) => (x.id === c.id ? { ...x, options: options.length ? options : undefined } : x)));
                }}
                className={cn(small, "col-span-2 md:col-span-1")}
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input type="checkbox" checked={Boolean(c.total)} onChange={(e) => set(section.columns.map((x) => (x.id === c.id ? { ...x, total: e.target.checked } : x)))} />
                <span className="md:hidden">Total</span>
              </label>
              <ListControls i={i} count={section.columns.length} onMove={(d) => set(move(section.columns, i, d))} onRemove={() => set(section.columns.filter((x) => x.id !== c.id))} />
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => set([...section.columns, { id: newId(), label: "", format: "text" }])}>
          <Plus className="h-3.5 w-3.5" /> Add column
        </Button>
      </div>
    </div>
  );
}

function AdsSettings({ section, onChange }: { section: AdsSection; onChange: (s: AdsSection) => void }) {
  const set = (channels: AdsSection["channels"]) => onChange({ ...section, channels });
  return (
    <div>
      <div className="hidden grid-cols-[1fr_1fr_76px] gap-2 pb-1 text-xs font-medium text-slate-500 md:grid">
        <span>Channel</span><span>Last column (what you count)</span><span />
      </div>
      <div className="space-y-2">
        {section.channels.map((c, i) => (
          <div key={c.id} className="grid grid-cols-[1fr_1fr_76px] items-center gap-2">
            <input value={c.name} placeholder="e.g. Google Ads" onChange={(e) => set(section.channels.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))} className={small} />
            <input value={c.metricLabel} placeholder="e.g. Link Clicks" onChange={(e) => set(section.channels.map((x) => (x.id === c.id ? { ...x, metricLabel: e.target.value } : x)))} className={small} />
            <ListControls i={i} count={section.channels.length} onMove={(d) => set(move(section.channels, i, d))} onRemove={() => set(section.channels.filter((x) => x.id !== c.id))} />
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => set([...section.channels, { id: newId(), name: "", metricLabel: "Clicks" }])}>
        <Plus className="h-3.5 w-3.5" /> Add channel
      </Button>
      <p className="mt-2 text-xs text-slate-500">Each ad has a description, daily budget, spend, impressions and the last column above.</p>
    </div>
  );
}

function BudgetSettings({
  section,
  onChange,
  adsSections,
}: {
  section: BudgetSection;
  onChange: (s: BudgetSection) => void;
  adsSections: AdsSection[];
}) {
  const set = (lines: BudgetSection["lines"]) => onChange({ ...section, lines });
  const sources = [
    { value: "manual", label: "Typed in each report" },
    ...adsSections.flatMap((a) => a.channels.map((c) => ({ value: `${a.id}:${c.id}`, label: `Ad spend: ${c.name || "(unnamed)"}` }))),
  ];
  return (
    <div className="space-y-4">
      <Field label="Budget year" className="max-w-[140px]">
        <input type="number" value={section.year} onChange={(e) => onChange({ ...section, year: Number(e.target.value) || new Date().getFullYear() })} className={small} />
      </Field>
      <div>
        <div className="hidden grid-cols-[1fr_130px_130px_1fr_76px] gap-2 pb-1 text-xs font-medium text-slate-500 md:grid">
          <span>Line</span><span>Yearly budget</span><span title="Spend before the first report in the portal">Spent before portal</span><span>This period&apos;s spend comes from</span><span />
        </div>
        <div className="space-y-2">
          {section.lines.map((l, i) => {
            const sourceValue = l.source.kind === "manual" ? "manual" : `${l.source.sectionId}:${l.source.channelId}`;
            const update = (patch: Partial<BudgetSection["lines"][number]>) =>
              set(section.lines.map((x) => (x.id === l.id ? { ...x, ...patch } : x)));
            return (
              <div key={l.id} className="grid grid-cols-2 items-center gap-2 rounded-lg bg-slate-50 p-2 md:grid-cols-[1fr_130px_130px_1fr_76px] md:bg-transparent md:p-0">
                <input value={l.label} placeholder="e.g. Google Ads" onChange={(e) => update({ label: e.target.value })} className={cn(small, "col-span-2 md:col-span-1")} />
                <input type="number" step="0.01" value={l.annualBudget} onChange={(e) => update({ annualBudget: Number(e.target.value) || 0 })} className={small} aria-label="Yearly budget" />
                <input type="number" step="0.01" value={l.openingSpend} onChange={(e) => update({ openingSpend: Number(e.target.value) || 0 })} className={small} aria-label="Spent before portal" />
                <select
                  value={sourceValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "manual") update({ source: { kind: "manual" } });
                    else {
                      const [sectionId, channelId] = v.split(":");
                      update({ source: { kind: "channel", sectionId, channelId } });
                    }
                  }}
                  className={cn(small, "col-span-2 md:col-span-1")}
                >
                  {sources.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                  {!sources.some((s) => s.value === sourceValue) ? <option value={sourceValue}>(missing ad channel)</option> : null}
                </select>
                <ListControls i={i} count={section.lines.length} onMove={(d) => set(move(section.lines, i, d))} onRemove={() => set(section.lines.filter((x) => x.id !== l.id))} />
              </div>
            );
          })}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => set([...section.lines, { id: newId(), label: "", annualBudget: 0, openingSpend: 0, source: { kind: "manual" } }])}
        >
          <Plus className="h-3.5 w-3.5" /> Add budget line
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        <strong>Spent before portal</strong> is what was already spent this year before your first report in the portal. Year-to-date then adds up every
        report automatically. Change the year and reset this each January.
      </p>
    </div>
  );
}

function TextSettings({ section, onChange }: { section: TextSection; onChange: (s: TextSection) => void }) {
  return (
    <Field label="Hint shown in the empty box">
      <input value={section.placeholder ?? ""} onChange={(e) => onChange({ ...section, placeholder: e.target.value })} className={small} />
    </Field>
  );
}

// ----- Builder -----

export default function TemplateBuilder({
  template,
  clients,
  reportCount,
}: {
  template: { id: string; name: string; cadence: Cadence; schema: TemplateSchema; archived: boolean; clientId: string };
  clients: { id: string; name: string }[];
  reportCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [cadence, setCadence] = useState<Cadence>(template.cadence);
  const [schema, setSchema] = useState<TemplateSchema>(template.schema);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copyTarget, setCopyTarget] = useState(template.clientId);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setMessage(null);
  };
  const updateSchema = (next: TemplateSchema) => {
    setSchema(next);
    touch();
  };
  const updateSection = (s: Section) => updateSchema({ ...schema, sections: schema.sections.map((x) => (x.id === s.id ? s : x)) });
  const adsSections = schema.sections.filter((s): s is AdsSection => s.type === "ads");

  function save() {
    startTransition(async () => {
      const res = await saveTemplate(template.id, { name, cadence, schema });
      if (res.ok) {
        setDirty(false);
        setMessage({ ok: true, text: "Saved. New reports will use this layout." });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="space-y-5 pb-24">
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1.4fr]">
          <Field label="Template name" hint="Also the default report title on the PDF.">
            <input value={name} onChange={(e) => { setName(e.target.value); touch(); }} className={inputClass} />
          </Field>
          <Field label="How often">
            <select value={cadence} onChange={(e) => { setCadence(e.target.value as Cadence); touch(); }} className={inputClass}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom dates</option>
            </select>
          </Field>
          <Field label="Text before the dates" hint="e.g. “For the week of”">
            <input value={schema.periodLabel} onChange={(e) => updateSchema({ ...schema, periodLabel: e.target.value })} className={inputClass} />
          </Field>
        </div>
        {reportCount > 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {reportCount} report{reportCount === 1 ? "" : "s"} already use this template. They keep the layout they were made with, so editing
            here is safe. Drafts can switch to the new layout from the report page.
          </p>
        ) : null}
      </Card>

      {schema.sections.map((section, i) => {
        const isOpen = open[section.id] ?? false;
        const typeInfo = SECTION_TYPES.find((t) => t.type === section.type);
        return (
          <Card key={section.id}>
            <div className="flex items-center gap-2 px-4 py-3">
              <button type="button" onClick={() => setOpen({ ...open, [section.id]: !isOpen })} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label={isOpen ? "Collapse" : "Expand"}>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <input
                value={section.title}
                onChange={(e) => updateSection({ ...section, title: e.target.value } as Section)}
                className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1 text-sm font-semibold hover:border-slate-200 focus:border-[#2E5F8A] focus:outline-none"
                aria-label="Section title"
              />
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 sm:inline">{typeInfo?.label}</span>
              <button
                type="button"
                title="Duplicate section"
                onClick={() => {
                  const copy = structuredClone(section);
                  copy.id = newId();
                  copy.title = `${section.title} (copy)`;
                  const sections = [...schema.sections];
                  sections.splice(i + 1, 0, copy);
                  updateSchema({ ...schema, sections });
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <ListControls
                i={i}
                count={schema.sections.length}
                onMove={(d) => updateSchema({ ...schema, sections: move(schema.sections, i, d) })}
                onRemove={() => {
                  if (confirm(`Remove “${section.title}” from this template?`)) {
                    updateSchema({ ...schema, sections: schema.sections.filter((x) => x.id !== section.id) });
                  }
                }}
              />
            </div>
            {isOpen ? (
              <div className="space-y-4 border-t border-slate-100 p-4">
                {section.type === "stats" ? <StatsSettings section={section} onChange={updateSection} /> : null}
                {section.type === "table" ? <TableSettings section={section} onChange={updateSection} /> : null}
                {section.type === "ads" ? <AdsSettings section={section} onChange={updateSection} /> : null}
                {section.type === "budget" ? <BudgetSettings section={section} onChange={updateSection} adsSections={adsSections} /> : null}
                {section.type === "text" ? <TextSettings section={section} onChange={updateSection} /> : null}
                {section.type !== "budget" ? (
                  <label className="flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-700">
                    <input type="checkbox" checked={Boolean(section.carryOver)} onChange={(e) => updateSection({ ...section, carryOver: e.target.checked } as Section)} />
                    Copy this section from the last report when starting a new one
                  </label>
                ) : null}
              </div>
            ) : null}
          </Card>
        );
      })}

      <div>
        {adding ? (
          <Card className="p-3">
            <p className="px-2 pb-2 text-xs font-medium text-slate-500">Choose a section type</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTION_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => {
                    const s = newSection(t.type);
                    updateSchema({ ...schema, sections: [...schema.sections, s] });
                    setOpen({ ...open, [s.id]: true });
                    setAdding(false);
                  }}
                  className="rounded-lg border border-slate-200 p-3 text-left hover:border-[#2E5F8A] hover:bg-slate-50"
                >
                  <span className="block text-sm font-medium text-slate-900">{t.label}</span>
                  <span className="block text-xs text-slate-500">{t.description}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-right">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add section
          </Button>
        )}
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">More</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select value={copyTarget} onChange={(e) => setCopyTarget(e.target.value)} className={cn(inputClass, "w-auto")}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                if (dirty) {
                  const res = await saveTemplate(template.id, { name, cadence, schema });
                  if (!res.ok) return setMessage({ ok: false, text: res.error });
                  setDirty(false);
                }
                const res = await duplicateTemplate(template.id, copyTarget);
                if (res && !res.ok) setMessage({ ok: false, text: res.error });
              })
            }
          >
            <Copy className="h-4 w-4" /> Copy template to this client
          </Button>
          <Button
            variant="ghost"
            disabled={pending}
            className="ml-auto"
            onClick={() =>
              startTransition(async () => {
                await setTemplateArchived(template.id, !template.archived);
                router.refresh();
              })
            }
          >
            {template.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {template.archived ? "Restore template" : "Archive template"}
          </Button>
        </div>
      </Card>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {message ? (
            message.ok ? <span className="text-sm text-emerald-700">{message.text}</span> : <ErrorNote message={message.text} />
          ) : dirty ? (
            <span className="text-sm text-amber-700">Unsaved changes</span>
          ) : null}
          <Button onClick={save} disabled={pending || !dirty}>
            {pending ? "Saving…" : "Save template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
