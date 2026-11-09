import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, FileText, LayoutTemplate, Plus } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { updateClientAction } from "@/lib/portal/actions";
import { getClient, listReports, listTemplates, profileMap } from "@/lib/portal/data";
import { starterTemplates } from "@/lib/portal/starter-templates";
import { Card, CardHeader, ClientLogo, EmptyState, IconBadge, LinkButton, PageHeader, Pill } from "@/components/portal/ui";
import ClientForm from "@/components/portal/ClientForm";
import ReportTable from "@/components/portal/ReportTable";
import { ArchiveClientButton, NewTemplateButton, TemplateOrderButtons } from "@/components/portal/ClientActions";

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
          <span className="flex items-center gap-4">
            <ClientLogo src={client.logo_data} name={client.name} size={56} />
            <span>
              {client.name}
              <span className="mt-1 flex items-center gap-2 text-sm font-normal text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: client.brand_color }} aria-hidden />
                {client.contact_name ? `${client.contact_name}${client.contact_email ? ` · ${client.contact_email}` : ""}` : "Client"}
                {client.archived ? <Pill>Archived</Pill> : null}
              </span>
            </span>
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader
            icon={LayoutTemplate}
            title="Report templates"
            description="Use the arrows to set the order they appear in across the portal."
            actions={<NewTemplateButton clientId={client.id} starters={starters} />}
          />
          {active.length ? (
            <ul className="divide-y divide-[#EEF1F5]">
              {active.map((t, i) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <span className="flex min-w-0 items-center gap-3">
                    {active.length > 1 ? (
                      <TemplateOrderButtons templateId={t.id} name={t.name} isFirst={i === 0} isLast={i === active.length - 1} />
                    ) : null}
                    <IconBadge icon={FileText} tone="slate" size="sm" />
                    <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#0F2341]">{t.name}</span>
                    <span className="block text-xs text-slate-500">
                      {t.cadence === "custom" ? "Custom dates" : t.cadence === "weekly" ? "Weekly" : "Monthly"} ·{" "}
                      {t.schema.sections.length} sections
                    </span>
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
            <EmptyState icon={LayoutTemplate} title="No templates yet" description="Create one from scratch or from a ready-made layout." />
          )}
          {archived.length ? (
            <p className="border-t border-[#EEF1F5] px-5 py-3 text-xs text-slate-500">
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
          <CardHeader icon={Building2} title="Client details" description="Logo and colour appear on every PDF." />
          <ClientForm client={client} action={updateClientAction.bind(null, client.id)} submitLabel="Save changes" />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          icon={FileText}
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
          <EmptyState icon={FileText} title="No reports yet" description="Reports for this client will be listed here." />
        )}
      </Card>
    </>
  );
}
