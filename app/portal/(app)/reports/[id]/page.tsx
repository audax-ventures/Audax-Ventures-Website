import { notFound } from "next/navigation";
import { displayName, requireMember } from "@/lib/portal/auth";
import { getClient, getReport, getTemplate, listActivity, profileMap, reportHistory } from "@/lib/portal/data";
import { PageHeader } from "@/components/portal/ui";
import ReportEditor from "@/components/portal/editor/ReportEditor";

export const metadata = { title: "Report" };

export default async function ReportPage({ params }: PageProps<"/portal/reports/[id]">) {
  const { id } = await params;
  const { supabase, profile, user } = await requireMember();
  const report = await getReport(supabase, id);
  if (!report) notFound();
  const [template, client, history, activity, people] = await Promise.all([
    getTemplate(supabase, report.template_id),
    getClient(supabase, report.client_id),
    reportHistory(supabase, report),
    listActivity(supabase, report.id),
    profileMap(supabase),
  ]);
  if (!template || !client) notFound();

  return (
    <>
      <PageHeader title={client.name} back={{ href: "/portal/reports", label: "Reports" }} />
      <ReportEditor
        report={{
          id: report.id,
          title: report.title,
          periodStart: report.period_start,
          periodEnd: report.period_end,
          status: report.status,
          schema: report.schema,
          data: report.data,
          updatedAt: report.updated_at,
          templateId: report.template_id,
          createdBy: report.created_by,
        }}
        cadence={template.cadence}
        clientName={client.name}
        history={history}
        activity={activity.map((a) => ({
          id: a.id,
          action: a.action,
          note: a.note,
          who: a.actor ? displayName(people.get(a.actor)) : "Someone",
          at: a.created_at,
        }))}
        isAdmin={profile.role === "admin"}
        currentUserId={user.id}
        templateChanged={JSON.stringify(template.schema) !== JSON.stringify(report.schema)}
      />
    </>
  );
}
