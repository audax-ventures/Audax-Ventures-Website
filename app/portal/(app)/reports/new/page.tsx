import { requireMember } from "@/lib/portal/auth";
import { listClients, listTemplates, latestReportForTemplate } from "@/lib/portal/data";
import { formatPeriod, suggestPeriod } from "@/lib/portal/compute";
import { LayoutTemplate } from "lucide-react";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/portal/ui";
import NewReportForm, { type TemplateOption } from "./NewReportForm";

export const metadata = { title: "New report" };

export default async function NewReportPage({ searchParams }: PageProps<"/portal/reports/new">) {
  const { supabase } = await requireMember();
  const { template, client } = await searchParams;
  const [clients, templates] = await Promise.all([listClients(supabase), listTemplates(supabase)]);
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const options: TemplateOption[] = await Promise.all(
    templates
      .filter((t) => clientMap.has(t.client_id))
      .map(async (t) => {
        const last = await latestReportForTemplate(supabase, t.id);
        const suggestion = suggestPeriod(t.cadence, last?.period_end ?? null);
        return {
          id: t.id,
          name: t.name,
          clientId: t.client_id,
          clientName: clientMap.get(t.client_id)!.name,
          clientLogo: clientMap.get(t.client_id)!.logo_data,
          cadence: t.cadence,
          suggestedStart: suggestion.start,
          suggestedEnd: suggestion.end,
          lastLabel: last ? `${formatPeriod(last.period_start, last.period_end)}` : null,
        };
      }),
  );

  const initial =
    (typeof template === "string" && options.find((o) => o.id === template)) ||
    (typeof client === "string" && options.find((o) => o.clientId === client)) ||
    options[0];

  return (
    <>
      <PageHeader
        title="New report"
        description="Choose the report, check the dates, and you're ready to fill it in."
        back={{ href: "/portal/reports", label: "Reports" }}
      />
      {options.length === 0 ? (
        <Card className="max-w-2xl">
          <EmptyState
            icon={LayoutTemplate}
            title="No report templates yet"
            description="Each client needs at least one report template first."
            action={<LinkButton href="/portal/clients">Go to clients</LinkButton>}
          />
        </Card>
      ) : (
        <NewReportForm options={options} initialId={initial.id} />
      )}
    </>
  );
}
