import { redirect } from "next/navigation";
import { getSession } from "@/lib/portal/auth";
import { signOut } from "@/lib/portal/actions";
import { Button } from "@/components/portal/ui";

export const metadata = { title: "Waiting for access" };

export default async function PendingPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/portal/login");
  if (profile?.active) redirect("/portal");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Almost there</h1>
        <p className="mt-2 text-sm text-slate-600">
          You&apos;re signed in as <strong>{user.email}</strong>, but an admin still needs to turn on your
          access. Ask them to open <em>Team</em> in the portal and switch you on.
        </p>
        <form action={signOut} className="mt-5">
          <Button type="submit" variant="secondary">Sign out</Button>
        </form>
      </div>
    </div>
  );
}
