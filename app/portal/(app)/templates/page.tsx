import Link from "next/link";
import { requireMember } from "@/lib/portal/auth";
import { listClients, listTemplates } from "@/lib/portal/data";
import { Card, CardHeader, ClientLogo, EmptyState, LinkButton, PageHeader } from "@/components/portal/ui";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const { supabase } = await requireMember();
  const [clients, templates] = await Promise.all([listClients(supabase), listTemplates(supabase)]);
  return (
    <>
      <PageHeader
        title="Report templates"
        description="A template sets which sections a report has and how the PDF looks. To add one, open a client and choose “New template”."
      />
      {clients.length === 0 ? (
        <Card>
          <EmptyState title="No clients yet" action={<LinkButton href="/portal/clients/new">Add a client</LinkButton>} />
        </Card>
      ) : (
        <div className="space-y-5">
          {clients.map((c) => {
            const tpls = templates.filter((t) => t.client_id === c.id);
            return (
              <Card key={c.id}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <ClientLogo src={c.logo_data} name={c.name} size={24} /> {c.name}
                    </span>
                  }
                  actions={<Link href={`/portal/clients/${c.id}`} className="text-xs font-medium text-[#2E5F8A]">Add template →</Link>}
                />
                {tpls.length ? (
                  <ul className="divide-y divide-slate-100">
                    {tpls.map((t) => (
                      <li key={t.id}>
                        <Link href={`/portal/templates/${t.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                          <span>
                            <span className="block text-sm font-medium">{t.name}</span>
                            <span className="block text-xs text-slate-500">
                              {t.schema.sections.map((s) => s.title).join(" · ") || "No sections yet"}
                            </span>
                          </span>
                          <span className="text-xs font-medium text-[#2E5F8A]">Edit →</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No templates for this client" />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
