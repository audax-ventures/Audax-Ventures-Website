import { getSession } from "@/lib/portal/auth";
import { buildReportContext, getClient, getReport, getTemplate } from "@/lib/portal/data";
import { renderReportPdf } from "@/lib/portal/pdf/render";

export const runtime = "nodejs";

function fileName(clientName: string, title: string, periodStart: string) {
  return `${clientName} - ${title} - ${periodStart}.pdf`.replace(/[^\w\-. ]+/g, "").replace(/\s+/g, " ");
}

export async function GET(request: Request, ctx: RouteContext<"/portal/reports/[id]/pdf">) {
  const { id } = await ctx.params;
  const { supabase, user, profile } = await getSession();
  if (!user || !profile?.active) return new Response("Not signed in", { status: 401 });

  const report = await getReport(supabase, id);
  if (!report) return new Response("Report not found", { status: 404 });
  const [template, client] = await Promise.all([
    getTemplate(supabase, report.template_id),
    getClient(supabase, report.client_id),
  ]);
  if (!template || !client) return new Response("Report not found", { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const headers = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName(client.name, report.title, report.period_start)}"`,
    "Cache-Control": "private, no-store",
  };

  // Approved and sent reports: serve the saved copy, so it's exactly what the client got.
  if ((report.status === "approved" || report.status === "sent") && report.pdf_path) {
    const { data } = await supabase.storage.from("portal-reports").download(report.pdf_path);
    if (data) return new Response(await data.arrayBuffer(), { headers });
  }

  const pdf = await renderReportPdf({
    clientName: client.name,
    clientLogo: client.logo_data,
    brandColor: client.brand_color,
    title: report.title,
    status: report.status,
    preparedOn: new Date(report.approved_at ?? Date.now()).toLocaleDateString("en-CA", { timeZone: "America/Winnipeg" }),
    ctx: await buildReportContext(supabase, report, template),
  });
  return new Response(new Uint8Array(pdf), { headers });
}
