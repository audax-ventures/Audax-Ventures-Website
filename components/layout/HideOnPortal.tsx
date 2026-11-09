"use client";

import { usePathname } from "next/navigation";

/** Hides public-site pieces (menu, footer, chat widget) inside the private /portal area. */
export default function HideOnPortal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/portal" || pathname?.startsWith("/portal/")) return null;
  return <>{children}</>;
}
