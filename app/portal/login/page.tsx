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
    <div className="flex min-h-screen flex-col bg-[#FAF7F3] lg:flex-row">
      {/* Photo panel: Winnipeg skyline at dusk */}
      <div className="relative h-[300px] overflow-hidden bg-[#0B1B33] sm:h-[360px] lg:sticky lg:top-0 lg:h-screen lg:w-[46%]">
        <Image
          src="/portal-login.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover object-bottom"
        />
        {/* Darken the top so the logo stays crisp, and the bottom edge slightly */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#071226]/85 via-[#071226]/25 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#071226]/40 to-transparent" />
        <div className="relative flex h-full flex-col items-center px-6 pt-12 text-center sm:pt-16 lg:pt-[16vh]">
          <Image
            src="/audax-logo.png"
            alt="Audax Ventures"
            width={542}
            height={176}
            priority
            className="h-auto w-44 brightness-0 invert drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:w-56 lg:w-[19rem]"
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 sm:text-sm lg:mt-6">
            Reporting Portal
          </p>
        </div>
      </div>

      {/* Sign-in */}
      <div className="flex flex-1 items-start justify-center px-6 py-12 sm:px-10 lg:items-center lg:py-16">
        <div className="w-full max-w-[26rem]">
          <h1 className="font-heading text-[2.1rem] font-bold leading-tight tracking-tight text-[#0B1B33] sm:text-[2.5rem]">
            Welcome
          </h1>
          <p className="mt-2 text-base text-[#3E5878]">Sign-in below</p>
          <div className="mt-10">
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
    </div>
  );
}
