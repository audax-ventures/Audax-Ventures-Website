"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, LayoutGrid, User, BarChart3, Settings, Compass,
  TrendingUp, Zap,
} from "lucide-react";

// ── Dashboard mockup data ────────────────────────────────────────────────────

const roadmapSteps = ["Discover", "Assess", "Design", "Build", "Deploy", "Optimize"];
const activeStepIndex = 3; // "Build"

const impactMetrics = [
  { label: "Process Efficiency", value: "+37%", trend: "up" as const },
  { label: "Cost Savings", value: "$2.4M", trend: "note" as const, note: "Projected" },
  { label: "Automation Rate", value: "68%", trend: "up" as const, note: "+22% vs last quarter" },
];

const initiatives = [
  { name: "Customer Support AI Assistant", status: "Live", dot: "bg-green-400" },
  { name: "Invoice Processing Automation", status: "In Progress", dot: "bg-blue-400" },
  { name: "Demand Forecasting Model", status: "Testing", dot: "bg-purple-400" },
];

const sidebarIcons = [LayoutGrid, User, BarChart3, Settings, Compass];

function AIDashboardMockup() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <div className="absolute inset-0 bg-[#2563EB]/20 rounded-3xl blur-3xl translate-y-6 scale-90 pointer-events-none" />

      <div className="relative bg-[#0B1220] rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-white">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#080D18] border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 bg-white/5 rounded-md py-1 px-3 text-[10px] text-white/25 text-center max-w-xs mx-auto">
            app.audaxventures.ca/ai-roadmap
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-12 bg-[#080D18] border-r border-white/5 py-4 flex flex-col items-center gap-3 flex-shrink-0">
            {sidebarIcons.map((Icon, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  i === 0 ? "bg-[#2563EB] text-white" : "text-white/20"
                }`}
              >
                <Icon size={15} />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-3 min-w-0">
            <p className="text-white text-xs font-semibold">AI Roadmap</p>

            {/* 6-step stepper */}
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between">
                {roadmapSteps.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${
                          i === activeStepIndex
                            ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/25"
                            : i < activeStepIndex
                            ? "bg-white/25 text-white"
                            : "bg-white/10 text-white/30"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[7px] whitespace-nowrap ${i === activeStepIndex ? "text-white font-semibold" : "text-white/30"}`}>
                        {step}
                      </span>
                    </div>
                    {i < roadmapSteps.length - 1 && (
                      <div className={`h-px flex-1 mx-1 mb-3.5 ${i < activeStepIndex ? "bg-white/25" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Impact */}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/50 text-[9px] font-medium uppercase tracking-wider mb-2">Executive Impact</p>
              <div className="grid grid-cols-3 gap-2">
                {impactMetrics.map((m) => (
                  <div key={m.label} className="bg-white/5 rounded-lg p-2">
                    <p className="text-white/35 text-[8px] mb-1 leading-tight">{m.label}</p>
                    <p className="text-white font-bold text-xs leading-none">{m.value}</p>
                    {m.note && <p className="text-[7px] mt-1 text-green-400">{m.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* ROI + Active Initiatives row */}
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center w-24 flex-shrink-0">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#7C3AED" strokeWidth="3" strokeDasharray="97 100" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-white font-bold text-[10px]">347%</span>
                </div>
                <p className="text-white/40 text-[7px] mt-1">ROI This Year</p>
                <p className="text-green-400 text-[7px]">+85% YoY</p>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 min-w-0">
                <p className="text-white/50 text-[8px] font-medium uppercase tracking-wider mb-1.5">Active Initiatives</p>
                <div className="space-y-1.5">
                  {initiatives.map((a) => (
                    <div key={a.name} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
                      <p className="flex-1 text-[8px] text-white/60 truncate">{a.name}</p>
                      <p className="text-white/30 text-[7px] flex-shrink-0">{a.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4, ease: "backOut" }}
        className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[#059669]">
          <Zap size={14} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#0F172A]">68% Automated</p>
          <p className="text-[9px] text-[#374151]">Across live workflows</p>
        </div>
      </motion.div>

      {/* Floating badge — bottom left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4, ease: "backOut" }}
        className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB]">
          <TrendingUp size={14} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#0F172A]">347% ROI</p>
          <p className="text-[9px] text-[#374151]">This year</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 68%)" }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.18, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute -bottom-48 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 68%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32"
      >
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: copy ── */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-bold tracking-widest uppercase text-[#2563EB] mb-6"
            >
              Think Bigger. Build Better. Scale Smarter.
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-[3.8rem] text-[#0F172A] leading-[1.1] mb-6"
            >
              The AI Strategy Partner That Actually{" "}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                Builds.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#374151] text-lg leading-relaxed mb-10 max-w-xl"
            >
              We define your AI strategy, identify the workflows worth automating, build the agents that run them, measure the results, and keep optimizing — all under one roof.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <Link
                href="https://calendly.com/audax-ventures/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold text-base hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
              >
                Book a Free Strategy Call
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 text-[#0F172A] font-semibold text-base hover:text-[#2563EB] transition-colors"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </motion.div>

          </div>

          {/* ── Right: dashboard mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 48, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="hidden lg:block px-6"
          >
            <AIDashboardMockup />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
