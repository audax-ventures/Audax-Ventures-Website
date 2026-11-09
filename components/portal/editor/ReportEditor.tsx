"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Columns2,
  Download,
  Eye,
  Hash,
  History,
  Lock,
  Megaphone,
  RefreshCw,
  Send,
  Table2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { approveReport, refreshReportSchema, saveReport, submitForReview } from "@/lib/portal/actions";
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
import { Button, Card, ClientLogo, ErrorNote, IconBadge, StatusBadge, buttonClass, inputClass, type IconTone } from "../ui";
import { AdsEditor, BudgetEditor, StatsEditor, TableEditor, TextEditor } from "./SectionEditors";
import WorkflowPanel, { type ActivityItem } from "./WorkflowPanel";
import LivePdfPreview from "./LivePdfPreview";

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
  clientColor: string;
  history: HistoryEntry[];
  activity: ActivityItem[];
  isAdmin: boolean;
  currentUserId: string;
  templateChanged: boolean;
}

type SaveState = "saved" | "unsaved" | "saving" | "error";

export const SECTION_INFO: Record<Section["type"], { icon: LucideIcon; hint: string; tone: IconTone; tint: string }> = {
  stats: { icon: Hash, hint: "Key numbers", tone: "blue", tint: "from-[#EEF4FB]" },
  table: { icon: Table2, hint: "Table", tone: "violet", tint: "from-violet-50" },
  ads: { icon: Megaphone, hint: "Ad campaigns", tone: "amber", tint: "from-amber-50" },
  budget: { icon: Wallet, hint: "Budget tracker · calculated for you", tone: "green", tint: "from-emerald-50" },
  text: { icon: AlignLeft, hint: "Notes", tone: "slate", tint: "from-slate-50" },
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

function hexToRgba(hex: string, alpha: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(46,95,138,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export default function ReportEditor(props: Props) {
  const { report } = props;
  const router = useRouter();
  const [title, setTitle] = useState(report.title);
  const [start, setStart] = useState(report.periodStart);
  const [end, setEnd] = useState(report.periodEnd);
  const [data, setData] = useState<ReportData>(() => normalizeData(report.schema, report.data));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(report.updatedAt);
  const [drawerPreview, setDrawerPreview] = useState(false);
  const [pane, setPane] = useState<"review" | "preview">("review");
  const [refreshing, setRefreshing] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string | null>(report.schema.sections[0]?.id ?? null);
  const [showSticky, setShowSticky] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acting, startAction] = useTransition();
  const headerRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);

  const locked = report.status === "approved" || report.status === "sent";
  const sections = report.schema.sections;

  // ----- Saving -----
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

  // Warn before leaving with unsaved changes; Cmd/Ctrl+S saves right away.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current || inFlight.current) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
      if (e.key === "Escape") {
        setDatesOpen(false);
        setDrawerPreview(false);
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [save]);

  // Show the slim toolbar once the header scrolls out of view.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Highlight the section currently on screen.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(`section-${s.id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id.replace("section-", ""));
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // Close the dates popover when clicking elsewhere.
  useEffect(() => {
    if (!datesOpen) return;
    const onDown = (e: MouseEvent) => {
      if (datesRef.current && !datesRef.current.contains(e.target as Node)) setDatesOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [datesOpen]);

  const ctx: ReportContext = useMemo(
    () => ({ periodStart: start, periodEnd: end, schema: report.schema, data, cadence: props.cadence, history: props.history }),
    [start, end, report.schema, data, props.cadence, props.history],
  );

  const setSection = (id: string, d: SectionData) => edit({ data: { ...latest.current.data, [id]: d } });
  const validDates = Boolean(start && end && end >= start);
  const pdfUrl = `/portal/reports/${report.id}/pdf`;
  const filled = sections.filter((s) => sectionHasContent(s, data[s.id])).length;
  const splitView = pane === "preview";

  async function updateTemplate() {
    if (!confirm("Update this draft to the latest version of the template? Anything you've typed stays where it is.")) return;
    setRefreshing(true);
    await save();
    const res = await refreshReportSchema(report.id);
    if (!res.ok) alert(res.error);
    window.location.reload();
  }

  function openPreview() {
    void save();
    // Wide screens get the side-by-side view; smaller ones a full-height drawer.
    if (window.matchMedia("(min-width: 1280px)").matches) setPane((p) => (p === "preview" ? "review" : "preview"));
    else setDrawerPreview(true);
  }

  // The one "next step" button in the toolbar.
  const primary = (() => {
    if (report.status === "draft") {
      return props.isAdmin
        ? { label: "Approve now", icon: CheckCircle2, variant: "success" as const, run: approveReport, confirm: "Approve this report now? It will be locked and the final PDF saved." }
        : { label: "Submit for review", icon: Send, variant: "primary" as const, run: submitForReview };
    }
    if (report.status === "in_review" && props.isAdmin) {
      return { label: "Approve", icon: CheckCircle2, variant: "success" as const, run: approveReport };
    }
    return null;
  })();

  function runPrimary() {
    if (!primary) return;
    if (primary.confirm && !window.confirm(primary.confirm)) return;
    setActionError(null);
    startAction(async () => {
      if (!(await save())) {
        setActionError("Your latest changes couldn't be saved, so nothing was changed.");
        return;
      }
      const res = await primary.run(report.id, "");
      if (res && !res.ok) setActionError(res.error);
      // After submitting, go back to the reports list (with a confirmation banner).
      else if (primary.run === submitForReview) router.push("/portal/reports?submitted=1");
      else router.refresh();
    });
  }

  const actionButtons = (size: "sm" | "md") => (
    <>
      <Button variant={splitView ? "primary" : "secondary"} size={size} onClick={openPreview} aria-pressed={splitView}>
        {splitView ? <X className="h-4 w-4" /> : <Columns2 className="hidden h-4 w-4 xl:block" />}
        {splitView ? null : <Eye className="h-4 w-4 xl:hidden" />}
        {splitView ? "Close preview" : "Preview"}
      </Button>
      {primary ? (
        <Button variant={primary.variant} size={size} onClick={runPrimary} disabled={acting}>
          <primary.icon className="h-4 w-4" /> {primary.label}
        </Button>
      ) : (
        <a href={`${pdfUrl}?download=1`} onClick={() => void save()} className={buttonClass(locked ? "primary" : "secondary", size)}>
          <Download className="h-4 w-4" /> {locked ? "Download PDF" : "Download"}
        </a>
      )}
    </>
  );

  const brand = props.clientColor;

  return (
    <div className="relative">
      {/* Slim toolbar while scrolling */}
      <div className="sticky top-16 z-20 h-0">
      <div
        className={cn(
          "absolute inset-x-0 top-2 transition-all duration-200",
          showSticky ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-hidden={!showSticky}
        inert={!showSticky}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 shadow-[0_10px_30px_-12px_rgba(15,35,65,0.3)] backdrop-blur-xl">
          <span className="hidden h-8 w-1 rounded-full sm:block" style={{ backgroundColor: brand }} aria-hidden />
          <span className="hidden sm:block"><ClientLogo src={props.clientLogo} name={props.clientName} size={30} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0B1B33]">{title || "Untitled report"}</p>
            <p className="truncate text-xs text-slate-500">
              {props.clientName} · {validDates ? formatPeriod(start, end) : "Check the dates"}
            </p>
          </div>
          <span className="hidden sm:block"><StatusBadge status={report.status} /></span>
          <span className="hidden md:block"><SaveIndicator state={saveState} locked={locked} savedAt={savedAt} /></span>
          <div className="flex shrink-0 items-center gap-2">{actionButtons("sm")}</div>
        </div>
      </div>
      </div>

      <div className={cn("grid gap-6 transition-[grid-template-columns] duration-300", splitView ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,46%)]" : "xl:grid-cols-[minmax(0,1fr)_330px]")}>
        <div className="min-w-0 space-y-5">
          {/* Header */}
          <div ref={headerRef}>
            {/* No overflow-hidden here, so the dates popover can extend past the card. */}
            <Card className="relative z-10">
              <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: brand }} aria-hidden />
              <div
                className={cn("relative px-5 pb-5 pt-5 sm:px-7", !locked && !(props.templateChanged && report.status === "draft") && "rounded-b-2xl")}
                style={{ backgroundImage: `linear-gradient(135deg, ${hexToRgba(brand, 0.1)} 0%, ${hexToRgba(brand, 0.03)} 45%, rgba(255,255,255,0) 75%)` }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <ClientLogo src={props.clientLogo} name={props.clientName} size={44} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand }}>{props.clientName}</p>
                    <p className="text-xs text-slate-500">{props.cadence === "weekly" ? "Weekly report" : props.cadence === "monthly" ? "Monthly report" : "Report"}</p>
                  </div>
                  <StatusBadge status={report.status} />
                  <span className="ml-auto">
                    <SaveIndicator state={saveState} locked={locked} savedAt={savedAt} />
                  </span>
                </div>

                <input
                  value={title}
                  disabled={locked}
                  onChange={(e) => edit({ title: e.target.value })}
                  aria-label="Report title"
                  className="-mx-2 mt-4 w-[calc(100%+1rem)] rounded-lg border border-transparent bg-transparent px-2 py-1 font-heading text-[1.6rem] font-bold leading-tight sm:text-[2rem] tracking-tight text-[#0B1B33] transition-colors hover:border-[#DCE4EF] hover:bg-white/60 focus:border-[#2E5F8A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:hover:border-transparent disabled:hover:bg-transparent"
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {/* Dates pill */}
                  <div className="relative" ref={datesRef}>
                    <button
                      type="button"
                      onClick={() => !locked && setDatesOpen((o) => !o)}
                      aria-expanded={datesOpen}
                      disabled={locked}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-sm font-medium shadow-[0_1px_2px_rgba(15,35,65,0.05)] transition-colors",
                        validDates ? "border-[#D6E0EC] text-[#0B1B33]" : "border-red-200 text-red-700",
                        !locked && "hover:border-[#BFD0E4] hover:bg-[#F7FAFD]",
                      )}
                    >
                      <CalendarRange className="h-4 w-4 text-[#2E5F8A]" />
                      {validDates ? formatPeriod(start, end) : "Check the dates"}
                      {validDates ? <span className="text-slate-400">· {daysInPeriod(start, end)} days</span> : null}
                      {!locked ? <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", datesOpen && "rotate-180")} /> : null}
                    </button>
                    {datesOpen ? (
                      <div className="absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-[#E4E9F0] bg-white p-4 shadow-xl">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Reporting period</p>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block">
                            <span className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">From</span>
                            <input type="date" value={start} onChange={(e) => edit({ start: e.target.value })} className={inputClass} />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">To</span>
                            <input type="date" value={end} onChange={(e) => edit({ end: e.target.value })} className={inputClass} />
                          </label>
                        </div>
                        {!validDates ? <p className="mt-2 text-xs text-red-600">The end date is before the start date.</p> : null}
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" onClick={() => setDatesOpen(false)}>Done</Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <span className="ml-auto flex flex-wrap gap-2">{actionButtons("md")}</span>
                </div>

                {saveError ? <div className="mt-4"><ErrorNote message={`Couldn't save: ${saveError}`} /></div> : null}
                {actionError ? <div className="mt-4"><ErrorNote message={actionError} /></div> : null}
              </div>

              {locked ? (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-b-2xl border-t px-5 py-3 text-sm sm:px-7",
                    report.status === "sent" ? "border-sky-100 bg-sky-50 text-sky-900" : "border-emerald-100 bg-emerald-50 text-emerald-900",
                  )}
                >
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>
                    <strong className="font-semibold">{report.status === "sent" ? "Sent to the client." : "Approved."}</strong>{" "}
                    This report is locked.{props.isAdmin ? " Reopen it from the review panel to make changes." : " Ask an admin to reopen it if something needs to change."}
                  </span>
                </div>
              ) : null}
              {props.templateChanged && report.status === "draft" ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-2xl border-t border-sky-100 bg-sky-50 px-5 py-3 text-sm text-sky-900 sm:px-7">
                  <span>The template for this report has changed since it was started.</span>
                  <Button size="sm" variant="secondary" onClick={updateTemplate} disabled={refreshing}>
                    <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Use latest template
                  </Button>
                </div>
              ) : null}
            </Card>
          </div>

          {sections.length === 0 ? (
            <Card className="p-6 text-sm text-slate-500">This template has no sections yet. Add some in the template editor.</Card>
          ) : null}

          {/* Sections */}
          {sections.map((section, i) => {
            const info = SECTION_INFO[section.type];
            const done = sectionHasContent(section, data[section.id]);
            const isCollapsed = collapsed[section.id] ?? false;
            return (
              <Card key={section.id} className="overflow-hidden">
                <div id={`section-${section.id}`} className="scroll-mt-40">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !isCollapsed }))}
                    aria-expanded={!isCollapsed}
                    className={cn("flex w-full items-center gap-3.5 bg-gradient-to-r to-white px-5 py-4 text-left sm:px-6", info.tint, !isCollapsed && "border-b border-[#EEF1F5]")}
                  >
                    <IconBadge icon={info.icon} tone={info.tone} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block font-heading text-[1.05rem] font-semibold text-[#0B1B33] sm:truncate">{section.title}</span>
                      <span className="block text-xs text-slate-500">
                        {i + 1} of {sections.length} · {info.hint}
                      </span>
                    </span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </span>
                    ) : (
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-[#E4E9F0]">To do</span>
                    )}
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", isCollapsed && "-rotate-90")} />
                  </button>
                </div>
                {!isCollapsed ? (
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
                ) : null}
              </Card>
            );
          })}
        </div>

        {/* Right side: review panel, or the live preview in split view */}
        <div className={cn("min-w-0 xl:sticky xl:self-start", showSticky ? "xl:top-[9.5rem]" : "xl:top-24")}>
          {splitView ? (
            <Card className="flex h-[calc(100vh-11rem)] flex-col overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#EEF1F5] px-4 py-3">
                <Eye className="h-4 w-4 text-[#2E5F8A]" />
                <span className="text-sm font-semibold text-[#0B1B33]">Live preview</span>
                <span className="text-xs text-slate-400">updates as you type</span>
                <span className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPane("review")}>
                    <History className="h-3.5 w-3.5" /> Review panel
                  </Button>
                  <a href={`${pdfUrl}?download=1`} className={buttonClass("ghost", "sm")} title="Download PDF" aria-label="Download PDF">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <LivePdfPreview url={pdfUrl} version={savedAt} />
              </div>
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Progress */}
              {sections.length ? (
                <Card>
                  <div className="flex items-center gap-4 border-b border-[#EEF1F5] px-4 py-4">
                    <ProgressRing value={sections.length ? filled / sections.length : 0} />
                    <div>
                      <p className="font-heading text-[1.05rem] font-semibold text-[#0B1B33]">
                        {filled === sections.length ? "All sections filled in" : `${filled} of ${sections.length} sections`}
                      </p>
                      <p className="text-xs text-slate-500">{filled === sections.length ? "Ready to preview and submit." : "Keep going. It saves as you type."}</p>
                    </div>
                  </div>
                  <ul className="p-2">
                    {sections.map((sec) => {
                      const done = sectionHasContent(sec, data[sec.id]);
                      const active = activeSection === sec.id;
                      const Icon = SECTION_INFO[sec.type].icon;
                      return (
                        <li key={sec.id}>
                          <a
                            href={`#section-${sec.id}`}
                            onClick={() => setCollapsed((c) => ({ ...c, [sec.id]: false }))}
                            aria-current={active ? "location" : undefined}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                              active ? "bg-[#EEF4FB] font-medium text-[#0B1B33]" : "text-slate-600 hover:bg-[#F6F8FB] hover:text-[#0B1B33]",
                            )}
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#2E5F8A]" : "text-slate-400")} />
                            <span className="flex-1 truncate">{sec.title}</span>
                            {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Done" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-slate-200" aria-label="To do" />}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              ) : null}

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
          )}
        </div>
      </div>

      {/* Preview drawer for smaller screens */}
      {drawerPreview ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0B1B33]/40 backdrop-blur-[2px]" onClick={() => setDrawerPreview(false)}>
          <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E4E9F0] px-5 py-3.5">
              <span className="text-sm font-semibold text-[#0B1B33]">PDF preview</span>
              <div className="flex items-center gap-2">
                <a href={`${pdfUrl}?download=1`} className="inline-flex items-center gap-1 text-sm font-medium text-[#2E5F8A]">
                  <Download className="h-4 w-4" /> Download
                </a>
                <Button variant="ghost" size="sm" onClick={() => setDrawerPreview(false)} aria-label="Close preview">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <LivePdfPreview url={pdfUrl} version={savedAt} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = Math.round(value * 100);
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E6EDF6" strokeWidth="6" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={pct === 100 ? "#059669" : "#2E6FB8"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#0B1B33]">{pct}%</span>
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
      title="Saves automatically · ⌘S / Ctrl+S to save now"
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-medium ring-1 ring-[#E4E9F0]",
        state === "error" ? "text-red-600" : state === "saved" ? "text-slate-500" : "text-amber-700",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", state === "error" ? "bg-red-500" : state === "saved" ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
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
      return <BudgetEditor section={section} data={data as BudgetData} onChange={onChange} ctx={ctx} disabled={disabled} templateHref={templateHref} />;
    case "text":
      return <TextEditor section={section} data={data as TextData} onChange={onChange} disabled={disabled} />;
  }
}
