import Link from "next/link";
import { ChevronRight, Download } from "lucide-react";
import { formatPeriod } from "@/lib/portal/compute";
import { displayName } from "@/lib/portal/auth";
import type { ReportListItem } from "@/lib/portal/data";
import type { Client, Profile, ReportTemplate } from "@/lib/portal/types";
import { Avatar, ClientLogo, StatusBadge, thClass } from "./ui";

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
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
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-[#EEF1F5] bg-[#F8FAFC]">
          <tr>
            <th className={`${thClass} pl-5`}>Report</th>
            <th className={thClass}>Period</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Last edited</th>
            <th className={`${thClass} pr-5 text-right`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF1F5]">
          {reports.map((r) => {
            const client = clients.get(r.client_id);
            const template = templates.get(r.template_id);
            const editor = r.updated_by ? people.get(r.updated_by) : undefined;
            const sub = [showClient ? client?.name : null, template && template.name !== r.title ? template.name : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <tr key={r.id} className="group transition-colors hover:bg-[#F8FAFC]">
                <td className="py-3.5 pl-5 pr-4">
                  <Link href={`/portal/reports/${r.id}`} className="flex items-center gap-3">
                    {showClient && client ? <ClientLogo src={client.logo_data} name={client.name} size={36} /> : null}
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[#0F2341] group-hover:text-[#2E5F8A]">{r.title}</span>
                      {sub ? <span className="block truncate text-xs text-slate-500">{sub}</span> : null}
                    </span>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{formatPeriod(r.period_start, r.period_end)}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="flex items-center gap-2 text-slate-500">
                    {editor ? <Avatar name={displayName(editor)} size={24} /> : null}
                    <span>
                      {relativeTime(r.updated_at)}
                      {editor ? <span className="hidden text-slate-400 xl:inline"> · {displayName(editor)}</span> : null}
                    </span>
                  </span>
                </td>
                <td className="py-3.5 pl-4 pr-5">
                  <span className="flex items-center justify-end gap-1">
                    <a
                      href={`/portal/reports/${r.id}/pdf?download=1`}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-[#0F2341] hover:shadow-sm"
                      title="Download PDF"
                      aria-label={`Download PDF of ${r.title}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <Link
                      href={`/portal/reports/${r.id}`}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-[#0F2341] hover:shadow-sm"
                      aria-label={`Open ${r.title}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
