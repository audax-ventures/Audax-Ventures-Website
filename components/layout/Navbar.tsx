"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ArrowRight, Lightbulb, Code2, TrendingUp } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────
// Icons and accent colors mirror the homepage "What We Do" service cards
// (components/sections/ServicesGrid.tsx) for a consistent visual identity.

const serviceLinks = [
  {
    phase: "Think",
    label: "AI Leadership",
    href: "/services/ai-leadership",
    desc: "Strategy, roadmaps & executive AI advisory",
    icon: Lightbulb,
    accentBg: "#0F172A",
    stat: "Exec-level AI leadership",
    preview: "We work alongside founders and leadership teams to identify opportunities, develop AI strategies, and create a practical roadmap for adopting AI across the organization.",
  },
  {
    phase: "Build",
    label: "Software Development",
    href: "/services/custom-software-development",
    desc: "AI applications, SaaS platforms & websites",
    icon: Code2,
    accentBg: "#7C3AED",
    stat: "100% IP ownership",
    preview: "We design and build the technology that powers your strategy — AI applications, SaaS platforms, internal business systems, and modern websites.",
  },
  {
    phase: "Scale",
    label: "Digital Operations",
    href: "/services/digital-operations",
    desc: "Long-term technology partnership & optimization",
    icon: TrendingUp,
    accentBg: "#10B981",
    stat: "Ongoing partnership",
    preview: "We become your long-term technology partner, helping you improve systems, introduce new capabilities, optimize workflows, and support the next stage of growth.",
  },
];

const navLinks = [
  { label: "About",        href: "/about",     kind: "link" as const },
  { label: "Services",     href: "/services",  kind: "services" as const },
  { label: "Products",     href: "/products",  kind: "link" as const },
  { label: "Articles",     href: "/insights",  kind: "link" as const },
  { label: "Success Stories", href: "/success-stories", kind: "link" as const },
  { label: "Contact",      href: "/contact",   kind: "link" as const },
];

// ── Shared sub-components ─────────────────────────────────────────────────────

/** Large, prominent card for a service shown directly in the dropdown */
function BigCard({
  href, icon: Icon, accentBg, label, desc, stat, phase, onClose,
}: {
  href: string; icon: React.ElementType; accentBg: string; label: string; desc: string; stat: string;
  phase?: string; onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 hover:border-[#2563EB]/30 hover:bg-[#F8F9FA] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentBg }}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowRight size={14} className="text-[#9CA3AF] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        {phase && (
          <p className="text-[10px] tracking-widest uppercase text-[#2563EB] font-bold mb-1">{phase}</p>
        )}
        <p className="font-heading font-extrabold text-[#0F172A] text-base mb-1 leading-snug">{label}</p>
        <p className="text-[#374151] text-sm leading-snug">{desc}</p>
      </div>
      <div className="inline-flex items-center self-start px-2.5 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-bold mt-1">
        {stat}
      </div>
    </Link>
  );
}

/** Full-width CTA strip at the bottom of a mega-dropdown */
function CTAStrip({ prompt, linkLabel, href }: { prompt: string; linkLabel: string; href: string }) {
  return (
    <div
      className="px-6 py-4 flex items-center justify-between"
      style={{ background: "linear-gradient(90deg, #0B1220 0%, #1E293B 100%)" }}
    >
      <p className="text-white/55 text-xs">{prompt}</p>
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#60A5FA] transition-colors"
      >
        {linkLabel} <ArrowRight size={11} />
      </Link>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"services" | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("/").slice(0, 2).join("/"));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] py-2.5"
          : "bg-white/95 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/audax-logo.png"
            alt="Audax Ventures"
            width={200}
            height={65}
            priority
            className="h-16 w-auto transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {

            /* ── Services Mega Dropdown ── */
            if (link.kind === "services") return (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenMenu("services")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  className={`relative flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(link.href) || openMenu === "services"
                      ? "text-[#0F172A] bg-[#0F172A]/6 font-semibold"
                      : "text-[#374151] hover:text-[#0F172A] hover:bg-[#0F172A]/5"
                  }`}
                >
                  {link.label}
                  <ChevronDown size={14} className={`transition-transform duration-250 ${openMenu === "services" ? "rotate-180" : ""}`} />
                  {isActive(link.href) && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[#CC5500]" />
                  )}
                </button>

                <AnimatePresence>
                  {openMenu === "services" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[940px] bg-white rounded-2xl shadow-2xl shadow-black/12 border border-gray-100 overflow-hidden"
                    >
                      <div className="p-6">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#374151] mb-4">
                          Core Services
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          {serviceLinks.map((s) => (
                            <BigCard
                              key={s.href}
                              href={s.href} icon={s.icon} accentBg={s.accentBg} label={s.label} desc={s.desc} stat={s.stat} phase={s.phase}
                              onClose={() => setOpenMenu(null)}
                            />
                          ))}
                        </div>
                      </div>

                      <CTAStrip
                        prompt="Not sure which service fits? Tell us what you're building."
                        linkLabel="Book a Free AI Strategy Call"
                        href="https://calendly.com/audax-ventures/30min"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );

            /* ── Regular link ── */
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative text-[15px] font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-[#0F172A] bg-[#0F172A]/6 font-semibold"
                    : "text-[#374151] hover:text-[#0F172A] hover:bg-[#0F172A]/5"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[#CC5500]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── CTA ── */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="https://calendly.com/audax-ventures/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B1220] text-white text-sm font-semibold transition-all duration-300 hover:bg-[#1E293B] hover:shadow-[0_0_24px_rgba(11,18,32,0.35)] hover:scale-[1.03]"
          >
            Book a Free Strategy Call
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mobileOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden overflow-hidden border-t border-gray-100"
          >
            <div className="bg-white px-4 py-4">
              <div className="flex flex-col gap-0.5 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-[#0F172A]/6 text-[#0F172A] font-semibold"
                        : "text-[#374151] hover:bg-[#F8F9FA] hover:text-[#0F172A]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#0F172A] px-3 mb-2">Services</p>
                {serviceLinks.map((s) => (
                  <Link key={s.href} href={s.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-lg text-sm text-[#374151] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors font-medium">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.accentBg }}>
                      <s.icon size={13} className="text-white" />
                    </div>
                    <span>
                      <span className="block text-[9px] tracking-widest uppercase text-[#2563EB] font-bold leading-none mb-0.5">{s.phase}</span>
                      {s.label}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href="https://calendly.com/audax-ventures/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-[#0B1220] text-white text-sm font-bold hover:bg-[#1E293B] transition-colors"
              >
                Book a Free Strategy Call
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
