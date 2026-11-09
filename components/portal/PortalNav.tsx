"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileText, LayoutDashboard, LayoutTemplate, LogOut, Menu, UserRound, Users, Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isAdmin: boolean;
  reviewCount: number;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
}

export default function PortalNav({ isAdmin, reviewCount, userName, userEmail, signOutAction }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/portal/reports", label: "Reports", icon: FileText, badge: reviewCount },
    { href: "/portal/clients", label: "Clients", icon: Building2 },
    { href: "/portal/templates", label: "Templates", icon: LayoutTemplate },
    ...(isAdmin ? [{ href: "/portal/team", label: "Team", icon: Users }] : []),
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-amber-400 px-1.5 text-[11px] font-semibold text-slate-900" title="Waiting for your review">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link
        href="/portal/account"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <UserRound className="h-4 w-4 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-white">{userName}</span>
          <span className="block truncate text-xs text-slate-400">{userEmail}</span>
        </span>
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Phone / tablet top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#14213A] px-4 py-3 lg:hidden">
        <Link href="/portal" className="flex items-center gap-2">
          <Image src="/audax-icon.png" alt="" width={24} height={24} />
          <span className="text-sm font-semibold text-white">Audax Portal</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} className="text-white" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 top-[48px] z-20 flex flex-col bg-[#14213A] pt-3 lg:hidden">
          {nav}
          {footer}
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-[#14213A] lg:flex">
        <Link href="/portal" className="flex items-center gap-2.5 px-6 pb-6 pt-6">
          <Image src="/audax-icon.png" alt="" width={28} height={28} />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">Audax Portal</span>
            <span className="block text-[11px] text-slate-400">Client reporting</span>
          </span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  );
}
