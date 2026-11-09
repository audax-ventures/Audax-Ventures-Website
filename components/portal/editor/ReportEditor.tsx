"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, Lock, RefreshCw, X } from "lucide-react";
import { refreshReportSchema, saveReport } from "@/lib/portal/actions";
import { daysInPeriod, formatPeriod, normalizeData, type HistoryEntry, type ReportContext } from "@/lib/portal/compute";
import type {
  AdsData,
  BudgetData,
  Cadence,
  ReportData,
  ReportStatus,
  Section,
  SectionData,
  StatsData,
  TableData,
  TemplateSchema,
  TextData,
} from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Button, Card, StatusBadge, inputClass } from "../ui";
import { AdsEditor, BudgetEditor, StatsEditor, TableEditor, TextEditor } from "./SectionEditors";
import WorkflowPanel, { type ActivityItem } from "./WorkflowPanel";

export interface EditorReport {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  schema: TemplateSchema;
  data: ReportData;
  updatedAt: string;
  templateId: string;
  createdBy: string | null;
}

interface Props {
  report: EditorReport;
  cadence: Cadence;
  clientName: string;
  history: HistoryEntry[];
  activity: ActivityItem[];
  isAdmin: boolean;
  currentUserId: string;
  templateChanged: boolean;
}

type SaveState = "saved" | "unsaved" | "saving" | "error";

