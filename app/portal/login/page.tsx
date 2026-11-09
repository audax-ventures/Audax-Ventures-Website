import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/portal/auth";
import { isSupabaseConfigured } from "@/lib/portal/supabase/env";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

/** Soft curved bands behind the logo panel. */
function Swooshes() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 600 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="band-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="band-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#C9D5E6" stopOpacity="0.7" />
          <stop offset="1" stopColor="#C9D5E6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M-80 1000 C 40 620, 260 260, 520 -40 L 430 -40 C 190 240, -10 600, -160 1000 Z" fill="url(#band-a)" />
      <path d="M40 -40 C 160 140, 210 320, 120 560 C 70 690, -20 780, -80 840 L -80 -40 Z" fill="#DCE4EF" opacity="0.55" />
      <path d="M620 560 C 470 700, 360 860, 300 1040 L 620 1040 Z" fill="url(#band-b)" />
      <path d="M-40 1040 C 120 880, 330 830, 620 840 L 620 1040 Z" fill="#E3EAF3" opacity="0.8" />
      <path d="M-40 1040 C 140 900, 340 860, 620 870" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/portal/login">) {
  const { next } = await searchParams;
  const configured = isSupabaseConfigured();
  if (configured) {
    const { user } = await getSession();
    if (user) redirect(typeof next === "string" && next.startsWith("/portal") ? next : "/portal");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Brand panel */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F4F7FB] via-[#EDF2F8] to-[#DFE7F1] px-6 py-12 lg:w-[44%] lg:py-0">
        <Swooshes />
        <div className="relative flex flex-col items-center text-center">
          <Image
            src="/audax-logo.png"
            alt="Audax Ventures"
            width={542}
            height={176}
            priority
            className="h-auto w-48 lg:w-[19rem]"
          />
          <span className="mt-8 hidden h-px w-16 bg-[#2E5F8A]/50 lg:block" />
          <p className="mt-5 text-base font-medium tracking-wide text-[#5A6478] lg:mt-8 lg:text-xl">
            Audax Ventures Team Portal
          </p>
        </div>
      </div>

      {/* Sign-in */}
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 lg:items-center lg:py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_24px_60px_-20px_rgba(20,33,58,0.18)] sm:p-10">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#0F2341] sm:text-[1.7rem]">
            Welcome to the Audax Portal
          </h1>
          <p className="mt-2 text-sm text-[#5A6478]">Sign-in below</p>
          <div className="mt-8">
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
