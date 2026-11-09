import { requireMember } from "@/lib/portal/auth";
import { Card, CardHeader, PageHeader } from "@/components/portal/ui";
import AccountForms from "./AccountForms";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const { profile } = await requireMember();
  return (
    <>
      <PageHeader title="Your account" description={profile.email} />
      <Card className="max-w-xl">
        <CardHeader title="Profile & password" />
        <AccountForms fullName={profile.full_name ?? ""} />
      </Card>
    </>
  );
}
