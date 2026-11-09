import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { getSession } from "@/lib/portal/auth";
import { signOut } from "@/lib/portal/actions";
import { Button } from "@/components/portal/ui";

export const metadata = { title: "Waiting for access" };

export default async function PendingPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/portal/login");
  if (profile?.active) redirect("/portal");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#F4F7FB] via-[#EDF2F8] to-[#DFE7F1] px-4 py-12">
      <Image src="/audax-logo.png" alt="Audax Ventures" width={542} height={176} className="mb-8 h-auto w-44" priority />
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-8 text-center shadow-[0_24px_60px_-20px_rgba(20,33,58,0.18)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-8 ring-amber-50/50">
          <Clock3 className="h-5 w-5" />
        </span>
        <h1 className="mt-5 font-heading text-xl font-semibold text-[#0F2341]">Almost there</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          You&apos;re signed in as <strong className="text-slate-800">{user.email}</strong>, but an admin still needs to turn on
          your access. Ask them to open <em>Team</em> in the portal and switch you on.
        </p>
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="secondary">Sign out</Button>
        </form>
      </div>
    </div>
  );
}
