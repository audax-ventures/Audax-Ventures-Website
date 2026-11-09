import Link from "next/link";
import { ArrowRight, Building2, FileText, LayoutTemplate } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { listClients, listTemplates } from "@/lib/portal/data";
import { Card, CardHeader, ClientLogo, EmptyState, IconBadge, LinkButton, PageHeader, Pill } from "@/components/portal/ui";

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
          <EmptyState icon={Building2} title="No clients yet" description="Templates belong to a client. Add one first." action={<LinkButton href="/portal/clients/new">Add a client</LinkButton>} />
        </Card>
      ) : (
        <div className="space-y-5">
          {clients.map((c) => {
            const tpls = templates.filter((t) => t.client_id === c.id);
            return (
              <Card key={c.id}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2.5">
                      <ClientLogo src={c.logo_data} name={c.name} size={28} /> {c.name}
                    </span>
                  }
                  actions={<Link href={`/portal/clients/${c.id}`} className="text-xs font-medium text-[#2E5F8A] hover:underline">Add template</Link>}
                />
                {tpls.length ? (
                  <ul className="divide-y divide-[#EEF1F5]">
                    {tpls.map((t) => (
                      <li key={t.id}>
                        <Link href={`/portal/templates/${t.id}`} className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-[#F8FAFC]">
                          <IconBadge icon={FileText} tone="slate" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-[#0F2341]">{t.name}</span>
                              <Pill>{t.cadence === "custom" ? "Custom" : t.cadence}</Pill>
                            </span>
                            <span className="mt-1.5 flex flex-wrap gap-1.5">
                              {t.schema.sections.length ? (
                                t.schema.sections.map((sec) => (
                                  <span key={sec.id} className="rounded-md bg-[#F1F5FA] px-1.5 py-0.5 text-[11px] text-slate-600">{sec.title}</span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">No sections yet</span>
                              )}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#2E5F8A]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={LayoutTemplate} title="No templates for this client" />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
