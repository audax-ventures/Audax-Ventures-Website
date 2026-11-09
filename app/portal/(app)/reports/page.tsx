import Link from "next/link";
import { FileText, SearchX } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { listClients, listReports, listTemplates, profileMap } from "@/lib/portal/data";
import { STATUS_LABELS, type ReportStatus } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Card, EmptyState, LinkButton, PageHeader, buttonClass, inputClass } from "@/components/portal/ui";
import ReportTable from "@/components/portal/ReportTable";

export const metadata = { title: "Reports" };

const STATUSES = Object.keys(STATUS_LABELS) as ReportStatus[];
const TAB_DOT: Record<ReportStatus, string> = {
  draft: "bg-slate-500",
  in_review: "bg-amber-500",
  approved: "bg-emerald-500",
  sent: "bg-sky-500",
};

export default async function ReportsPage({ searchParams }: PageProps<"/portal/reports">) {
  const { supabase } = await requireMember();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const clientId = str("client");
  const templateId = str("template");
  const status = (STATUSES as string[]).includes(str("status")) ? (str("status") as ReportStatus) : "";
  const year = Number(str("year")) || undefined;
  const search = str("q");

  const baseFilters = {
    clientId: clientId || undefined,
    templateId: templateId || undefined,
    year,
    search: search || undefined,
    limit: 500,
  };
  const [clients, templates, allMatching, people] = await Promise.all([
    listClients(supabase, { includeArchived: true }),
    listTemplates(supabase, { includeArchived: true }),
    listReports(supabase, baseFilters),
    profileMap(supabase),
  ]);
  const reports = status ? allMatching.filter((r) => r.status === status) : allMatching;
  const counts = Object.fromEntries(STATUSES.map((s) => [s, allMatching.filter((r) => r.status === s).length]));
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const templateMap = new Map(templates.map((t) => [t.id, t]));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 2023 }, (_, i) => thisYear - i);
  const filtered = Boolean(clientId || templateId || year || search);

  const tabHref = (s: ReportStatus | "") => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (clientId) params.set("client", clientId);
    if (templateId) params.set("template", templateId);
    if (year) params.set("year", String(year));
    if (s) params.set("status", s);
    const qs = params.toString();
    return `/portal/reports${qs ? `?${qs}` : ""}`;
  };
  const tabs: { key: ReportStatus | ""; label: string; count: number }[] = [
    { key: "", label: "All", count: allMatching.length },
    ...STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s], count: counts[s] })),
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Create & view all of your client reports"
      />

      <Card>
        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#EEF1F5] px-3 pt-2">
          {tabs.map((t) => {
            const active = status === t.key;
            return (
              <Link
                key={t.key || "all"}
                href={tabHref(t.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active ? "border-[#0F2341] text-[#0F2341]" : "border-transparent text-slate-500 hover:text-[#0F2341]",
                )}
              >
                {t.key ? <span className={cn("h-2 w-2 rounded-full", TAB_DOT[t.key])} aria-hidden /> : null}
                {t.label}
                <span className={cn("rounded-full px-2 text-[11px] font-semibold leading-5", active ? "bg-[#0F2341] text-white" : "bg-slate-100 text-slate-500")}>
                  {t.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Filters */}
        <form className="grid gap-2 border-b border-[#EEF1F5] p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_0.7fr_auto]">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input name="q" defaultValue={search} placeholder="Search report titles…" aria-label="Search report titles" className={inputClass} />
          <select name="client" defaultValue={clientId} aria-label="Client" className={inputClass}>
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="template" defaultValue={templateId} aria-label="Report type" className={inputClass}>
            <option value="">All report types</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {clientMap.get(t.client_id)?.name} · {t.name}
              </option>
            ))}
          </select>
          <select name="year" defaultValue={year ? String(year) : ""} aria-label="Year" className={inputClass}>
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className={buttonClass("secondary")}>Apply</button>
            {filtered ? <LinkButton href={status ? `/portal/reports?status=${status}` : "/portal/reports"} variant="ghost">Clear</LinkButton> : null}
          </div>
        </form>

        {reports.length ? (
          <ReportTable reports={reports} clients={clientMap} templates={templateMap} people={people} />
        ) : (
          <EmptyState
            icon={filtered || status ? SearchX : FileText}
            title={filtered || status ? "No reports match" : "No reports yet"}
            description={filtered || status ? "Try a different status or clear the filters." : "Start your first report and it will be saved here."}
            action={!filtered && !status ? <LinkButton href="/portal/reports/new">New report</LinkButton> : undefined}
          />
        )}
      </Card>
      {reports.length ? (
        <p className="mt-3 text-xs text-slate-400">
          Showing {reports.length} report{reports.length === 1 ? "" : "s"}
        </p>
      ) : null}
    </>
  );
}
