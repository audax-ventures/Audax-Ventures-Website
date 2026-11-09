// Formatting and calculations shared by the editor and the PDF.

import type {
  AdsData,
  AdsSection,
  BudgetData,
  BudgetSection,
  Cadence,
  ReportData,
  Section,
  SectionData,
  StatsData,
  StatField,
  TableData,
  TemplateSchema,
  TextData,
  ValueFormat,
} from "./types";

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Turn what someone typed ("$1,477.50", "35.4K", "-42%") into a number. */
export function toNum(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  let s = input.trim().replace(/[$,%\s]/g, "");
  if (!s || s === "-") return null;
  let mult = 1;
  const suffix = s.slice(-1).toUpperCase();
  if (suffix === "K") mult = 1_000;
  if (suffix === "M") mult = 1_000_000;
  if (mult !== 1) s = s.slice(0, -1);
  const n = Number(s);
  return Number.isFinite(n) ? n * mult : null;
}

const numberFmt = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 });
const currencyFmt = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${trimZero((abs / 1_000_000).toFixed(1))}M`;
  if (abs >= 10_000) return `${sign}${trimZero((abs / 1_000).toFixed(1))}K`;
  return numberFmt.format(n);
}

function trimZero(s: string): string {
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function formatCurrency(n: number): string {
  return currencyFmt.format(n);
}

export function formatValue(raw: string | number | null | undefined, format: ValueFormat): string {
  if (format === "text") return raw === null || raw === undefined || raw === "" ? "—" : String(raw);
  if (format === "date") return raw ? formatDate(String(raw)) : "—";
  const n = toNum(raw);
  if (n === null) return raw && String(raw).trim() ? String(raw) : "—";
  switch (format) {
    case "number":
      return numberFmt.format(n);
    case "compact":
      return formatCompact(n);
    case "currency":
      return formatCurrency(n);
    case "percent":
      return `${trimZero(n.toFixed(1))}%`;
    case "change":
      return `${n > 0 ? "+" : ""}${trimZero(n.toFixed(1))}%`;
  }
}

/** Format the difference between two values, e.g. "+312" or "+4.2 pts". */
export function formatDelta(delta: number, format: ValueFormat): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "±";
  const abs = Math.abs(delta);
  switch (format) {
    case "percent":
    case "change":
      return `${sign}${trimZero(abs.toFixed(1))} pts`;
    case "currency":
      return `${sign}${formatCurrency(abs)}`;
    case "compact":
      return `${sign}${formatCompact(abs)}`;
    default:
      return `${sign}${numberFmt.format(abs)}`;
  }
}

export function isNumericFormat(format: ValueFormat): boolean {
  return format !== "text" && format !== "date";
}

// ----- Dates (always YYYY-MM-DD strings, handled in UTC to avoid time-zone drift) -----

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function toUTC(iso: string): Date {
  const { y, m, d } = parts(iso);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const { y, m, d } = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatShortDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const { m, d } = parts(iso);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
}

/** "October 26 – November 1, 2026" or "September 1 – 30, 2026". */
export function formatPeriod(start: string, end: string): string {
  const a = parts(start);
  const b = parts(end);
  if (start === end) return formatDate(start);
  if (a.y !== b.y) return `${formatDate(start)} – ${formatDate(end)}`;
  if (a.m === b.m) return `${MONTHS[a.m - 1]} ${a.d} – ${b.d}, ${a.y}`;
  return `${MONTHS[a.m - 1]} ${a.d} – ${MONTHS[b.m - 1]} ${b.d}, ${a.y}`;
}

export function daysInPeriod(start: string, end: string): number {
  const diff = (toUTC(end).getTime() - toUTC(start).getTime()) / 86_400_000;
  return Math.max(1, Math.round(diff) + 1);
}

export function yearOf(iso: string): number {
  return parts(iso).y;
}

/** A sensible default period for a new report. */
export function suggestPeriod(
  cadence: Cadence,
  lastEnd: string | null,
): { start: string; end: string } {
  const today = todayISO();
  if (cadence === "monthly") {
    let y: number, m: number;
    if (lastEnd) {
      const next = parts(addDays(lastEnd, 1));
      y = next.y;
      m = next.m;
    } else {
      // Default to last full month.
      const t = parts(today);
      y = t.m === 1 ? t.y - 1 : t.y;
      m = t.m === 1 ? 12 : t.m - 1;
    }
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = toISO(new Date(Date.UTC(y, m, 0)));
    return { start, end };
  }
  if (lastEnd) {
    const start = addDays(lastEnd, 1);
    return { start, end: addDays(start, 6) };
  }
  // Default to the last full Monday–Sunday week.
  const daysSinceMonday = (toUTC(today).getUTCDay() + 6) % 7;
  const lastMonday = addDays(today, -daysSinceMonday - 7);
  return { start: lastMonday, end: addDays(lastMonday, 6) };
}

export function cadenceWord(cadence: Cadence): string {
  return cadence === "weekly" ? "last week" : cadence === "monthly" ? "last month" : "last report";
}

// ----- Report data helpers -----

export function emptySectionData(section: Section): SectionData {
  switch (section.type) {
    case "stats":
      return { values: {} } satisfies StatsData;
    case "table":
      return { rows: [] } satisfies TableData;
    case "ads":
      return {
        channels: Object.fromEntries(section.channels.map((c) => [c.id, { rows: [] }])),
      } satisfies AdsData;
    case "budget":
      return { manual: {} } satisfies BudgetData;
    case "text":
      return { text: "" } satisfies TextData;
  }
}

/** Make sure every section has data of the right shape. */
export function normalizeData(schema: TemplateSchema, data: ReportData | null | undefined): ReportData {
  const out: ReportData = {};
  for (const section of schema.sections) {
    const existing = data?.[section.id];
    const empty = emptySectionData(section);
    if (!existing) {
      out[section.id] = empty;
      continue;
    }
    if (section.type === "ads") {
      const ads = existing as AdsData;
      const channels: AdsData["channels"] = {};
      for (const c of section.channels) channels[c.id] = ads.channels?.[c.id] ?? { rows: [] };
      out[section.id] = { channels };
    } else {
      out[section.id] = { ...empty, ...existing } as SectionData;
    }
  }
  return out;
}

/** Start a new report: copy sections marked "carry over" from the previous report. */
export function carryOverData(schema: TemplateSchema, previous: ReportData | null): ReportData {
  const data = normalizeData(schema, null);
  if (!previous) return data;
  for (const section of schema.sections) {
    if (!section.carryOver || !previous[section.id]) continue;
    const copy = structuredClone(previous[section.id]);
    // Give copied rows fresh ids.
    if (section.type === "table") {
      (copy as TableData).rows = ((copy as TableData).rows ?? []).map((r) => ({ ...r, id: newId() }));
    }
    if (section.type === "ads") {
      // Keep the running ads and their daily budgets, but clear last period's results
      // so old numbers can't slip into the new report.
      for (const ch of Object.values((copy as AdsData).channels ?? {})) {
        ch.rows = ch.rows.map((r) => ({
          ...r,
          id: newId(),
          totalSpend: "",
          impressions: "",
          metric: "",
        }));
      }
    }
    data[section.id] = copy;
  }
  return normalizeData(schema, data);
}

// ----- Context for calculations that look at other reports -----

export interface HistoryEntry {
  period_start: string;
  period_end: string;
  schema: TemplateSchema;
  data: ReportData;
}

export interface ReportContext {
  periodStart: string;
  periodEnd: string;
  schema: TemplateSchema;
  data: ReportData;
  cadence: Cadence;
  /** Other reports from the same client and template that start before this one, oldest first. */
  history: HistoryEntry[];
}

export function previousEntry(ctx: ReportContext): HistoryEntry | null {
  return ctx.history.length ? ctx.history[ctx.history.length - 1] : null;
}

export function previousStatValue(ctx: ReportContext, sectionId: string, field: StatField): number | null {
  const prev = previousEntry(ctx);
  const values = (prev?.data[sectionId] as StatsData | undefined)?.values;
  return values ? toNum(values[field.id]) : null;
}

/** Values of one stat across past reports plus this one, oldest first (for trend lines). */
export function statTrend(ctx: ReportContext, sectionId: string, field: StatField, max = 8): number[] {
  const past = ctx.history
    .map((h) => toNum((h.data[sectionId] as StatsData | undefined)?.values?.[field.id]))
    .filter((n): n is number => n !== null);
  const current = toNum((ctx.data[sectionId] as StatsData | undefined)?.values?.[field.id]);
  const series = current === null ? past : [...past, current];
  return series.slice(-max);
}

export function tableColumnTotal(data: TableData, columnId: string): number {
  return data.rows.reduce((sum, r) => sum + (toNum(r.cells[columnId]) ?? 0), 0);
}

// ----- Ads -----

/** Spend for one ad. If "total spend" is blank, use daily budget × days in the period. */
export function adRowSpend(row: { dailyBudget: string; totalSpend: string }, days: number): number {
  const total = toNum(row.totalSpend);
  if (total !== null) return total;
  const daily = toNum(row.dailyBudget);
  return daily !== null ? daily * days : 0;
}

export function adChannelTotals(
  section: AdsSection,
  data: AdsData | undefined,
  channelId: string,
  days: number,
) {
  const rows = data?.channels?.[channelId]?.rows ?? [];
  return rows.reduce(
    (acc, r) => ({
      spend: acc.spend + adRowSpend(r, days),
      impressions: acc.impressions + (toNum(r.impressions) ?? 0),
      metric: acc.metric + (toNum(r.metric) ?? 0),
    }),
    { spend: 0, impressions: 0, metric: 0 },
  );
}

export function adsSummary(section: AdsSection, data: AdsData | undefined, days: number) {
  let spend = 0;
  let impressions = 0;
  for (const c of section.channels) {
    const t = adChannelTotals(section, data, c.id, days);
    spend += t.spend;
    impressions += t.impressions;
  }
  return { spend, impressions, cpm: impressions > 0 ? (spend / impressions) * 1000 : null };
}

// ----- Budget -----

function lineSpendForReport(
  line: BudgetSection["lines"][number],
  budgetSectionId: string,
  schema: TemplateSchema,
  data: ReportData,
  periodStart: string,
  periodEnd: string,
): number {
  if (line.source.kind === "manual") {
    const budgetData = data[budgetSectionId] as BudgetData | undefined;
    return toNum(budgetData?.manual?.[line.id]) ?? 0;
  }
  const { sectionId, channelId } = line.source;
  const adsSection = schema.sections.find((s) => s.id === sectionId && s.type === "ads") as
    | AdsSection
    | undefined;
  if (!adsSection) return 0;
  return adChannelTotals(
    adsSection,
    data[sectionId] as AdsData | undefined,
    channelId,
    daysInPeriod(periodStart, periodEnd),
  ).spend;
}

export interface BudgetRow {
  id: string;
  label: string;
  annual: number;
  thisPeriod: number;
  ytd: number;
  remaining: number;
  pctUsed: number;
}

export function computeBudget(section: BudgetSection, ctx: ReportContext) {
  const rows: BudgetRow[] = section.lines.map((line) => {
    const thisPeriod = lineSpendForReport(
      line, section.id, ctx.schema, ctx.data, ctx.periodStart, ctx.periodEnd,
    );
    const earlier = ctx.history
      .filter((h) => yearOf(h.period_start) === section.year)
      .reduce(
        (sum, h) =>
          sum + lineSpendForReport(line, section.id, h.schema, h.data, h.period_start, h.period_end),
        0,
      );
    const countsThisYear = yearOf(ctx.periodStart) === section.year;
    const ytd = (line.openingSpend || 0) + earlier + (countsThisYear ? thisPeriod : 0);
    const annual = line.annualBudget || 0;
    return {
      id: line.id,
      label: line.label,
      annual,
      thisPeriod,
      ytd,
      remaining: annual - ytd,
      pctUsed: annual > 0 ? ytd / annual : 0,
    };
  });
  const totals = rows.reduce(
    (t, r) => ({
      annual: t.annual + r.annual,
      thisPeriod: t.thisPeriod + r.thisPeriod,
      ytd: t.ytd + r.ytd,
      remaining: t.remaining + r.remaining,
    }),
    { annual: 0, thisPeriod: 0, ytd: 0, remaining: 0 },
  );
  return { rows, totals };
}
