import Link from "next/link";
import { Plus } from "lucide-react";
import { requireMember } from "@/lib/portal/auth";
import { listClients, listTemplates } from "@/lib/portal/data";
import { Card, ClientLogo, EmptyState, LinkButton, PageHeader } from "@/components/portal/ui";

export const metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: PageProps<"/portal/clients">) {
  const { supabase } = await requireMember();
  const { archived } = await searchParams;
  const showArchived = archived === "1";
  const [clients, templates, counts] = await Promise.all([
    listClients(supabase, { includeArchived: showArchived }),
    listTemplates(supabase),
    supabase.from("portal_reports").select("client_id"),
  ]);
  const reportCount = new Map<string, number>();
  for (const r of counts.data ?? []) reportCount.set(r.client_id, (reportCount.get(r.client_id) ?? 0) + 1);

  return (
    <>
      <PageHeader
        title="Clients"
        description="Each client has their own logo, colours and report templates."
        actions={
          <LinkButton href="/portal/clients/new">
            <Plus className="h-4 w-4" /> Add client
          </LinkButton>
        }
      />
      {clients.length === 0 ? (
        <Card>
          <EmptyState title="No clients yet" action={<LinkButton href="/portal/clients/new">Add your first client</LinkButton>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => {
            const tpls = templates.filter((t) => t.client_id === c.id);
            return (
              <Link key={c.id} href={`/portal/clients/${c.id}`} className="group">
                <Card className="h-full p-5 transition-colors group-hover:border-[#2E5F8A]">
                  <div className="flex items-center gap-3">
                    <ClientLogo src={c.logo_data} name={c.name} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {reportCount.get(c.id) ?? 0} reports · {tpls.length} templates
                        {c.archived ? " · archived" : ""}
                      </p>
                    </div>
                    <span className="ml-auto h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.brand_color }} />
                  </div>
                  {tpls.length ? (
                    <ul className="mt-4 space-y-1 text-xs text-slate-600">
                      {tpls.map((t) => (
                        <li key={t.id}>• {t.name}</li>
                      ))}
                    </ul>
                  ) : null}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-xs text-slate-500">
        {showArchived ? <Link href="/portal/clients" className="hover:underline">Hide archived clients</Link> : <Link href="/portal/clients?archived=1" className="hover:underline">Show archived clients</Link>}
      </p>
    </>
  );
}
