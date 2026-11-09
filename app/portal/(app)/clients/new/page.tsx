import { requireMember } from "@/lib/portal/auth";
import { createClientAction } from "@/lib/portal/actions";
import { Card, PageHeader } from "@/components/portal/ui";
import ClientForm from "@/components/portal/ClientForm";

export const metadata = { title: "Add client" };

export default async function NewClientPage() {
  await requireMember();
  return (
    <>
      <PageHeader title="Add client" back={{ href: "/portal/clients", label: "Clients" }} />
      <Card className="max-w-2xl">
        <ClientForm action={createClientAction} submitLabel="Add client" />
      </Card>
    </>
  );
}
