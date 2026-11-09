// Shared types for the reporting portal.
//
// A report template is a list of sections. Each section has a type that
// decides what the team fills in and how it is drawn on the PDF.
// Reports store their own copy of the template ("schema") so editing a
// template later never changes reports that were already made.

export type ValueFormat =
  | "number" // 24,391
  | "compact" // 35.4K
  | "currency" // $1,477.50
  | "percent" // 12.5%
  | "change" // +156% / -42% (coloured up/down)
  | "text"
  | "date";

export const VALUE_FORMATS: { value: ValueFormat; label: string }[] = [
  { value: "number", label: "Number (24,391)" },
  { value: "compact", label: "Short number (35.4K)" },
  { value: "currency", label: "Dollar amount ($1,477.50)" },
  { value: "percent", label: "Percent (12.5%)" },
  { value: "change", label: "Change % (+156% / -42%)" },
  { value: "text", label: "Text" },
  { value: "date", label: "Date" },
];

export interface StatField {
  id: string;
  label: string;
  format: ValueFormat;
  /** Show the change since the previous report. */
  compare?: boolean;
  /** Draw a small trend line from past reports on the PDF. */
  trend?: boolean;
}

export interface TableColumn {
  id: string;
  label: string;
  format: ValueFormat;
  /** When set, the cell is a dropdown with these choices. */
  options?: string[];
  /** Add a totals row for this column. */
  total?: boolean;
}

export interface AdChannel {
  id: string;
  name: string; // "Social Media Ads"
  metricLabel: string; // "Link/Ad Clicks"
}

export type BudgetSource =
  | { kind: "channel"; sectionId: string; channelId: string }
  | { kind: "manual" };

export interface BudgetLine {
  id: string;
  label: string;
  annualBudget: number;
  /** Spend before the first report entered in the portal this year. */
  openingSpend: number;
  source: BudgetSource;
}

interface SectionBase {
  id: string;
  title: string;
  /** Copy this section's values from the previous report when starting a new one. */
  carryOver?: boolean;
}

export interface StatsSection extends SectionBase {
  type: "stats";
  fields: StatField[];
}

export interface TableSection extends SectionBase {
  type: "table";
  columns: TableColumn[];
  /** e.g. "Post" gives a first column "Post 1, Post 2…". Empty = no numbering. */
  numberLabel?: string;
  emptyText?: string;
}

export interface AdsSection extends SectionBase {
  type: "ads";
  channels: AdChannel[];
  /** Show spend and impressions charts for recent periods on the PDF (on unless set to false). */
  trendCharts?: boolean;
}

export interface BudgetSection extends SectionBase {
  type: "budget";
  year: number;
  lines: BudgetLine[];
}

export interface TextSection extends SectionBase {
  type: "text";
  placeholder?: string;
}

export type Section =
  | StatsSection
  | TableSection
  | AdsSection
  | BudgetSection
  | TextSection;

export type SectionType = Section["type"];

export const SECTION_TYPES: { type: SectionType; label: string; description: string }[] = [
  { type: "stats", label: "Key numbers", description: "A set of single stats, e.g. followers or page-view change." },
  { type: "table", label: "Table", description: "Rows with your own columns, e.g. posts or emails." },
  { type: "ads", label: "Ad campaigns", description: "Ads grouped by channel with budget, spend, impressions and clicks." },
  { type: "budget", label: "Budget tracker", description: "Yearly budget, this period's spend, year-to-date and remaining." },
  { type: "text", label: "Notes", description: "Free text, e.g. SEO tasks or general comments." },
];

export type Cadence = "weekly" | "monthly" | "custom";

export interface TemplateSchema {
  /** Shown before the dates, e.g. "For the week of" or "Reporting period". */
  periodLabel: string;
  sections: Section[];
}

// ----- Report data (what the team types in) -----
// Values are kept as the strings people typed so editing feels natural;
// they are turned into numbers when calculating and drawing.

export interface StatsData {
  values: Record<string, string>;
}
export interface TableRow {
  id: string;
  cells: Record<string, string>;
}
export interface TableData {
  rows: TableRow[];
}
export interface AdRow {
  id: string;
  description: string;
  dailyBudget: string;
  totalSpend: string;
  impressions: string;
  metric: string;
}
export interface AdsData {
  channels: Record<string, { rows: AdRow[] }>;
}
export interface BudgetData {
  /** This period's spend for lines with a manual source. */
  manual: Record<string, string>;
}
export interface TextData {
  text: string;
}

export type SectionData = StatsData | TableData | AdsData | BudgetData | TextData;
export type ReportData = Record<string, SectionData>;

export type ReportStatus = "draft" | "in_review" | "approved" | "sent";

export const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  sent: "Sent",
};

// ----- Database rows -----

export type Role = "admin" | "member";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  logo_data: string | null;
  brand_color: string;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  client_id: string;
  name: string;
  cadence: Cadence;
  schema: TemplateSchema;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  client_id: string;
  template_id: string;
  title: string;
  period_start: string; // YYYY-MM-DD
  period_end: string;
  status: ReportStatus;
  schema: TemplateSchema;
  data: ReportData;
  created_by: string | null;
  updated_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportActivity {
  id: string;
  report_id: string;
  actor: string | null;
  action: string;
  note: string | null;
  created_at: string;
}
