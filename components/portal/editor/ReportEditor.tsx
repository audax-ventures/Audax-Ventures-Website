"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlignLeft, CheckCircle2, Circle, Download, Eye, Hash, Lock, Megaphone, RefreshCw, Table2, Wallet, X, type LucideIcon } from "lucide-react";
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
import { Button, Card, ClientLogo, ErrorNote, IconBadge, StatusBadge, buttonClass, inputClass } from "../ui";
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
  clientLogo: string | null;
  history: HistoryEntry[];
  activity: ActivityItem[];
  isAdmin: boolean;
  currentUserId: string;
  templateChanged: boolean;
}

type SaveState = "saved" | "unsaved" | "saving" | "error";

const SECTION_INFO: Record<Section["type"], { icon: LucideIcon; hint: string }> = {
  stats: { icon: Hash, hint: "Key numbers" },
  table: { icon: Table2, hint: "Table" },
  ads: { icon: Megaphone, hint: "Ad campaigns" },
  budget: { icon: Wallet, hint: "Budget tracker · calculated for you" },
  text: { icon: AlignLeft, hint: "Notes" },
};

function sectionHasContent(section: Section, d: SectionData | undefined): boolean {
  if (!d) return false;
  switch (section.type) {
    case "stats":
      return Object.values((d as StatsData).values ?? {}).some((v) => (v ?? "").trim() !== "");
    case "table":
      return ((d as TableData).rows ?? []).length > 0;
    case "ads":
      return Object.values((d as AdsData).channels ?? {}).some((c) => c.rows.length > 0);
    case "budget":
      return true;
    case "text":
      return ((d as TextData).text ?? "").trim() !== "";
  }
}

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        {/* Report details */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#EEF1F5] bg-gradient-to-r from-[#F7F9FC] to-white px-5 py-3.5 sm:px-6">
            <ClientLogo src={props.clientLogo} name={props.clientName} size={32} />
            <span className="text-sm font-medium text-slate-600">{props.clientName}</span>
            <StatusBadge status={report.status} />
            <span className="ml-auto">
              <SaveIndicator state={saveState} locked={locked} savedAt={savedAt} />
            </span>
          </div>
          <div className="px-5 pb-5 pt-4 sm:px-6">
            <input
              value={title}
              disabled={locked}
              onChange={(e) => edit({ title: e.target.value })}
              aria-label="Report title"
              className="-mx-2 w-[calc(100%+1rem)] rounded-lg border border-transparent bg-transparent px-2 py-1 font-heading text-[1.65rem] font-semibold tracking-tight text-[#0F2341] transition-colors hover:border-[#E4E9F0] focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:hover:border-transparent"
            />
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">From</span>
                <input type="date" value={start} disabled={locked} onChange={(e) => edit({ start: e.target.value })} className={cn(inputClass, "w-auto")} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">To</span>
                <input type="date" value={end} disabled={locked} onChange={(e) => edit({ end: e.target.value })} className={cn(inputClass, "w-auto")} />
              </label>
              <span className={cn("pb-3 text-xs", validDates ? "text-slate-500" : "text-red-600")}>
                {validDates ? `${formatPeriod(start, end)} · ${daysInPeriod(start, end)} days` : "The end date is before the start date."}
              </span>
              <span className="ml-auto flex gap-2">
                <Button variant="secondary" onClick={async () => { await save(); setShowPreview(true); }}>
                  <Eye className="h-4 w-4" /> Preview PDF
                </Button>
                <a href={`${pdfUrl}?download=1`} onClick={() => void save()} className={buttonClass("secondary")}>
                  <Download className="h-4 w-4" /> Download
                </a>
              </span>
            </div>
            {saveError ? <div className="mt-4"><ErrorNote message={`Couldn't save: ${saveError}`} /></div> : null}
            {locked ? (
              <p className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#E4E9F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-slate-600">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  This report is {report.status === "sent" ? "sent" : "approved"} and locked.
                  {props.isAdmin ? " Reopen it to make changes." : " Ask an admin to reopen it if something needs to change."}
                </span>
              </p>
            ) : null}
            {props.templateChanged && report.status === "draft" ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3.5 py-2.5 text-sm text-sky-900">
                <span>The template for this report has changed since it was started.</span>
                <Button size="sm" variant="secondary" onClick={updateTemplate} disabled={refreshing}>
                  <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Use latest template
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        {report.schema.sections.length === 0 ? (
          <Card className="p-6 text-sm text-slate-500">This template has no sections yet. Add some in the template editor.</Card>
        ) : null}

        {report.schema.sections.map((section, i) => {
          const info = SECTION_INFO[section.type];
          return (
            <Card key={section.id} className="scroll-mt-24">
              <div id={`section-${section.id}`} className="flex items-center gap-3 border-b border-[#EEF1F5] px-5 py-4 sm:px-6">
                <IconBadge icon={info.icon} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[0.95rem] font-semibold text-[#0F2341]">{section.title}</h3>
                  <p className="text-xs text-slate-500">{info.hint}</p>
                </div>
                <span className="text-xs font-medium tabular-nums text-slate-400">
                  {i + 1} / {report.schema.sections.length}
                </span>
              </div>
              <div className="p-5 sm:p-6">
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
          );
        })}
      </div>

      <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <WorkflowPanel
          reportId={report.id}
          status={report.status}
          isAdmin={props.isAdmin}
          canDelete={props.isAdmin || (report.status === "draft" && report.createdBy === props.currentUserId)}
          activity={props.activity}
          flush={save}
          pdfUrl={pdfUrl}
          contents={
            report.schema.sections.length ? (
              <Card>
                <div className="border-b border-[#EEF1F5] px-4 py-3.5">
                  <h3 className="text-sm font-semibold text-[#0F2341]">Sections</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {report.schema.sections.filter((sec) => sectionHasContent(sec, data[sec.id])).length} of {report.schema.sections.length} filled in
                  </p>
                </div>
                <ul className="p-2">
                  {report.schema.sections.map((sec) => {
                    const done = sectionHasContent(sec, data[sec.id]);
                    return (
                      <li key={sec.id}>
                        <a href={`#section-${sec.id}`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-[#F6F8FB] hover:text-[#0F2341]">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Filled in" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-300" aria-label="Empty" />
                          )}
                          <span className="truncate">{sec.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ) : null
          }
        />
      </div>

      {showPreview ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0F2341]/40 backdrop-blur-[2px]" onClick={() => setShowPreview(false)}>
          <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E4E9F0] px-5 py-3.5">
              <span className="text-sm font-semibold text-[#0F2341]">PDF preview</span>
              <div className="flex items-center gap-2">
                <a href={`${pdfUrl}?download=1`} className="inline-flex items-center gap-1 text-sm font-medium text-[#2E5F8A]">
                  <Download className="h-4 w-4" /> Download
                </a>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} aria-label="Close preview">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <iframe key={savedAt} src={`${pdfUrl}?v=${encodeURIComponent(savedAt)}`} className="w-full flex-1 bg-[#F6F8FB]" title="PDF preview" />
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
        "flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium ring-1 ring-[#E4E9F0]",
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
