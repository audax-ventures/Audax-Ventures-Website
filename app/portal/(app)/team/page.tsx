import { ShieldCheck, UserPlus, Users } from "lucide-react";
import { requireAdmin } from "@/lib/portal/auth";
import { listProfiles } from "@/lib/portal/data";
import { Card, CardHeader, PageHeader } from "@/components/portal/ui";
import TeamTable from "./TeamTable";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const { supabase, user } = await requireAdmin();
  const people = await listProfiles(supabase);
  const active = people.filter((p) => p.active).length;
  return (
    <>
      <PageHeader title="Team" description="Who can sign in to the portal, and who can approve reports." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] [&>*]:min-w-0">
        <Card>
          <CardHeader icon={Users} title="People" description={`${active} of ${people.length} can sign in`} />
          <TeamTable people={people} currentUserId={user.id} />
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader icon={UserPlus} title="Adding someone" />
            <ol className="space-y-3.5 p-5 text-sm text-slate-600">
              {[
                <>In Supabase, open <strong className="text-slate-800">Authentication → Users → Add user → Create new user</strong>.</>,
                <>Enter their email and a password, and tick <strong className="text-slate-800">Auto Confirm User</strong>.</>,
                <>They appear here with no access. Switch their access on.</>,
                <>Send them <span className="font-medium text-slate-800">audaxventures.ca/portal</span> and their password. They can change it in Account settings.</>,
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF3F9] text-xs font-semibold text-[#2E5F8A]">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <CardHeader icon={ShieldCheck} title="Roles" />
            <dl className="space-y-3 p-5 text-sm">
              <div>
                <dt className="font-semibold text-[#0F2341]">Member</dt>
                <dd className="text-slate-600">Creates reports and submits them for review.</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#0F2341]">Admin</dt>
                <dd className="text-slate-600">Also approves, marks as sent and reopens reports, and manages the team.</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
