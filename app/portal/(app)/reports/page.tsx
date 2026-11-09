import { Plus } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { listClients, listReports, listTemplates, profileMap } from "@/lib/portal/data";
import { STATUS_LABELS, type ReportStatus } from "@/lib/portal/types";
import { Card, EmptyState, LinkButton, PageHeader, buttonClass, inputClass } from "@/components/portal/ui";
import ReportTable from "@/components/portal/ReportTable";

export const metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: PageProps<"/portal/reports">) {
  const { supabase } = await requireMember();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const clientId = str("client");
  const templateId = str("template");
  const status = str("status") as ReportStatus | "";
  const year = Number(str("year")) || undefined;
  const search = str("q");

  const [clients, templates, reports, people] = await Promise.all([
    listClients(supabase, { includeArchived: true }),
    listTemplates(supabase, { includeArchived: true }),
    listReports(supabase, {
      clientId: clientId || undefined,
      templateId: templateId || undefined,
      status: status || undefined,
      year,
      search: search || undefined,
      limit: 500,
    }),
    profileMap(supabase),
  ]);
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const templateMap = new Map(templates.map((t) => [t.id, t]));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 2023 }, (_, i) => thisYear - i);
  const filtered = Boolean(clientId || templateId || status || year || search);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Every report your team has made, newest first."
        actions={
          <LinkButton href="/portal/reports/new">
            <Plus className="h-4 w-4" /> New report
          </LinkButton>
        }
      />
      <form className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.7fr_auto]">
        <input name="q" defaultValue={search} placeholder="Search report titles…" className={inputClass} />
        <select name="client" defaultValue={clientId} className={inputClass}>
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="template" defaultValue={templateId} className={inputClass}>
          <option value="">All report types</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {clientMap.get(t.client_id)?.name} · {t.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={inputClass}>
          <option value="">Any status</option>
          {(Object.keys(STATUS_LABELS) as ReportStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select name="year" defaultValue={year ? String(year) : ""} className={inputClass}>
          <option value="">Any year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("secondary")}>Filter</button>
          {filtered ? <LinkButton href="/portal/reports" variant="ghost">Clear</LinkButton> : null}
        </div>
      </form>
      <Card>
        {reports.length ? (
          <ReportTable reports={reports} clients={clientMap} templates={templateMap} people={people} />
        ) : (
          <EmptyState
            title={filtered ? "No reports match those filters" : "No reports yet"}
            description={filtered ? undefined : "Start your first report and it will be saved here."}
          />
        )}
      </Card>
    </>
  );
}
