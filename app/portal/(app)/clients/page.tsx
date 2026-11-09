import Link from "next/link";
import { ArrowRight, Building2, FileText, LayoutTemplate, Plus } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { listClients, listReports, listTemplates } from "@/lib/portal/data";
import { formatPeriod } from "@/lib/portal/compute";
import { Card, ClientLogo, EmptyState, LinkButton, PageHeader, Pill } from "@/components/portal/ui";

export const metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: PageProps<"/portal/clients">) {
  const { supabase } = await requireMember();
  const { archived } = await searchParams;
  const showArchived = archived === "1";
  const [clients, templates, reports] = await Promise.all([
    listClients(supabase, { includeArchived: showArchived }),
    listTemplates(supabase),
    listReports(supabase, { limit: 1000 }),
  ]);
  const reportCount = new Map<string, number>();
  const lastReport = new Map<string, (typeof reports)[number]>();
  for (const r of reports) {
    reportCount.set(r.client_id, (reportCount.get(r.client_id) ?? 0) + 1);
    if (!lastReport.has(r.client_id)) lastReport.set(r.client_id, r);
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Each client has their own logo, brand colour and report templates."
        actions={
          <LinkButton href="/portal/clients/new">
            <Plus className="h-4 w-4" /> Add client
          </LinkButton>
        }
      />
      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No clients yet"
            description="Add a client to set up their branding and report templates."
            action={<LinkButton href="/portal/clients/new">Add your first client</LinkButton>}
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => {
            const tpls = templates.filter((t) => t.client_id === c.id);
            const last = lastReport.get(c.id);
            return (
              <Link key={c.id} href={`/portal/clients/${c.id}`} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2E5F8A]/15">
                <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:-translate-y-px group-hover:border-[#C9D5E6] group-hover:shadow-md">
                  <div className="h-1.5" style={{ backgroundColor: c.brand_color }} aria-hidden />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3.5">
                      <ClientLogo src={c.logo_data} name={c.name} size={52} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#0F2341]">{c.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {last ? `Last report: ${formatPeriod(last.period_start, last.period_end)}` : "No reports yet"}
                        </p>
                      </div>
                      {c.archived ? <Pill>Archived</Pill> : null}
                    </div>
                    {tpls.length ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {tpls.map((t) => (
                          <span key={t.id} className="rounded-lg bg-[#F1F5FA] px-2 py-1 text-[11px] font-medium text-[#2E5F8A]">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex-1" />
                    <div className="mt-4 flex items-center gap-4 border-t border-[#EEF1F5] pt-3.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {reportCount.get(c.id) ?? 0} reports</span>
                      <span className="flex items-center gap-1.5"><LayoutTemplate className="h-3.5 w-3.5" /> {tpls.length} templates</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#2E5F8A]" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-xs">
        <Link href={showArchived ? "/portal/clients" : "/portal/clients?archived=1"} className="font-medium text-slate-500 hover:text-[#0F2341]">
          {showArchived ? "Hide archived clients" : "Show archived clients"}
        </Link>
      </p>
    </>
  );
}
