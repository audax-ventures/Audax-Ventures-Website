"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";

interface Props {
  isAdmin: boolean;
  reviewCount: number;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

export default function PortalShell({ isAdmin, reviewCount, userName, userEmail, signOutAction, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = [
    {
      label: "Workspace",
      items: [
        { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/portal/reports", label: "Reports", icon: FileText, badge: reviewCount },
        { href: "/portal/clients", label: "Clients", icon: Building2 },
        { href: "/portal/templates", label: "Templates", icon: LayoutTemplate },
      ],
    },
    ...(isAdmin ? [{ label: "Admin", items: [{ href: "/portal/team", label: "Team", icon: Users }] }] : []),
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/portal" onClick={() => setMobileOpen(false)} className="block px-6 pb-6 pt-6">
        <Image src="/audax-logo.png" alt="Audax Ventures" width={542} height={176} className="h-auto w-[132px]" priority />
        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Team Portal</span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, "exact" in item ? item.exact : undefined);
                const badge = "badge" in item ? item.badge : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-[#EEF3F9] text-[#0F2341]" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F2341]",
                    )}
                  >
                    {active ? <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#2E5F8A]" aria-hidden /> : null}
                    <Icon className={cn("h-[18px] w-[18px]", active ? "text-[#2E5F8A]" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="flex-1">{item.label}</span>
                    {badge ? (
                      <span className="min-w-5 rounded-full bg-amber-100 px-1.5 text-center text-[11px] font-semibold leading-5 text-amber-800" title="Waiting for your review">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account menu */}
      <div className="relative border-t border-[#EEF1F5] p-3">
        {menuOpen ? (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-[#E4E9F0] bg-white py-1 shadow-lg">
            <Link
              href="/portal/account"
              onClick={() => { setMenuOpen(false); setMobileOpen(false); }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <UserRound className="h-4 w-4 text-slate-400" /> Account settings
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                <LogOut className="h-4 w-4 text-slate-400" /> Sign out
              </button>
            </form>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-50"
        >
          <Avatar name={userName} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#0F2341]">{userName}</span>
            <span className="block truncate text-xs text-slate-500">{isAdmin ? "Admin" : "Team member"} · {userEmail}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FB] lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#E4E9F0] bg-white lg:block">{sidebar}</aside>

      {/* Phone / tablet drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-[#0F2341]/30 backdrop-blur-[2px]" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[#E4E9F0] bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileOpen(true)} className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
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
                className="h-10 w-full rounded-xl border border-[#E4E9F0] bg-[#F6F8FB] pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2E5F8A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#E4E9F0] bg-white px-1.5 text-[11px] font-medium text-slate-400 sm:block">/</kbd>
            </form>
            <div className="ml-auto flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/portal/reports?status=in_review"
                  className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0F2341]"
                  aria-label={reviewCount ? `${reviewCount} reports waiting for review` : "No reports waiting for review"}
                  title="Waiting for review"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {reviewCount ? (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {reviewCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}
              <Link
                href="/portal/reports/new"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0F2341] px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1A3A5C]"
              >
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New report</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
