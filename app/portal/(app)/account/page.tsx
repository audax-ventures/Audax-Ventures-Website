import { displayName, requireMember } from "@/lib/portal/auth";
import { Avatar, Card, PageHeader } from "@/components/portal/ui";
import AccountForms from "./AccountForms";

export const metadata = { title: "Account settings" };

export default async function AccountPage() {
  const { profile } = await requireMember();
  const name = displayName(profile);
  return (
    <>
      <PageHeader title="Account settings" description="Your name and password." />
      <div className="max-w-2xl space-y-6">
        <Card className="flex items-center gap-4 p-5">
          <Avatar name={name} size={52} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#0F2341]">{name}</p>
            <p className="truncate text-sm text-slate-500">
              {profile.email} · {profile.role === "admin" ? "Admin" : "Team member"}
            </p>
          </div>
        </Card>
        <AccountForms fullName={profile.full_name ?? ""} />
      </div>
    </>
  );
}
