import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Audax Portal", template: "%s · Audax Portal" },
  robots: { index: false, follow: false, nocache: true },
};

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F6F8FB] text-slate-900">{children}</div>;
}
