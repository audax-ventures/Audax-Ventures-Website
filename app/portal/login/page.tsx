import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/portal/auth";
import { isSupabaseConfigured } from "@/lib/portal/supabase/env";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/portal/login">) {
  const { next } = await searchParams;
  const configured = isSupabaseConfigured();
  if (configured) {
    const { user } = await getSession();
    if (user) redirect(typeof next === "string" && next.startsWith("/portal") ? next : "/portal");
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/audax-logo.png" alt="Audax Ventures" width={140} height={45} priority />
          <p className="mt-4 text-sm text-slate-500">Team portal · client reporting</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {configured ? (
            <LoginForm next={typeof next === "string" ? next : undefined} />
          ) : (
            <p className="text-sm text-slate-600">
              The portal isn&apos;t connected to its database yet. Add the Supabase settings to the
              website&apos;s environment variables (see <code>docs/portal-setup.md</code>).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
