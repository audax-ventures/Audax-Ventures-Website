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
import { formatPeriod, formatShortDate, nextReportState, todayInWinnipeg, type NextState } from "@/lib/portal/compute";
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

  // What's next for each report template: a report already in progress, one that's
  // due (its period has ended), or one whose period hasn't finished yet.
  const todayIso = todayInWinnipeg();
  const order: Record<NextState, number> = { due: 0, progress: 1, upcoming: 2 };
  const upcoming = templates
    .filter((t) => clientMap.has(t.client_id))
    .map((t) => ({ template: t, client: clientMap.get(t.client_id)!, ...nextReportState(t.cadence, lastByTemplate.get(t.id), todayIso) }))
    .sort((a, b) => order[a.state] - order[b.state] || a.period.end.localeCompare(b.period.end));

  const attention = isAdmin ? [...inReview, ...approvedUnsent] : myDrafts;
  const name = displayName(profile).split(" ")[0];
  const firstName = name.charAt(0).toUpperCase() + name.slice(1);
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Winnipeg" });

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`Hello, ${firstName}!`}
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

      {/* Upcoming reports */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#0B1B33]">Upcoming Reports</h2>
            <p className="mt-0.5 text-sm text-slate-600">Complete your next upcoming report</p>
          </div>
          <Link href="/portal/templates" className="group inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#1F5A99] hover:text-[#0F2341]">
            Manage templates <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
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
            {upcoming.map((u) => {
              const pill = {
                due: { text: "Due now", cls: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
                progress: { text: u.inProgress?.status === "in_review" ? "In review" : "Draft in progress", cls: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
                upcoming: { text: `Upcoming · ends ${formatShortDate(u.period.end)}`, cls: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
              }[u.state];
              const href = u.inProgress ? `/portal/reports/${u.inProgress.id}` : `/portal/reports/new?template=${u.template.id}`;
              return (
                <Link key={u.template.id} href={href} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2E5F8A]/15">
                  <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_1px_2px_rgba(15,35,65,0.05),0_18px_40px_-16px_rgba(15,35,65,0.28)]">
                    <div className="flex items-start gap-3">
                      <ClientLogo src={u.client.logo_data} name={u.client.name} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0F2341]">{u.template.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.client.name}</p>
                      </div>
                      <Pill>{u.template.cadence === "custom" ? "Custom" : u.template.cadence}</Pill>
                    </div>
                    <span className={`mt-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${pill.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} aria-hidden /> {pill.text}
                    </span>
                    <div className="mt-3 flex items-center justify-between border-t border-[#E8EEF5] pt-3.5 text-sm">
                      <span className="min-w-0 truncate text-slate-500">
                        {u.inProgress ? "Period" : "Next"}: <span className="font-semibold text-[#0B1B33]">{formatPeriod(u.period.start, u.period.end)}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 pl-2 text-sm font-semibold text-[#1F5A99]">
                        {u.inProgress ? "Continue" : "Start"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
            actions={<Link href="/portal/reports" className="group inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#1F5A99] hover:text-[#0F2341]">All reports <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>}
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
