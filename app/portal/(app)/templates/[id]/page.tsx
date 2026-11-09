import { notFound } from "next/navigation";
import { requireMember } from "@/lib/portal/auth";
import { getClient, getTemplate, listClients } from "@/lib/portal/data";
import { PageHeader } from "@/components/portal/ui";
import TemplateBuilder from "@/components/portal/TemplateBuilder";

export const metadata = { title: "Edit template" };

export default async function TemplatePage({ params }: PageProps<"/portal/templates/[id]">) {
  const { id } = await params;
  const { supabase } = await requireMember();
  const template = await getTemplate(supabase, id);
  if (!template) notFound();
  const [client, clients, { count }] = await Promise.all([
    getClient(supabase, template.client_id),
    listClients(supabase),
    supabase.from("portal_reports").select("id", { count: "exact", head: true }).eq("template_id", id),
  ]);
  return (
    <>
      <PageHeader
        title={template.name}
        description={`${client?.name ?? ""} · Report template${template.archived ? " (archived)" : ""}`}
        back={{ href: client ? `/portal/clients/${client.id}` : "/portal/templates", label: client?.name ?? "Templates" }}
      />
      <TemplateBuilder
        key={template.updated_at}
        template={{
          id: template.id,
          name: template.name,
          cadence: template.cadence,
          schema: template.schema,
          archived: template.archived,
          clientId: template.client_id,
        }}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        reportCount={count ?? 0}
      />
    </>
  );
}
