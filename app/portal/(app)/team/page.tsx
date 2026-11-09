import { requireAdmin } from "@/lib/portal/auth";
import { listProfiles } from "@/lib/portal/data";
import { Card, PageHeader } from "@/components/portal/ui";
import TeamTable from "./TeamTable";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const { supabase, user } = await requireAdmin();
  const people = await listProfiles(supabase);
  return (
    <>
      <PageHeader title="Team" description="Who can sign in to the portal, and who can approve reports." />
      <Card>
        <TeamTable people={people} currentUserId={user.id} />
      </Card>
      <Card className="mt-6 p-5 text-sm text-slate-600">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Adding someone</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>In Supabase, open <strong>Authentication → Users → Add user → Create new user</strong>.</li>
          <li>Enter their email and a password, and tick <strong>Auto Confirm User</strong>.</li>
          <li>They&apos;ll appear here as <em>No access</em>. Switch on their access below.</li>
          <li>Send them the link <code>audaxventures.ca/portal</code> and their password. They can change it under their name in the menu.</li>
        </ol>
        <p className="mt-3">
          <strong>Members</strong> create reports and submit them for review. <strong>Admins</strong> can also approve, mark as sent and reopen reports, and manage the team.
        </p>
      </Card>
    </>
  );
}
