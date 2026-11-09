import Link from "next/link";
import { Plus } from "lucide-react";
import { displayName, requireMember } from "@/lib/portal/auth";
import { listClients, listReports, listTemplates, profileMap } from "@/lib/portal/data";
import { formatPeriod } from "@/lib/portal/compute";
import { Card, CardHeader, ClientLogo, EmptyState, LinkButton, PageHeader } from "@/components/portal/ui";
import ReportTable from "@/components/portal/ReportTable";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, profile, user } = await requireMember();
  const isAdmin = profile.role === "admin";
  const [clients, templates, inReview, myDrafts, recent, people] = await Promise.all([
    listClients(supabase),
    listTemplates(supabase),
    listReports(supabase, { status: "in_review", limit: 20 }),
    listReports(supabase, { status: "draft", createdBy: user.id, limit: 10 }),
    listReports(supabase, { limit: 8 }),
    profileMap(supabase),
  ]);
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const templateMap = new Map(templates.map((t) => [t.id, t]));

  const firstName = displayName(profile).split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi ${firstName}`}
        description="Start a report, pick up a draft, or review what your team has sent over."
        actions={
          <LinkButton href="/portal/reports/new">
            <Plus className="h-4 w-4" /> New report
          </LinkButton>
        }
      />

      {/* Quick start: one button per client template */}
      <Card className="mb-6">
        <CardHeader title="Start a report" description="Picks the next period and pre-fills from the last report." />
        {templates.length === 0 ? (
          <EmptyState
            title="No report templates yet"
            description="Add a client and give them a report template to get started."
            action={<LinkButton href="/portal/clients" variant="secondary">Go to clients</LinkButton>}
          />
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => {
              const client = clientMap.get(t.client_id);
              if (!client) return null;
              return (
                <Link
                  key={t.id}
                  href={`/portal/reports/new?template=${t.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-[#2E5F8A] hover:bg-slate-50"
                >
                  <ClientLogo src={client.logo_data} name={client.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{t.name}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {client.name} · {t.cadence === "custom" ? "custom dates" : t.cadence}
                    </span>
                  </span>
                  <Plus className="h-4 w-4 text-slate-400 group-hover:text-[#2E5F8A]" />
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {isAdmin ? (
        <Card className="mb-6">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Waiting for your review
                {inReview.length ? (
                  <span className="rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800">{inReview.length}</span>
                ) : null}
              </span>
            }
          />
          {inReview.length ? (
            <ReportTable reports={inReview} clients={clientMap} templates={templateMap} people={people} />
          ) : (
            <EmptyState title="Nothing to review" description="Reports your team submits for review will show up here." />
          )}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Your drafts" />
          {myDrafts.length ? (
            <ul className="divide-y divide-slate-100">
              {myDrafts.map((r) => (
                <li key={r.id}>
                  <Link href={`/portal/reports/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      <span className="block text-xs text-slate-500">
                        {clientMap.get(r.client_id)?.name} · {formatPeriod(r.period_start, r.period_end)}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-[#2E5F8A]">Continue →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No drafts" description="Reports you start will stay here until you submit them." />
          )}
        </Card>
        <Card>
          <CardHeader
            title="Recent activity"
            actions={<Link href="/portal/reports" className="text-xs font-medium text-[#2E5F8A]">All reports →</Link>}
          />
          {recent.length ? (
            <ReportTable reports={recent.slice(0, 6)} clients={clientMap} templates={templateMap} people={people} showClient={false} />
          ) : (
            <EmptyState title="No reports yet" />
          )}
        </Card>
      </div>
    </>
  );
}
