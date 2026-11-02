"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Target, Eye, Gem, Check, X, User, Code2,
  Flag, TrendingUp, Sparkles, Box, Rocket, ArrowRightLeft, Link2, Users, CheckCircle2,
  Building2, Compass, Layers, RefreshCw, Settings, PackagePlus, Handshake,
} from "lucide-react";
import { comparisonRows } from "@/lib/comparison-data";

// ── Data ──────────────────────────────────────────────────────────────────────

const heroStats = [
  { icon: Users, value: "100+", label: "Organizations Worked With" },
  { icon: Box, value: "10+", label: "Industries Served" },
];

const values = [
  "Outcomes Over Outputs",
  "Integrity & Transparency",
  "Innovation With Purpose",
  "Partnership & Trust",
  "Excellence in Execution",
];

const pillars = [
  {
    icon: User,
    title: "Fractional CAIO",
    description: "Strategic AI leadership, governance, and team enablement to ensure AI drives real value across your organization.",
    accentBg: "bg-[#0F172A]",
  },
  {
    icon: Code2,
    title: "Custom Software Development",
    description: "From internal tools to AI-powered platforms, we build secure, scalable software that solves your most critical challenges.",
    accentBg: "bg-[#7C3AED]",
  },
];

const differentiators = [
  { icon: ArrowRightLeft, title: "Strategy to Execution", description: "We go beyond recommendations to build and implement solutions that deliver results." },
  { icon: Link2, title: "Integrated Partnership", description: "AI leadership and software development under one roof for seamless alignment." },
  { icon: Users, title: "Embedded With You", description: "We become an extension of your team, not just an outside consultant." },
  { icon: CheckCircle2, title: "Results That Matter", description: "We measure success by the impact on your business — not by the decks we deliver." },
];

const timeline = [
  { icon: Flag, year: "2019", title: "The Beginning", description: "Audax Ventures was founded with a simple belief: strategy only matters when it creates real-world impact." },
  { icon: TrendingUp, year: "2020–2021", title: "Early Impact", description: "We helped early partners modernize operations and leverage data and automation to scale." },
  { icon: Sparkles, year: "2022–2023", title: "AI Leadership Emerges", description: "As AI surged, we stepped into a new role—guiding organizations as their Fractional Chief AI Officer." },
  { icon: Box, year: "2024", title: "Building What Matters", description: "We expanded our team and capabilities, delivering custom AI solutions that drive measurable ROI." },
  { icon: Rocket, year: "Today & Beyond", title: "The Future We Build", description: "We continue to partner with visionary organizations to turn AI strategy into lasting business advantage." },
];

const trustedStats = [
  { value: "100+", label: "Organizations Worked With" },
  { value: "10+", label: "Industries Served" },
  { value: "98%", label: "Client Retention Rate" },
  { value: "25+", label: "AI Initiatives Launched" },
];

const audiences = [
  { icon: Rocket, title: "Early-Stage Founders", description: "Building an MVP, validating an idea, or bringing a new technology product to market." },
  { icon: TrendingUp, title: "Growing Businesses", description: "Modernizing operations, replacing disconnected software, and implementing AI to improve efficiency and scale." },
  { icon: Building2, title: "Established Organizations", description: "Developing enterprise AI strategies, building custom technology, and creating long-term digital transformation roadmaps." },
];

const engagementTypes = [
  { icon: Compass, label: "Exploring your first AI initiative" },
  { icon: Layers, label: "Building a custom software platform" },
  { icon: RefreshCw, label: "Replacing legacy systems" },
  { icon: Settings, label: "Modernizing business operations" },
  { icon: PackagePlus, label: "Launching a new SaaS product" },
  { icon: Handshake, label: "Looking for a long-term technology partner" },
];

// Leadership team section is hidden for now; flip to true to bring it back.
const SHOW_LEADERSHIP_TEAM = false;

