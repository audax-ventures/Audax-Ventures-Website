"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, AlertTriangle, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { IndustryData } from "@/lib/industries-data";

// ── Hero photo for the 3 main industries only ─────────────────────────────────

const serviceLabels: Record<string, string> = {
  "ai-leadership": "AI Leadership",
  "custom-software-development": "Custom Software Development",
  "digital-operations": "Digital Operations",
};

const industryPhotos: Record<string, string> = {
  "financial-services": "/about/winnipeg-office-meeting.png",
  "professional-services": "/about-audax.png",
  "hospitality-tourism": "/about/whiteboard-strategy.png",
};

// ── Option 1: Per-industry accent colors ──────────────────────────────────────

const industryAccents: Record<string, { hex: string; label: string }> = {
  "financial-services":        { hex: "#059669", label: "emerald" },
  "professional-services":     { hex: "#64748B", label: "slate" },
  "hospitality-tourism":       { hex: "#4F46E5", label: "indigo" },
  "healthcare-medical":        { hex: "#0D9488", label: "teal" },
  "real-estate-construction":  { hex: "#D97706", label: "amber" },
  "retail-ecommerce":          { hex: "#E11D48", label: "rose" },
  "education-edtech":          { hex: "#7C3AED", label: "violet" },
  "manufacturing":             { hex: "#EA580C", label: "orange" },
  "transportation-logistics":  { hex: "#2563EB", label: "blue" },
  "non-profit":                { hex: "#16A34A", label: "green" },
  "technology-saas":           { hex: "#0891B2", label: "cyan" },
};

// ── Option 5: Before/After outcome data ───────────────────────────────────────

const beforeAfterData: Record<string, { metric: string; before: string; after: string; context: string }> = {
  "healthcare-medical":       { metric: "Patient intake time",       before: "45 min",          after: "8 min",          context: "by replacing paper forms with a digital pre-visit intake portal" },
  "manufacturing":            { metric: "Downtime visibility",        before: "End-of-shift",    after: "Real-time",      context: "after deploying IoT-connected machine monitoring and alerting" },
  "real-estate-construction": { metric: "Project status reporting",   before: "Weekly PDFs",     after: "Live dashboard", context: "replacing manual reporting cycles with a real-time project portal" },
  "fintech":                  { metric: "KYC processing time",        before: "3–5 days",        after: "Under 4 hrs",    context: "with automated document verification and risk-scoring workflows" },
  "retail":                   { metric: "Inventory accuracy",         before: "72%",             after: "99.4%",          context: "after replacing manual stock counts with real-time POS sync" },
  "education":                { metric: "Support response time",      before: "48 hrs",          after: "Under 2 hrs",    context: "with an AI-assisted student portal and automated triage" },
  "hospitality":              { metric: "Guest check-in time",        before: "12 min",          after: "90 sec",         context: "using a mobile-first digital check-in and room key system" },
  "legal":                    { metric: "Document review cycle",      before: "5–7 days",        after: "Same day",       context: "with AI-assisted contract analysis and automated redline workflows" },
  "logistics":                { metric: "Shipment visibility",        before: "End-of-day",      after: "Minute-by-minute", context: "after integrating GPS telemetry into a real-time tracking dashboard" },
  "non-profit":               { metric: "Grant reporting time",       before: "3 weeks",         after: "2 days",         context: "with automated impact data collection and funder-ready report generation" },
  "saas-companies":           { metric: "Feature cycle time",         before: "6–8 weeks",       after: "2 weeks",        context: "after restructuring CI/CD pipelines and adding automated test coverage" },
};

// ── Option 1: Animated count-up stat ─────────────────────────────────────────

function CountUpStat({ stat, label, accentHex }: { stat: string; label: string; accentHex: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const match = stat.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) { setDisplayed(stat); return; }
    const num = parseFloat(match[1]);
    const suffix = match[2];
    const steps = 40;
    const duration = 1400;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      const cur = Math.round(eased * num * 10) / 10;
      setDisplayed(`${Number.isInteger(cur) ? cur : cur.toFixed(1)}${suffix}`);
      if (step >= steps) { setDisplayed(stat); clearInterval(id); }
    }, duration / steps);
    return () => clearInterval(id);
  }, [inView, stat]);

  return (
    <div ref={ref} className="text-center">
      <div
        className="font-heading font-extrabold text-3xl sm:text-4xl mb-1.5 tabular-nums"
        style={{ color: accentHex }}
      >
        {displayed}
      </div>
      <div className="text-[#374151] text-xs leading-snug max-w-[140px] mx-auto">{label}</div>
    </div>
  );
}

