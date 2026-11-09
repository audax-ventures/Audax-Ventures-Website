import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { updateClientAction } from "@/lib/portal/actions";
import { getClient, listReports, listTemplates, profileMap } from "@/lib/portal/data";
import { starterTemplates } from "@/lib/portal/starter-templates";
import { Card, CardHeader, ClientLogo, EmptyState, LinkButton, PageHeader } from "@/components/portal/ui";
import ClientForm from "@/components/portal/ClientForm";
import ReportTable from "@/components/portal/ReportTable";
import { ArchiveClientButton, NewTemplateButton } from "@/components/portal/ClientActions";

export const metadata = { title: "Client" };

export default async function ClientPage({ params }: PageProps<"/portal/clients/[id]">) {
  const { id } = await params;
  const { supabase } = await requireMember();
  const client = await getClient(supabase, id);
  if (!client) notFound();
  const [templates, reports, people] = await Promise.all([
    listTemplates(supabase, { clientId: id, includeArchived: true }),
    listReports(supabase, { clientId: id, limit: 15 }),
    profileMap(supabase),
  ]);
  const active = templates.filter((t) => !t.archived);
  const archived = templates.filter((t) => t.archived);
  const starters = starterTemplates(new Date().getFullYear()).map((s) => ({ key: s.key, name: s.name, description: s.description }));

  return (
    <>
      <PageHeader
        back={{ href: "/portal/clients", label: "Clients" }}
        title={
          <span className="flex items-center gap-3">
            <ClientLogo src={client.logo_data} name={client.name} size={40} />
            {client.name}
          </span>
        }
        actions={
          <>
            <ArchiveClientButton clientId={client.id} archived={client.archived} />
            <LinkButton href={`/portal/reports/new?client=${client.id}`}>
              <Plus className="h-4 w-4" /> New report
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader
            title="Report templates"
            description="The layout of each report type. Changes apply to new reports."
            actions={<NewTemplateButton clientId={client.id} starters={starters} />}
          />
          {active.length ? (
            <ul className="divide-y divide-slate-100">
              {active.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-slate-500">
                      {t.cadence === "custom" ? "Custom dates" : t.cadence === "weekly" ? "Weekly" : "Monthly"} ·{" "}
                      {t.schema.sections.length} sections
                    </span>
                  </span>
                  <span className="flex gap-1">
                    <LinkButton href={`/portal/reports/new?template=${t.id}`} variant="ghost" size="sm">New report</LinkButton>
                    <LinkButton href={`/portal/templates/${t.id}`} variant="secondary" size="sm">Edit</LinkButton>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No templates yet" description="Create one from scratch or from a ready-made layout." />
          )}
          {archived.length ? (
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              Archived:{" "}
              {archived.map((t, i) => (
                <span key={t.id}>
                  {i ? ", " : ""}
                  <Link href={`/portal/templates/${t.id}`} className="hover:underline">{t.name}</Link>
                </span>
              ))}
            </p>
          ) : null}
        </Card>

        <Card>
          <CardHeader title="Client details" />
          <ClientForm client={client} action={updateClientAction.bind(null, client.id)} submitLabel="Save changes" />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent reports"
          actions={<Link href={`/portal/reports?client=${client.id}`} className="text-xs font-medium text-[#2E5F8A]">All reports →</Link>}
        />
        {reports.length ? (
          <ReportTable
            reports={reports}
            clients={new Map([[client.id, client]])}
            templates={new Map(templates.map((t) => [t.id, t]))}
            people={people}
            showClient={false}
          />
        ) : (
          <EmptyState title="No reports yet" />
        )}
      </Card>
    </>
  );
}