const leadershipTeam = [
  { name: "Joshua Zaporzan", title: "President", image: "/team/joshua-zaporzan.avif" },
  { name: "Manoj Manghnani", title: "Director of Technology & AI", image: "/team/manoj-manghnani.png" },
  { name: "Denise Zaporzan", title: "Director of Strategy", image: "/team/denise-zaporzan.png" },
  { name: "Riley Peterson", title: "Business Development & Project Manager", image: "/team/riley-peterson.png" },
  { name: "Lindsay Friesen", title: "Project Manager", image: "/team/lindsay-friesen.png" },
  { name: "Lawson Yates", title: "Marketing Manager", image: "/team/lawson-yates.png" },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AboutContent() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 68%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-bold tracking-widest uppercase text-[#2563EB] mb-5"
              >
                About Audax Ventures
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="font-[var(--font-outfit)] font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-6 leading-tight"
              >
                AI Strategy. Custom Software.{" "}
                <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                  Real Impact.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[#374151] text-lg leading-relaxed mb-8 max-w-xl"
              >
                Audax Ventures is the partner organizations call when they&apos;re ready to lead with AI. We combine executive leadership with world-class software development to turn strategy into measurable business outcomes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <a
                  href="https://calendly.com/audax-ventures/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
                >
                  Book a Free Strategy Call
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                <Image
                  src="/about/winnipeg-office-meeting.png"
                  alt="Audax Ventures team in a client meeting at the Winnipeg office"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 560px"
                  priority
                />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute -bottom-6 -right-4 sm:right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-3 w-48"
              >
                {heroStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                      <s.icon size={16} className="text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="font-[var(--font-outfit)] font-extrabold text-sm text-[#0F172A] leading-none">{s.value}</p>
                      <p className="text-[#9CA3AF] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ── */}
      <section className="pt-16 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="bg-[#F8F9FA] rounded-2xl border border-gray-100 p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                <Target size={18} className="text-[#2563EB]" />
              </div>
              <h3 className="font-[var(--font-outfit)] font-bold text-lg text-[#0F172A] mb-2">Our Mission</h3>
              <p className="text-[#374151] text-sm leading-relaxed">
                To empower organizations with AI leadership and software solutions that drive efficiency, accelerate growth, and create measurable impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="bg-[#F8F9FA] rounded-2xl border border-gray-100 p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                <Eye size={18} className="text-[#2563EB]" />
              </div>
              <h3 className="font-[var(--font-outfit)] font-bold text-lg text-[#0F172A] mb-2">Our Vision</h3>
              <p className="text-[#374151] text-sm leading-relaxed">
                A future where every organization—regardless of size—has access to world-class AI leadership and custom technology that transforms how they operate.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="bg-[#F8F9FA] rounded-2xl border border-gray-100 p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                <Gem size={18} className="text-[#2563EB]" />
              </div>
              <h3 className="font-[var(--font-outfit)] font-bold text-lg text-[#0F172A] mb-4">Our Values</h3>
              <div className="space-y-2">
                {values.map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <Check size={14} className="text-[#2563EB] flex-shrink-0" />
                    <span className="text-sm text-[#374151]">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why We Do What We Do ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Why We Do What We Do</p>
            <h2 className="font-[var(--font-outfit)] font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
              Executive Leadership. Without the Full-Time Cost.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-[#374151] leading-relaxed"
            >
              Hiring a full-time Chief AI Officer or building an in-house development team is costly and time-consuming. We provide senior AI leadership and custom software development—exactly when and how you need it.
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${p.accentBg} flex items-center justify-center flex-shrink-0`}>
                    <p.icon size={17} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-outfit)] font-bold text-[#0F172A] text-sm mb-1">{p.title}</h3>
                    <p className="text-[#374151] text-xs leading-relaxed">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who We Work With & Types of Engagements ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 max-w-2xl"
          >
            <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Who We Work With</p>
            <h2 className="font-[var(--font-outfit)] font-extrabold text-3xl sm:text-4xl text-[#0F172A] mb-4">
              Built for Founders, Growing Teams &amp; Established Organizations
            </h2>
            <p className="text-[#374151] leading-relaxed">
              We help organizations modernize operations, adopt AI, and build custom technology. We partner with founders, leadership teams, and growing organizations that are ready to improve how they operate through technology. While many of our clients are service-based and product-based businesses, our approach is industry-agnostic and tailored to each organization&apos;s unique goals and challenges.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {audiences.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group bg-white rounded-3xl border border-gray-100 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-5 group-hover:bg-[#2563EB] transition-colors duration-300">
                  <a.icon size={20} className="text-[#2563EB] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-[var(--font-outfit)] font-bold text-lg text-[#0F172A] mb-2">{a.title}</h3>
                <p className="text-[#374151] text-sm leading-relaxed">{a.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-[#0B1220] p-8 sm:p-12"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 80% 10%, rgba(124,58,237,0.16) 0%, transparent 55%)" }}
            />
            <div className="relative">
              <p className="text-xs tracking-widest uppercase text-[#60A5FA] font-semibold mb-3">Types of Engagements</p>
              <h3 className="font-[var(--font-outfit)] font-bold text-xl sm:text-2xl text-white mb-8 max-w-lg">
                Whether You&apos;re...
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {engagementTypes.map((e) => (
                  <div
                    key={e.label}
                    className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2563EB]/40 rounded-2xl px-4 py-3.5 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2563EB] transition-colors duration-200">
                      <e.icon size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-white/80 leading-snug">{e.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-sm max-w-xl">
                ...Audax provides the strategy, execution, and ongoing partnership to help you move forward.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How We're Different ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-[#0B1220] p-8 sm:p-12"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.15) 0%, transparent 55%)" }}
            />
            <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-14">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#60A5FA] font-semibold mb-3">How We&apos;re Different</p>
                <h2 className="font-[var(--font-outfit)] font-extrabold text-2xl sm:text-3xl text-white mb-8 leading-snug">
                  We Don&apos;t Just Advise. We Build. We Stay. We Deliver.
                </h2>
                <div className="space-y-6">
                  {differentiators.map((d) => (
                    <div key={d.title} className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <d.icon size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm mb-1">{d.title}</h3>
                        <p className="text-white/50 text-xs leading-relaxed">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-2 border-b border-white/10">
                  <div className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white/40">
                    Traditional Consultants
                  </div>
                  <div className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white bg-gradient-to-r from-[#2563EB]/25 to-[#7C3AED]/25">
                    Audax Ventures
                  </div>
                </div>
                {comparisonRows.map((row, i) => (
                  <div key={row.theirs} className={`grid grid-cols-2 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                    <div className="flex items-center gap-2 px-4 py-3.5 border-r border-white/5">
                      <X size={13} className="text-red-400/70 flex-shrink-0" />
                      <span className="text-white/50 text-xs leading-snug">{row.theirs}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10">
                      <Check size={13} className="text-[#60A5FA] flex-shrink-0" />
                      <span className="text-white text-xs leading-snug font-medium">{row.ours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Our Story</p>
            <h2 className="font-[var(--font-outfit)] font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
              Built by Entrepreneurs. Driven by Results.
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-gray-200" />
            <div className="grid gap-8 lg:grid-cols-5">
              {timeline.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative"
                >
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-[#2563EB]/30 flex items-center justify-center mb-4">
                    <t.icon size={18} className="text-[#2563EB]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-1.5">{t.year}</p>
                  <h3 className="font-[var(--font-outfit)] font-bold text-[#0F172A] text-sm mb-2">{t.title}</h3>
                  <p className="text-[#374151] text-xs leading-relaxed">{t.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted-by stats ── */}
      <section className="py-16 bg-[#F8F9FA] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] tracking-widest uppercase text-[#9CA3AF] font-semibold mb-10">
            Trusted by Innovative Organizations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {trustedStats.map((s) => (
              <div key={s.label}>
                <p className="font-[var(--font-outfit)] font-extrabold text-2xl sm:text-3xl text-[#2563EB] mb-1">{s.value}</p>
                <p className="text-[#374151] text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership Team (hidden for now) ── */}
      {SHOW_LEADERSHIP_TEAM && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 max-w-2xl"
            >
              <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Our Team</p>
              <h2 className="font-[var(--font-outfit)] font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
                Meet the Leadership Team
              </h2>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-10 text-center">
              {leadershipTeam.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <div className="relative rounded-full overflow-hidden w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 bg-[#F8F9FA]">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, 112px"
                    />
                  </div>
                  <h3 className="font-[var(--font-outfit)] font-bold text-[#0F172A] text-sm leading-snug">{m.name}</h3>
                  <p className="text-[#374151] text-xs">{m.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
