"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClass } from "./ui";

interface Props {
  isAdmin: boolean;
  reviewCount: number;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

/** Soft light-blue waves along the top of the page. */
function PageWaves() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[340px] w-full"
      viewBox="0 0 1200 340"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="pw-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C9DAEE" stopOpacity="0" />
          <stop offset="0.6" stopColor="#C9DAEE" stopOpacity="0.45" />
          <stop offset="1" stopColor="#B7CDE8" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="pw-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#DCE7F4" stopOpacity="0" />
          <stop offset="1" stopColor="#D3E1F2" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d="M0 210 C 260 260, 520 120, 760 150 C 950 175, 1080 90, 1200 60 L 1200 0 L 0 0 Z" fill="url(#pw-b)" opacity="0.6" />
      <path d="M380 260 C 600 200, 760 250, 940 170 C 1060 118, 1140 110, 1200 120 L 1200 0 L 520 0 C 620 120, 520 210, 380 260 Z" fill="url(#pw-a)" />
      <path d="M560 300 C 760 230, 900 260, 1200 150" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/** Flowing light bands across the navy sidebar. */
function SidebarWaves() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 260 900" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sw-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B78C2" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3B78C2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-40 760 C 40 640, 150 610, 300 470 L 300 560 C 170 660, 70 700, -40 860 Z" fill="url(#sw-a)" />
      <path d="M-40 700 C 60 600, 160 560, 300 420" stroke="#6FA3E0" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
      <path d="M-40 730 C 70 630, 170 600, 300 460" stroke="#6FA3E0" strokeOpacity="0.18" strokeWidth="1" fill="none" />
    </svg>
  );
}

export default function PortalShell({ isAdmin, reviewCount, signOutAction, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Press "/" anywhere to jump to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true, badge: 0 },
    { href: "/portal/reports", label: "Reports", icon: FileText, exact: false, badge: reviewCount },
    { href: "/portal/clients", label: "Clients", icon: Building2, exact: false, badge: 0 },
    { href: "/portal/templates", label: "Templates", icon: LayoutTemplate, exact: false, badge: 0 },
    ...(isAdmin ? [{ href: "/portal/team", label: "Team", icon: Users, exact: false, badge: 0 }] : []),
    { href: "/portal/account", label: "Account settings", icon: Settings, exact: false, badge: 0 },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[26px] bg-gradient-to-b from-[#0B1B33] via-[#0F2747] to-[#123660] text-white shadow-[0_24px_48px_-20px_rgba(11,27,51,0.65),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      <SidebarWaves />

      <Link href="/portal" onClick={() => setMobileOpen(false)} className="relative mx-3 mt-3 block rounded-2xl px-4 pb-5 pt-6">
        <Image
          src="/audax-logo.png"
          alt="Audax Ventures"
          width={542}
          height={176}
          className="h-auto w-[172px] brightness-0 invert"
          priority
        />
        <span className="mt-2.5 block pl-[3px] text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white/60">Team Portal</span>
      </Link>
      <div className="relative mx-6 mb-4 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" aria-hidden />

      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-white/[0.16] to-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_6px_18px_-8px_rgba(0,0,0,0.5)]"
                  : "text-white/75 hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-white" : "text-white/60 group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="min-w-5 rounded-full bg-amber-400 px-1.5 text-center text-[11px] font-bold leading-5 text-[#0B1B33]" title="Waiting for your review">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <div className="mx-3 !my-2.5 h-px bg-white/15" aria-hidden />
        <form action={signOutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-all hover:bg-white/[0.07] hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px] text-white/60 group-hover:text-white" />
            <span className="flex-1 text-left">Sign out</span>
          </button>
        </form>
      </nav>
      <div className="h-4" aria-hidden />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF3F9] to-[#E6EEF8] lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[14rem] shrink-0 py-3 pl-3 lg:block">{sidebar}</aside>

      {/* Phone / tablet drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-[#0B1B33]/40 backdrop-blur-[2px]" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-[16rem] max-w-[85vw] p-3">
            <button onClick={() => setMobileOpen(false)} className="absolute right-6 top-8 z-10 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <PageWaves />

        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/55 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileOpen(true)} className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-white lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <form
              className="relative min-w-0 max-w-md flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchRef.current?.value.trim() ?? "";
                router.push(q ? `/portal/reports?q=${encodeURIComponent(q)}` : "/portal/reports");
              }}
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search reports…"
                aria-label="Search reports"
                className="h-10 w-full rounded-xl border border-[#DCE4EF] bg-white/90 pl-10 pr-10 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,35,65,0.04)] placeholder:text-slate-400 transition-colors focus:border-[#2E5F8A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#DCE4EF] bg-white px-1.5 text-[11px] font-medium text-slate-500 sm:block">/</kbd>
            </form>
            <div className="ml-auto flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/portal/reports?status=in_review"
                  className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-white hover:text-[#0F2341]"
                  aria-label={reviewCount ? `${reviewCount} reports waiting for review` : "No reports waiting for review"}
                  title="Waiting for review"
                >
                  <Bell className="h-5 w-5" />
                  {reviewCount ? (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {reviewCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}
              <Link href="/portal/reports/new" className={buttonClass("primary")}>
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New report</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