// ── Option 2: Challenge → Solution pairs ─────────────────────────────────────

function ChallengeSolutionSection({
  challenges,
  solutions,
  accentHex,
}: {
  challenges: string[];
  solutions: IndustryData["solutions"];
  accentHex: string;
}) {
  const pairs = Math.min(challenges.length, solutions.length);
  const extraSolutions = solutions.slice(pairs);

  return (
    <div className="space-y-5">
      {Array.from({ length: pairs }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100"
        >
          {/* Challenge (left) */}
          <div className="flex items-start gap-4 bg-amber-50 border-r border-gray-100 px-6 py-5">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[#374151] text-sm leading-relaxed">{challenges[i]}</p>
          </div>

          {/* Solution (right) */}
          <div className="flex items-start gap-4 bg-white px-6 py-5">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: `${accentHex}18`, color: accentHex }}
            >
              {solutions[i].icon}
            </div>
            <div>
              <p
                className="font-heading font-bold text-sm mb-1"
                style={{ color: accentHex }}
              >
                {solutions[i].title}
              </p>
              <p className="text-[#374151] text-xs leading-relaxed">{solutions[i].description}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Extra solutions not paired */}
      {extraSolutions.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {extraSolutions.map((sol) => (
            <div
              key={sol.title}
              className="flex items-start gap-4 bg-white rounded-2xl px-6 py-5 border border-gray-100"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: `${accentHex}18`, color: accentHex }}
              >
                {sol.icon}
              </div>
              <div>
                <p className="font-heading font-bold text-sm mb-1 text-[#1A1A2E]">{sol.title}</p>
                <p className="text-[#374151] text-xs leading-relaxed">{sol.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Option 3: Solutions spotlight explorer ────────────────────────────────────

function SolutionsExplorer({
  solutions,
  accentHex,
}: {
  solutions: IndustryData["solutions"];
  accentHex: string;
}) {
  const [active, setActive] = useState(0);
  const featured = solutions[active];
  const rest = solutions.filter((_, i) => i !== active);

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-stretch">
      {/* Featured panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-3xl p-8 flex flex-col overflow-hidden border border-gray-100"
          style={{ backgroundColor: "#F8F9FA" }}
        >
          {/* Accent glow */}
          <div
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: accentHex }}
          />
          <div className="relative">
            <div className="text-4xl mb-5">{featured.icon}</div>
            <h3 className="font-heading font-extrabold text-2xl mb-3 leading-snug text-[#1A1A2E]">
              {featured.title}
            </h3>
            <p className="text-[#374151] leading-relaxed text-sm mb-8">{featured.description}</p>
            <Link
              href="https://calendly.com/audax-ventures/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
              style={{ backgroundColor: accentHex, color: "#fff" }}
            >
              Discuss This Solution <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sidebar list */}
      <div className="flex flex-col gap-2.5">
        {solutions.map((sol, i) => (
          <button
            key={sol.title}
            onClick={() => setActive(i)}
            className={`w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3.5 border transition-all duration-200 ${
              active === i
                ? "border-transparent shadow-sm"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
            style={
              active === i
                ? { backgroundColor: `${accentHex}12`, borderColor: `${accentHex}40` }
                : {}
            }
          >
            <span className="text-xl flex-shrink-0">{sol.icon}</span>
            <span
              className="font-heading font-bold text-xs leading-snug"
              style={{ color: active === i ? accentHex : "#1A1A2E" }}
            >
              {sol.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────

function FAQAccordion({ faq, accentHex }: { faq: IndustryData["faq"]; accentHex: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {faq.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            className={`rounded-2xl border overflow-hidden transition-colors duration-200 bg-white ${
              isOpen ? "border-opacity-40" : "border-gray-100 hover:border-gray-200"
            }`}
            style={isOpen ? { borderColor: `${accentHex}40` } : {}}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span
                className="font-heading font-bold text-sm leading-snug transition-colors"
                style={{ color: isOpen ? accentHex : "#1A1A2E" }}
              >
                {item.q}
              </span>
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                style={
                  isOpen
                    ? { backgroundColor: accentHex, color: "#fff" }
                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                }
              >
                {isOpen ? <Minus size={12} /> : <Plus size={12} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-[#374151] text-sm leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  industry: IndustryData;
  relatedIndustries: IndustryData[];
}

const sectionLinks = [
  { id: "overview",     label: "Overview" },
  { id: "challenges",   label: "Challenges & Solutions" },
  { id: "solutions",    label: "What We Build" },
  { id: "who-we-serve", label: "Who We Serve" },
  { id: "faq",          label: "FAQs" },
];

export default function IndustryPageContent({ industry, relatedIndustries }: Props) {
  const accent = industryAccents[industry.slug] ?? { hex: "#2E5F8A", label: "blue" };
  const accentHex = accent.hex;
  const beforeAfter = beforeAfterData[industry.slug];
  const heroPhoto = industryPhotos[industry.slug];

  return (
    <>
      {/* ── Light hero with per-industry accent + animated stats ── */}
      <section className="pt-32 pb-24 relative overflow-hidden bg-[#FAFAF8]">
        {/* Accent glow blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none"
          style={{ backgroundColor: accentHex }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[80px] opacity-8 pointer-events-none"
          style={{ backgroundColor: accentHex }}
        />
        {/* Giant faded icon backdrop */}
        {!heroPhoto && (
          <div className="absolute inset-0 flex items-center justify-end pr-16 pointer-events-none select-none">
            <span className="text-[240px] opacity-[0.04] leading-none">{industry.icon}</span>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={heroPhoto ? "grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-center" : ""}>
          <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#374151] mb-8">
            <Link href="/" className="hover:text-[#2E5F8A] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/industries" className="hover:text-[#2E5F8A] transition-colors">Industries</Link>
            <span>/</span>
            <span className="text-[#1A1A2E] font-medium">{industry.title}</span>
          </nav>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 uppercase tracking-widest"
            style={{ backgroundColor: `${accentHex}15`, color: accentHex }}
          >
            {industry.icon} {industry.title}
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl mb-5 leading-tight max-w-3xl" style={{ color: accentHex }}>
            {industry.title}
          </h1>
          <p className="text-[#374151] text-lg leading-relaxed mb-10 max-w-2xl">{industry.heroSub}</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-14">
            <Link
              href="https://calendly.com/audax-ventures/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity text-white"
              style={{ backgroundColor: accentHex }}
            >
              Book a Free Strategy Call <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 font-bold transition-opacity hover:opacity-70"
              style={{ borderColor: accentHex, color: accentHex }}
            >
              Tell Us About Your Project
            </Link>
          </div>
          </div>

          {heroPhoto && (
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5] hidden lg:block mb-14">
              <Image
                src={heroPhoto}
                alt={`${industry.title} — Audax Ventures`}
                fill
                className="object-cover"
                sizes="420px"
              />
            </div>
          )}
          </div>

          {/* Animated stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-gray-200">
            {industry.caseHighlights.map((h) => (
              <CountUpStat key={h.label} stat={h.stat} label={h.label} accentHex={accentHex} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Option 5: Before → After outcome strip ── */}
      {beforeAfter && (
        <section className="py-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="rounded-3xl overflow-hidden grid md:grid-cols-[1fr_auto_1fr] my-10 shadow-xl border border-gray-100"
              style={{ backgroundColor: "#FAFAF8" }}
            >
              {/* Before */}
              <div className="flex flex-col items-center justify-center gap-2 px-8 py-10 text-center bg-white">
                <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-1">Before</p>
                <p
                  className="font-heading font-extrabold text-5xl sm:text-6xl text-[#9CA3AF]"
                >
                  {beforeAfter.before}
                </p>
                <p className="text-[#9CA3AF] text-xs font-medium">{beforeAfter.metric}</p>
              </div>

              {/* Arrow + context */}
              <div
                className="flex flex-col items-center justify-center px-6 py-8 text-center gap-3 min-w-[180px]"
                style={{ backgroundColor: `${accentHex}18` }}
              >
                <div
                  className="text-3xl font-bold"
                  style={{ color: accentHex }}
                >
                  →
                </div>
                <p className="text-[#374151] text-xs leading-relaxed max-w-[160px]">
                  {beforeAfter.context}
                </p>
              </div>

              {/* After */}
              <div
                className="flex flex-col items-center justify-center gap-2 px-8 py-10 text-center"
                style={{ backgroundColor: `${accentHex}15` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: accentHex }}
                >
                  After
                </p>
                <p
                  className="font-heading font-extrabold text-5xl sm:text-6xl"
                  style={{ color: accentHex }}
                >
                  {beforeAfter.after}
                </p>
                <p className="text-[#374151] text-xs font-medium">{beforeAfter.metric}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Two-column layout: main + sticky sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12 lg:items-start relative">
          {/* Continuous vertical thread (desktop only), matches About/Home pages — shares
              the same positioning context as the section markers below, so both align */}
          <div
            className="hidden lg:block absolute -left-4 top-0 bottom-0 pointer-events-none z-0"
            style={{
              width: "1px",
              background: "linear-gradient(to bottom, transparent 0%, rgba(46,95,138,0.22) 4%, rgba(46,95,138,0.22) 96%, transparent 100%)",
            }}
          />

          {/* ── Main content ── */}
          <div>

            {/* Overview */}
            <section id="overview" className="py-16 scroll-mt-24 relative">
              {/* Thread marker */}
              <div className="hidden lg:block absolute -left-4 top-14 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#2E5F8A]/50 z-10" />
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E] mb-8">
                The {industry.title} Software Challenge
              </h2>
              {industry.overview.split("\n\n").map((para, i) => (
                <p key={i} className="text-[#374151] text-base leading-relaxed mb-5 last:mb-0">
                  {para}
                </p>
              ))}
            </section>

            {/* Option 2: Challenge → Solution pairs */}
            <section id="challenges" className="py-16 border-t border-gray-100 scroll-mt-24 relative">
              {/* Thread marker */}
              <div className="hidden lg:block absolute -left-4 top-14 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#2E5F8A]/50 z-10" />
              <div className="mb-10">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: accentHex }}>
                  Pain Points We Solve
                </p>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E]">
                  Challenge → Solution
                </h2>
                <p className="text-[#374151] text-sm mt-2">
                  Every challenge on the left maps to a solution we&apos;ve built on the right.
                </p>
              </div>
              <ChallengeSolutionSection
                challenges={industry.challenges}
                solutions={industry.solutions}
                accentHex={accentHex}
              />
            </section>

            {/* Option 3: Solutions explorer */}
            <section id="solutions" className="py-16 border-t border-gray-100 scroll-mt-24 relative">
              {/* Thread marker */}
              <div className="hidden lg:block absolute -left-4 top-14 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#2E5F8A]/50 z-10" />
              <div className="mb-10">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: accentHex }}>
                  What We Build
                </p>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E]">
                  {industry.title} Solutions We Deliver
                </h2>
                <p className="text-[#374151] text-sm mt-2">
                  Click any solution to explore the full scope.
                </p>
              </div>
              <SolutionsExplorer solutions={industry.solutions} accentHex={accentHex} />
            </section>

            {/* Who We Serve */}
            <section id="who-we-serve" className="py-16 border-t border-gray-100 scroll-mt-24 relative">
              {/* Thread marker */}
              <div className="hidden lg:block absolute -left-4 top-14 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#2E5F8A]/50 z-10" />
              <div className="mb-8">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: accentHex }}>
                  Our Clients
                </p>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E]">
                  Who We Serve in {industry.title}
                </h2>
              </div>
              <div className="space-y-3">
                {industry.whoWeServe.map((who, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="flex items-start gap-3 bg-[#F8F9FA] rounded-xl px-5 py-4 border border-gray-100"
                  >
                    <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: accentHex }} />
                    <span className="text-[#374151] text-sm leading-relaxed">{who}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Mid-page CTA */}
            <div
              className="rounded-3xl p-10 text-center my-4 relative overflow-hidden border border-gray-100"
              style={{ backgroundColor: "#F8F9FA" }}
            >
              <div
                className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-2xl opacity-15 pointer-events-none"
                style={{ backgroundColor: accentHex }}
              />
              <div className="relative">
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E] mb-3">
                  Ready to Build for {industry.title}?
                </h3>
                <p className="text-[#374151] mb-7 max-w-md mx-auto text-sm leading-relaxed">
                  {industry.tagline} Book a free 30-minute strategy call — we&apos;ll walk through your specific requirements, timeline, and budget.
                </p>
                <Link
                  href="https://calendly.com/audax-ventures/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity text-white"
                  style={{ backgroundColor: accentHex }}
                >
                  Book a Free Call <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* FAQ Accordion */}
            <section id="faq" className="py-16 border-t border-gray-100 scroll-mt-24 relative">
              {/* Thread marker */}
              <div className="hidden lg:block absolute -left-4 top-14 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#2E5F8A]/50 z-10" />
              <div className="mb-10">
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E]">
                  Frequently Asked Questions
                </h2>
              </div>
              <FAQAccordion faq={industry.faq} accentHex={accentHex} />
            </section>

          </div>

          {/* ── Option 4: Sticky sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">

              {/* Industry card + stats */}
              <div
                className="rounded-2xl p-6 border border-gray-100"
                style={{ backgroundColor: "#F8F9FA" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{industry.icon}</span>
                  <div>
                    <p className="text-[#374151] text-[10px] uppercase tracking-widest font-semibold">Industry</p>
                    <h3 className="font-heading font-extrabold text-base leading-snug text-[#1A1A2E]">
                      {industry.title}
                    </h3>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {industry.caseHighlights.map((h) => (
                    <div key={h.label} className="flex items-start justify-between gap-3">
                      <span className="text-[#374151] text-xs leading-tight flex-1">{h.label}</span>
                      <span
                        className="font-heading font-bold text-sm flex-shrink-0"
                        style={{ color: accentHex }}
                      >
                        {h.stat}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="https://calendly.com/audax-ventures/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity text-white"
                  style={{ backgroundColor: accentHex }}
                >
                  Book a Free Call <ArrowRight size={14} />
                </Link>
              </div>

              {/* Jump links */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-3">On This Page</p>
                <nav className="space-y-1">
                  {sectionLinks.map((link) => (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      className="flex items-center gap-2 text-sm text-[#374151] hover:text-[#1A1A2E] py-1.5 transition-colors group"
                    >
                      <span
                        className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-current transition-colors"
                        style={{}}
                      />
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Related services pills */}
              {industry.relatedServices.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-[#F8F9FA] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-3">Related Services</p>
                  <div className="flex flex-wrap gap-2">
                    {industry.relatedServices.slice(0, 4).map((s) => (
                      <Link
                        key={s}
                        href={`/services/${s}`}
                        className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-[#374151] hover:border-[#2E5F8A] hover:text-[#2E5F8A] transition-colors bg-white"
                      >
                        {serviceLabels[s] ?? s.replace(/-/g, " ")}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>

      {/* ── Other Industries ── */}
      {relatedIndustries.length > 0 && (
        <section className="py-16 bg-[#F8F9FA] border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-8 text-center">
              Other Industries We Serve
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedIndustries.map((ind) => (
                <Link
                  key={ind.slug}
                  href={`/industries/${ind.slug}`}
                  className="group flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#2E5F8A] hover:shadow-md transition-all duration-200"
                >
                  <span className="text-2xl flex-shrink-0">{ind.icon}</span>
                  <div>
                    <p className="font-heading font-bold text-sm text-[#1A1A2E] mb-1 group-hover:text-[#2E5F8A] transition-colors">
                      {ind.title}
                    </p>
                    <p className="text-xs text-[#374151] leading-snug line-clamp-2">{ind.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/industries"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E5F8A] hover:text-[#3A7BD5] transition-colors"
              >
                View all industries <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