export default function ReportEditor(props: Props) {
  const { report } = props;
  const [title, setTitle] = useState(report.title);
  const [start, setStart] = useState(report.periodStart);
  const [end, setEnd] = useState(report.periodEnd);
  const [data, setData] = useState<ReportData>(() => normalizeData(report.schema, report.data));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(report.updatedAt);
  const [showPreview, setShowPreview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const locked = report.status === "approved" || report.status === "sent";

  // The latest values live in a ref too, so the saver always sends what's on screen.
  const latest = useRef({ title, start, end, data });
  const inFlight = useRef<Promise<boolean> | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    if (inFlight.current) await inFlight.current;
    if (!dirty.current) return true;
    dirty.current = false;
    setSaveState("saving");
    const v = latest.current;
    const run = (async () => {
      const res = await saveReport(report.id, { title: v.title, periodStart: v.start, periodEnd: v.end, data: v.data });
      if (res.ok) {
        setSavedAt(res.savedAt);
        setSaveError(null);
        setSaveState(dirty.current ? "unsaved" : "saved");
        return true;
      }
      dirty.current = true;
      setSaveError(res.error);
      setSaveState("error");
      return false;
    })();
    inFlight.current = run;
    const ok = await run;
    inFlight.current = null;
    return ok;
  }, [report.id]);

  /** Apply an edit and autosave a moment after typing stops. */
  function edit(patch: Partial<typeof latest.current>) {
    if (locked) return;
    latest.current = { ...latest.current, ...patch };
    if (patch.title !== undefined) setTitle(patch.title);
    if (patch.start !== undefined) setStart(patch.start);
    if (patch.end !== undefined) setEnd(patch.end);
    if (patch.data !== undefined) setData(patch.data);
    dirty.current = true;
    setSaveState("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), 900);
  }

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty.current || inFlight.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const ctx: ReportContext = useMemo(
    () => ({
      periodStart: start,
      periodEnd: end,
      schema: report.schema,
      data,
      cadence: props.cadence,
      history: props.history,
    }),
    [start, end, report.schema, data, props.cadence, props.history],
  );

  const setSection = (id: string, d: SectionData) => edit({ data: { ...latest.current.data, [id]: d } });

  const validDates = start && end && end >= start;
  const pdfUrl = `/portal/reports/${report.id}/pdf`;

  async function updateTemplate() {
    if (!confirm("Update this draft to the latest version of the template? Anything you've typed stays where it is.")) return;
    setRefreshing(true);
    await save();
    const res = await refreshReportSchema(report.id);
    if (!res.ok) alert(res.error);
    window.location.reload();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-5">
        {/* Report details */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="text-xs text-slate-500">{props.clientName}</span>
            <span className="ml-auto flex items-center gap-2">
              <SaveIndicator state={saveState} locked={locked} savedAt={savedAt} />
            </span>
          </div>
          <input
            value={title}
            disabled={locked}
            onChange={(e) => edit({ title: e.target.value })}
            aria-label="Report title"
            className="mt-3 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 font-[var(--font-outfit)] text-2xl font-semibold tracking-tight text-slate-900 hover:border-slate-200 focus:border-[#2E5F8A] focus:outline-none disabled:hover:border-transparent"
          />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">From</span>
              <input type="date" value={start} disabled={locked} onChange={(e) => edit({ start: e.target.value })} className={cn(inputClass, "w-auto")} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">To</span>
              <input type="date" value={end} disabled={locked} onChange={(e) => edit({ end: e.target.value })} className={cn(inputClass, "w-auto")} />
            </label>
            <span className="pb-2 text-xs text-slate-500">
              {validDates ? `${formatPeriod(start, end)} · ${daysInPeriod(start, end)} days` : "The end date is before the start date."}
            </span>
            <span className="ml-auto flex gap-2">
              <Button variant="secondary" onClick={async () => { await save(); setShowPreview(true); }}>
                <Eye className="h-4 w-4" /> Preview PDF
              </Button>
              <a href={`${pdfUrl}?download=1`} onClick={() => void save()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Download className="h-4 w-4" /> Download
              </a>
            </span>
          </div>
          {saveError ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Couldn&apos;t save: {saveError}</p> : null}
          {locked ? (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Lock className="h-4 w-4" /> This report is {report.status === "sent" ? "sent" : "approved"} and locked.
              {props.isAdmin ? " Reopen it to make changes." : " Ask an admin to reopen it if something needs to change."}
            </p>
          ) : null}
          {props.templateChanged && report.status === "draft" ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
              <span>The template for this report has changed since it was started.</span>
              <Button size="sm" variant="secondary" onClick={updateTemplate} disabled={refreshing}>
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Use latest template
              </Button>
            </div>
          ) : null}
        </Card>

        {report.schema.sections.length === 0 ? (
          <Card className="p-6 text-sm text-slate-500">This template has no sections yet. Add some in the template editor.</Card>
        ) : null}

        {report.schema.sections.map((section) => (
          <Card key={section.id}>
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
            </div>
            <div className="p-5">
              <SectionEditor
                section={section}
                data={data[section.id]}
                onChange={(d) => setSection(section.id, d)}
                ctx={ctx}
                disabled={locked}
                templateHref={`/portal/templates/${report.templateId}`}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <WorkflowPanel
          reportId={report.id}
          status={report.status}
          isAdmin={props.isAdmin}
          canDelete={props.isAdmin || (report.status === "draft" && report.createdBy === props.currentUserId)}
          activity={props.activity}
          flush={save}
          pdfUrl={pdfUrl}
        />
      </div>

      {showPreview ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={() => setShowPreview(false)}>
          <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold">PDF preview</span>
              <div className="flex items-center gap-2">
                <a href={`${pdfUrl}?download=1`} className="inline-flex items-center gap-1 text-sm font-medium text-[#2E5F8A]">
                  <Download className="h-4 w-4" /> Download
                </a>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} aria-label="Close preview">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <iframe key={savedAt} src={`${pdfUrl}?v=${encodeURIComponent(savedAt)}`} className="w-full flex-1" title="PDF preview" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SaveIndicator({ state, locked, savedAt }: { state: SaveState; locked: boolean; savedAt: string }) {
  if (locked) return null;
  const time = new Date(savedAt).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  const text =
    state === "saving" ? "Saving…" : state === "unsaved" ? "Unsaved changes" : state === "error" ? "Not saved" : `Saved ${time}`;
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-xs",
        state === "error" ? "text-red-600" : state === "saved" ? "text-slate-500" : "text-amber-700",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state === "error" ? "bg-red-500" : state === "saved" ? "bg-emerald-500" : "bg-amber-500",
        )}
      />
      {text}
    </span>
  );
}

function SectionEditor({
  section,
  data,
  onChange,
  ctx,
  disabled,
  templateHref,
}: {
  section: Section;
  data: SectionData;
  onChange: (d: SectionData) => void;
  ctx: ReportContext;
  disabled: boolean;
  templateHref: string;
}) {
  switch (section.type) {
    case "stats":
      return <StatsEditor section={section} data={data as StatsData} onChange={onChange} ctx={ctx} disabled={disabled} />;
    case "table":
      return <TableEditor section={section} data={data as TableData} onChange={onChange} disabled={disabled} />;
    case "ads":
      return <AdsEditor section={section} data={data as AdsData} onChange={onChange} ctx={ctx} disabled={disabled} />;
    case "budget":
      return (
        <BudgetEditor section={section} data={data as BudgetData} onChange={onChange} ctx={ctx} disabled={disabled} templateHref={templateHref} />
      );
    case "text":
      return <TextEditor section={section} data={data as TextData} onChange={onChange} disabled={disabled} />;
  }
}
