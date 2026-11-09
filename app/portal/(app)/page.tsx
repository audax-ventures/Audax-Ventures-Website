import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FilePen,
  FileText,
  Inbox,
  LayoutTemplate,
  Send,
} from "lucide-react";
import { displayName, requireMember } from "@/lib/portal/auth";
import { listClients, listReports, listTemplates, profileMap } from "@/lib/portal/data";
import { formatPeriod, suggestPeriod } from "@/lib/portal/compute";
import type { ReportActivity } from "@/lib/portal/types";
import {
  Avatar,
  Card,
  CardHeader,
  ClientLogo,
  EmptyState,
  LinkButton,
  PageHeader,
  Pill,
  StatTile,
  StatusBadge,
} from "@/components/portal/ui";
import { relativeTime } from "@/components/portal/ReportTable";

export const metadata = { title: "Dashboard" };

const ACTIVITY_TEXT: Record<string, string> = {
  created: "started",
  submitted: "submitted for review",
  withdrawn: "moved back to draft",
  changes_requested: "asked for changes on",
  approved: "approved",
  sent: "marked as sent",
  reopened: "reopened",
  comment: "commented on",
  template_updated: "updated the template of",
};

function greeting() {
  const hour = Number(new Date().toLocaleString("en-CA", { hour: "numeric", hour12: false, timeZone: "America/Winnipeg" }));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default async function DashboardPage() {
  const { supabase, profile, user } = await requireMember();
  const isAdmin = profile.role === "admin";
  const [clients, templates, reports, people, activityRes] = await Promise.all([
    listClients(supabase),
    listTemplates(supabase),
    listReports(supabase, { limit: 500 }),
    profileMap(supabase),
    supabase.from("portal_report_activity").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  const activity = (activityRes.data ?? []) as ReportActivity[];
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const reportMap = new Map(reports.map((r) => [r.id, r]));

  const monthStart = new Date().toLocaleDateString("en-CA", { timeZone: "America/Winnipeg" }).slice(0, 7);
  const count = (pred: (r: (typeof reports)[number]) => boolean) => reports.filter(pred).length;
  const inReview = reports.filter((r) => r.status === "in_review");
  const myDrafts = reports.filter((r) => r.status === "draft" && r.created_by === user.id);
  const drafts = count((r) => r.status === "draft");
  const approvedUnsent = reports.filter((r) => r.status === "approved");
  const sentThisMonth = count((r) => r.status === "sent" && (r.sent_at ?? "").slice(0, 7) === monthStart);

  // Most recent report per template, to suggest the next period.
  const lastByTemplate = new Map<string, (typeof reports)[number]>();
  for (const r of reports) if (!lastByTemplate.has(r.template_id)) lastByTemplate.set(r.template_id, r);

  const attention = isAdmin ? [...inReview, ...approvedUnsent] : myDrafts;
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Winnipeg" });

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`${greeting()}, ${displayName(profile).split(" ")[0]}`}
        description="Here's where your client reporting stands today."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label={isAdmin ? "Waiting for your review" : "In review"}
          value={inReview.length}
          caption={inReview.length ? "Submitted by the team" : "All caught up"}
          icon={Inbox}
          tone="amber"
          href="/portal/reports?status=in_review"
        />
        <StatTile label="Drafts in progress" value={drafts} caption={`${myDrafts.length} started by you`} icon={FilePen} tone="slate" href="/portal/reports?status=draft" />
        <StatTile label="Approved, not sent" value={approvedUnsent.length} caption="Ready to send to clients" icon={CheckCircle2} tone="green" href="/portal/reports?status=approved" />
        <StatTile label="Sent this month" value={sentThisMonth} caption={`${count((r) => r.status === "sent")} sent in total`} icon={Send} tone="sky" href="/portal/reports?status=sent" />
      </div>

      {/* Quick start */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-[#0F2341]">Start a report</h2>
            <p className="text-xs text-slate-500">The next period is picked for you, and it pre-fills from the last report.</p>
          </div>
          <Link href="/portal/templates" className="text-xs font-medium text-[#2E5F8A] hover:underline">Manage templates</Link>
        </div>
        {templates.length === 0 ? (
          <Card>
            <EmptyState
              icon={LayoutTemplate}
              title="No report templates yet"
              description="Add a client and give them a report template to get started."
              action={<LinkButton href="/portal/clients" variant="secondary">Go to clients</LinkButton>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
            {templates.map((t) => {
              const client = clientMap.get(t.client_id);
              if (!client) return null;
              const last = lastByTemplate.get(t.id);
              const next = suggestPeriod(t.cadence, last?.period_end ?? null);
              return (
                <Link
                  key={t.id}
                  href={`/portal/reports/new?template=${t.id}`}
                  className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2E5F8A]/15"
                >
                  <Card className="h-full p-5 transition-all group-hover:-translate-y-px group-hover:border-[#C9D5E6] group-hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <ClientLogo src={client.logo_data} name={client.name} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0F2341]">{t.name}</p>
                        <p className="truncate text-xs text-slate-500">{client.name}</p>
                      </div>
                      <Pill>{t.cadence === "custom" ? "Custom" : t.cadence}</Pill>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#EEF1F5] pt-3.5 text-xs">
                      <span className="text-slate-500">
                        Next: <span className="font-medium text-slate-700">{formatPeriod(next.start, next.end)}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#2E5F8A] opacity-70 transition-opacity group-hover:opacity-100">
                        Start <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 [&>*]:min-w-0">
        <Card className="lg:col-span-3">
          <CardHeader
            icon={isAdmin ? Inbox : FilePen}
            title={isAdmin ? "Needs your attention" : "Your drafts"}
            description={isAdmin ? "Reports to review, and approved reports still to send." : "Reports you've started but not submitted yet."}
            actions={<Link href="/portal/reports" className="text-xs font-medium text-[#2E5F8A] hover:underline">All reports</Link>}
          />
          {attention.length ? (
            <ul className="divide-y divide-[#EEF1F5]">
              {attention.slice(0, 8).map((r) => {
                const client = clientMap.get(r.client_id);
                return (
                  <li key={r.id}>
                    <Link href={`/portal/reports/${r.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]">
                      {client ? <ClientLogo src={client.logo_data} name={client.name} size={36} /> : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#0F2341]">{r.title}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {client?.name} · {formatPeriod(r.period_start, r.period_end)}
                        </span>
                      </span>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up"
              description={isAdmin ? "Reports your team submits for review will show up here." : "Reports you start stay here until you submit them."}
            />
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader icon={Clock3} title="Recent activity" />
          {activity.length ? (
            <ol className="space-y-4 px-5 py-4">
              {activity.map((a) => {
                const who = displayName(a.actor ? people.get(a.actor) : null);
                const report = reportMap.get(a.report_id);
                return (
                  <li key={a.id} className="flex gap-3">
                    <Avatar name={who} size={30} />
                    <div className="min-w-0 text-sm">
                      <p className="text-slate-600">
                        <span className="font-medium text-[#0F2341]">{who}</span> {ACTIVITY_TEXT[a.action] ?? a.action}{" "}
                        {report ? (
                          <Link href={`/portal/reports/${report.id}`} className="font-medium text-[#0F2341] hover:text-[#2E5F8A] hover:underline">
                            {report.title}
                          </Link>
                        ) : (
                          "a report"
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {report ? `${clientMap.get(report.client_id)?.name ?? ""} · ` : ""}
                        {relativeTime(a.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState icon={FileText} title="No activity yet" description="Starting, reviewing and approving reports shows up here." />
          )}
        </Card>
      </div>
    </>
  );
}
