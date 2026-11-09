import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeData, type HistoryEntry, type ReportContext } from "./compute";
import type {
  Client,
  Profile,
  Report,
  ReportActivity,
  ReportStatus,
  ReportTemplate,
  TemplateSchema,
} from "./types";

type DB = SupabaseClient;

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ----- Clients -----

export async function listClients(db: DB, opts: { includeArchived?: boolean } = {}) {
  let q = db.from("portal_clients").select("*").order("name");
  if (!opts.includeArchived) q = q.eq("archived", false);
  return check<Client[]>(await q);
}

export async function getClient(db: DB, id: string) {
  return check<Client | null>(await db.from("portal_clients").select("*").eq("id", id).maybeSingle());
}

// ----- Templates -----

export async function listTemplates(db: DB, opts: { clientId?: string; includeArchived?: boolean } = {}) {
  let q = db.from("portal_templates").select("*").order("name");
  if (opts.clientId) q = q.eq("client_id", opts.clientId);
  if (!opts.includeArchived) q = q.eq("archived", false);
  return check<ReportTemplate[]>(await q);
}

export async function getTemplate(db: DB, id: string) {
  return check<ReportTemplate | null>(
    await db.from("portal_templates").select("*").eq("id", id).maybeSingle(),
  );
}

// ----- Reports -----

/** Columns for lists (leaves out the large data/schema fields). */
const LIST_COLUMNS =
  "id, client_id, template_id, title, period_start, period_end, status, created_by, updated_by, submitted_at, approved_by, approved_at, sent_at, pdf_path, created_at, updated_at";

export type ReportListItem = Omit<Report, "data" | "schema">;

export interface ReportFilters {
  clientId?: string;
  templateId?: string;
  status?: ReportStatus;
  year?: number;
  search?: string;
  createdBy?: string;
  limit?: number;
}

export async function listReports(db: DB, f: ReportFilters = {}) {
  let q = db.from("portal_reports").select(LIST_COLUMNS).order("period_start", { ascending: false });
  if (f.clientId) q = q.eq("client_id", f.clientId);
  if (f.templateId) q = q.eq("template_id", f.templateId);
  if (f.status) q = q.eq("status", f.status);
  if (f.createdBy) q = q.eq("created_by", f.createdBy);
  if (f.year) q = q.gte("period_start", `${f.year}-01-01`).lte("period_start", `${f.year}-12-31`);
  if (f.search) q = q.ilike("title", `%${f.search.replace(/[%_]/g, "")}%`);
  q = q.limit(f.limit ?? 200);
  return check<ReportListItem[]>(await q);
}

export async function getReport(db: DB, id: string) {
  return check<Report | null>(await db.from("portal_reports").select("*").eq("id", id).maybeSingle());
}

export async function latestReportForTemplate(db: DB, templateId: string) {
  return check<Report | null>(
    await db
      .from("portal_reports")
      .select("*")
      .eq("template_id", templateId)
      .order("period_start", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

/**
 * Earlier reports from the same template, oldest first, used for "since last
 * week" comparisons, trend lines and year-to-date budget totals. If two
 * reports cover the same start date, only the most recently edited one counts.
 */
export async function reportHistory(db: DB, report: Pick<Report, "id" | "template_id" | "period_start">) {
  const rows = check<Pick<Report, "id" | "period_start" | "period_end" | "schema" | "data" | "updated_at">[]>(
    await db
      .from("portal_reports")
      .select("id, period_start, period_end, schema, data, updated_at")
      .eq("template_id", report.template_id)
      .lt("period_start", report.period_start)
      .neq("id", report.id)
      .order("period_start", { ascending: false })
      .limit(60),
  );
  const byStart = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    const existing = byStart.get(r.period_start);
    if (!existing || existing.updated_at < r.updated_at) byStart.set(r.period_start, r);
  }
  return [...byStart.values()]
    .sort((a, b) => a.period_start.localeCompare(b.period_start))
    .map<HistoryEntry>((r) => ({
      period_start: r.period_start,
      period_end: r.period_end,
      schema: r.schema,
      data: normalizeData(r.schema, r.data),
    }));
}

export async function buildReportContext(
  db: DB,
  report: Report,
  template: Pick<ReportTemplate, "cadence">,
): Promise<ReportContext> {
  return {
    periodStart: report.period_start,
    periodEnd: report.period_end,
    schema: report.schema,
    data: normalizeData(report.schema, report.data),
    cadence: template.cadence,
    history: await reportHistory(db, report),
  };
}

export async function listActivity(db: DB, reportId: string) {
  return check<ReportActivity[]>(
    await db
      .from("portal_report_activity")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false }),
  );
}

// ----- People -----

export async function listProfiles(db: DB) {
  return check<Profile[]>(await db.from("portal_profiles").select("*").order("created_at"));
}

export async function profileMap(db: DB) {
  const profiles = await listProfiles(db);
  return new Map(profiles.map((p) => [p.id, p]));
}

export function emptySchema(): TemplateSchema {
  return { periodLabel: "Reporting period", sections: [] };
}
