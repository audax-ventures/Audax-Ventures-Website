import Link from "next/link";
import { Download } from "lucide-react";
import { formatPeriod } from "@/lib/portal/compute";
import { displayName } from "@/lib/portal/auth";
import type { ReportListItem } from "@/lib/portal/data";
import type { Client, Profile, ReportTemplate } from "@/lib/portal/types";
import { ClientLogo, StatusBadge } from "./ui";

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReportTable({
  reports,
  clients,
  templates,
  people,
  showClient = true,
}: {
  reports: ReportListItem[];
  clients: Map<string, Client>;
  templates: Map<string, ReportTemplate>;
  people: Map<string, Profile>;
  showClient?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
            <th className="px-5 py-2.5 font-medium">Report</th>
            {showClient ? <th className="px-3 py-2.5 font-medium">Client</th> : null}
            <th className="px-3 py-2.5 font-medium">Period</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Last edited</th>
            <th className="px-5 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const client = clients.get(r.client_id);
            const template = templates.get(r.template_id);
            const editor = r.updated_by ? people.get(r.updated_by) : undefined;
            return (
              <tr key={r.id} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/portal/reports/${r.id}`} className="font-medium text-slate-900 group-hover:text-[#2E5F8A]">
                    {r.title}
                  </Link>
                  {template && template.name !== r.title ? (
                    <div className="text-xs text-slate-500">{template.name}</div>
                  ) : null}
                </td>
                {showClient ? (
                  <td className="px-3 py-3">
                    {client ? (
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <ClientLogo src={client.logo_data} name={client.name} size={22} />
                        {client.name}
                      </span>
                    ) : null}
                  </td>
                ) : null}
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatPeriod(r.period_start, r.period_end)}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                  {relative(r.updated_at)}
                  {editor ? <span className="text-slate-400"> · {displayName(editor)}</span> : null}
                </td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={`/portal/reports/${r.id}/pdf?download=1`}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    title="Download PDF"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
