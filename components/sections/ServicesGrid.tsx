"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lightbulb, Code2, TrendingUp, ArrowRight, Check } from "lucide-react";

const pillars = [
  {
    phase: "Think",
    icon: Lightbulb,
    title: "AI Leadership",
    description:
      "We work alongside founders and leadership teams to identify opportunities, develop AI strategies, prioritize investments, and create a practical roadmap for adopting AI across the organization.",
    href: "/services/ai-leadership",
    accentBg: "bg-[#0F172A]",
    features: [
      "Fractional Chief AI Officer (CAIO)",
      "AI Strategy & Roadmaps",
      "Executive Advisory",
      "AI Opportunity Assessments",
      "AI Governance & Adoption",
      "Innovation Workshops",
    ],
  },
  {
    phase: "Build",
    icon: Code2,
    title: "Custom Software Development",
    description:
      "Once the strategy is clear, we design and build the technology that powers it. From AI applications and SaaS platforms to internal business systems and modern websites, every solution is built specifically around your business.",
    href: "/services/custom-software-development",
    accentBg: "bg-[#7C3AED]",
    features: [
      "AI Applications",
      "Custom Business Software",
      "SaaS Platforms",
      "Mobile Apps",
      "Web Applications",
      "Websites & Digital Experiences",
    ],
  },
  {
    phase: "Scale",
    icon: TrendingUp,
    title: "Digital Operations",
    description:
      "Technology should continue creating value long after launch. We become your long-term technology partner, helping you improve systems, introduce new capabilities, optimize workflows, and support the next stage of growth.",
    href: "/services/digital-operations",
    accentBg: "bg-[#10B981]",
    features: [
      "Technology Partnership",
      "Product Evolution",
      "Workflow Optimization",
      "AI & Automation Expansion",
      "System Integrations",
      "Ongoing Support & Enhancement",
    ],
  },
];

export default function ServicesGrid() {
  return (
    <section className="relative z-10 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-4">What We Do</p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
            End-to-End AI Leadership &amp; Execution
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8"
            >
              <div className={`w-12 h-12 rounded-2xl ${p.accentBg} flex items-center justify-center mb-6`}>
                <p.icon size={22} className="text-white" />
              </div>

              <p className="text-xs tracking-widest uppercase text-[#2563EB] font-bold mb-2">
                {p.phase}
              </p>
              <h3 className="font-heading font-extrabold text-xl text-[#0F172A] mb-2">
                {p.title}
              </h3>
              <p className="text-[#374151] text-sm leading-relaxed mb-6">
                {p.description}
              </p>

              <div className="space-y-2.5 mb-8 flex-1">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={14} className="text-[#10B981] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#374151] leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href={p.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors self-start"
              >
                Learn More <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
