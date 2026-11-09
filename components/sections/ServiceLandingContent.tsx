"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, AlertTriangle, Layers, Compass, PackageCheck, Sparkles, Users, HelpCircle, Plus, Minus, Check,
} from "lucide-react";
import type { ServicePageData } from "@/lib/service-pages-data";
import ServiceJourneyNav from "./ServiceJourneyNav";
import FirstNinetyDaysSection from "./FirstNinetyDaysSection";
import ServiceResultsSection from "./ServiceResultsSection";
import ServiceTestimonialsSection from "./ServiceTestimonialsSection";
import CTABanner from "@/components/layout/CTABanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { pageAccent, SECTION_TINT_BG, SECTION_CREAM_BG, headerAccentClass, HeaderAccentUnderline, SignatureLine } from "./ServicePageVisuals";

// Approach step counts vary by page (AI Leadership's process has 5 steps,
// the other two have 4) — pick the grid column count that matches.
const stepGridCols: Record<number, string> = {
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

function SectionEyebrow({ icon: Icon, label, accent }: { icon: React.ElementType; label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}14` }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</p>
    </div>
  );
}

export default function ServiceLandingContent({ data }: { data: ServicePageData }) {
  const accent = pageAccent[data.phase];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <SignatureLine variant={1} color={`${accent}0D`} />
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}14 0%, transparent 68%)` }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] mb-8">
            <Link href="/" className="hover:text-[#374151] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-[#374151] transition-colors">Services</Link>
            <span>/</span>
            <span className="text-[#374151]">{data.title}</span>
          </div>

          <ServiceJourneyNav current={data.phase} />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-widest uppercase mb-5"
            style={{ color: accent }}
          >
            {data.hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-4 leading-tight"
          >
            {data.hero.headline}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="font-heading font-bold text-xl sm:text-2xl mb-6"
            style={{ color: accent }}
          >
            {data.hero.subhead}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#374151] text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            {data.hero.body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://calendly.com/audax-ventures/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
            >
              Book a Discovery Call <ArrowRight size={16} />
            </a>
            <a
              href="#approach"
              className="inline-flex items-center justify-center gap-1.5 text-[#0F172A] font-semibold hover:opacity-70 transition-opacity"
            >
              View Our Approach <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── The Challenge ── */}
      <section className="py-20" style={{ backgroundColor: SECTION_TINT_BG }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionEyebrow icon={AlertTriangle} label="The Challenge" accent={accent} />
            <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-6 leading-snug ${headerAccentClass}`} style={{ borderColor: accent }}>
              {data.challenge.headline}
            </h2>
            <div className="space-y-4">
              {data.challenge.body.map((p, i) => (
                <p key={i} className="text-[#374151] leading-relaxed">{p}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How We Help ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-2xl mb-12">
            <SectionEyebrow icon={Layers} label="How We Help" accent={accent} />
            <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-5 leading-snug ${headerAccentClass}`} style={{ borderColor: accent }}>
              {data.howWeHelp.headline}
            </h2>
            <p className="text-[#374151] leading-relaxed">{data.howWeHelp.intro}</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">{data.howWeHelp.listLabel}</p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {data.howWeHelp.services.map((s) => (
                <div key={s} className="flex items-start gap-2.5">
                  <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span className="text-sm text-[#374151] leading-snug">{s}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Our Approach ── */}
      <section id="approach" className="py-20 scroll-mt-20" style={{ backgroundColor: SECTION_TINT_BG }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-2xl mb-14">
            <SectionEyebrow icon={Compass} label="Our Approach" accent={accent} />
            <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-5 leading-snug ${headerAccentClass}`} style={{ borderColor: accent }}>
              {data.approach.headline}
            </h2>
            {data.approach.intro.map((p, i) => (
              <p key={i} className="text-[#374151] leading-relaxed mb-2">{p}</p>
            ))}
          </FadeIn>

          <div className="relative">
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-gray-200" />
            <div className={`grid gap-8 sm:grid-cols-2 ${stepGridCols[data.approach.steps.length] ?? "lg:grid-cols-4"}`}>
              {data.approach.steps.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.08}>
                  <div
                    className="relative z-10 w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center mb-4 font-heading font-extrabold text-sm"
                    style={{ borderColor: `${accent}4D`, color: accent }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-heading font-bold text-[#0F172A] text-base mb-2">{s.title}</h3>
                  <p className="text-[#374151] text-sm leading-relaxed">{s.description}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Deliver ── */}
      {data.firstNinetyDays ? (
        <FirstNinetyDaysSection data={data.firstNinetyDays} accent={accent} />
      ) : data.whatWeDeliver ? (
        <section className="py-20" style={{ backgroundColor: SECTION_CREAM_BG }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="relative rounded-3xl overflow-hidden bg-[#0B1220] p-8 sm:p-12">
              <SignatureLine variant={3} color="#FFFFFF0D" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 10%, ${accent}29 0%, transparent 55%)` }}
              />
              <div className="relative">
                <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: "#60A5FA" }}>What We Deliver</p>
                <p className="text-white/70 leading-relaxed mb-8 max-w-lg">{data.whatWeDeliver.intro}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.whatWeDeliver.items.map((item) => (
                    <div key={item} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.08]">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <PackageCheck size={13} className="text-white" />
                      </div>
                      <span className="text-sm text-white/80 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* ── Why Audax ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="flex justify-center mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}14` }}>
                <Sparkles size={16} style={{ color: accent }} />
              </div>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: accent }}>Why Audax</p>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-2 leading-snug">
              {data.whyAudax.headline}
            </h2>
            <HeaderAccentUnderline color={accent} className="mb-6" />
            <div className="space-y-2">
              {data.whyAudax.body.map((p, i) => (
                <p key={i} className="text-[#374151] text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Who This Is For ── */}
      <section className="py-20" style={{ backgroundColor: SECTION_TINT_BG }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionEyebrow icon={Users} label="Who This Is For" accent={accent} />
            <p className="text-[#374151] leading-relaxed mb-6">{data.whoThisIsFor.intro}</p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {data.whoThisIsFor.items.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span className="text-sm text-[#374151] leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Real Results ── */}
      <ServiceResultsSection phase={data.phase} accent={accent} />

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-10">
            <SectionEyebrow icon={HelpCircle} label="FAQ" accent={accent} />
            <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] ${headerAccentClass}`} style={{ borderColor: accent }}>
              Frequently Asked Questions
            </h2>
          </FadeIn>

          <div className="space-y-3">
            {data.faq.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={f.q} className="rounded-2xl border border-gray-100 bg-[#F8F9FA] overflow-hidden transition-colors hover:bg-[#F1F2F5]">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-heading font-bold text-sm text-[#0F172A] leading-snug">{f.q}</span>
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                      style={isOpen ? { backgroundColor: accent, color: "#fff" } : { backgroundColor: "#F3F4F6", color: "#374151" }}
                    >
                      {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-[#374151] text-sm leading-relaxed">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <ServiceTestimonialsSection phase={data.phase} accent={accent} />

      {/* ── CTA ── */}
      <CTABanner heading={data.cta.headline} subtext={data.cta.sub} />
    </div>
  );
}
