"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ClipboardCheck, Box, Rocket, LineChart, CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    accent: "#2563EB",
    description: "We start by understanding your business, goals, and challenges. Through collaborative discussions, we uncover opportunities where technology, AI, and automation can create measurable business value.",
    activities: ["Business Discovery", "Stakeholder Interviews", "Goal Alignment", "Opportunity Mapping"],
  },
  {
    icon: ClipboardCheck,
    title: "Assess",
    accent: "#4F46E5",
    description: "Next, we evaluate your current processes, systems, and technology to identify inefficiencies, risks, and the highest-impact opportunities for improvement.",
    activities: ["Process Review", "AI Assessment", "Technology Audit", "Gap Analysis"],
  },
  {
    icon: Box,
    title: "Design & Build",
    accent: "#7C3AED",
    description: "With a clear strategy in place, we design and develop the right solution, whether that's custom software, AI workflows, automation, or digital tools tailored to your business.",
    activities: ["Solution Design", "Custom Software Development", "AI Integration", "User Testing"],
  },
  {
    icon: Rocket,
    title: "Launch",
    accent: "#0891B2",
    description: "We implement the solution with minimal disruption, ensuring your team is prepared, your systems are configured correctly, and everything is ready for successful adoption.",
    activities: ["System Deployment", "Team Training", "Go-Live Support", "Performance Monitoring"],
  },
  {
    icon: LineChart,
    title: "Optimize",
    accent: "#10B981",
    description: "Technology should continuously evolve alongside your business. We provide ongoing improvements, support, and strategic guidance to maximize long-term value and ROI.",
    activities: ["Performance Review", "Continuous Improvement", "Feature Enhancements", "Strategic Advisory"],
  },
];

export default function HomeProcessSection() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-2xl"
        >
          <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-4">Our Approach</p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F172A] mb-4">
            A Clear Path From Strategy to Impact
          </h2>
          <p className="text-[#374151] text-sm leading-relaxed">
            Click a stage to see how we take you from idea to real-world results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-start">

          {/* ── Vertical timeline stepper ── */}
          <div className="relative">
            <div className="absolute left-[21px] top-3 bottom-3 w-px bg-gray-150" style={{ backgroundColor: "#E5E7EB" }} />
            <div className="flex flex-col">
              {steps.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s.title}
                    onClick={() => setActive(i)}
                    className="group relative flex items-center gap-4 py-3.5 text-left"
                  >
                    <div
                      className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? s.accent : "#FFFFFF",
                        borderColor: isActive ? s.accent : "#E5E7EB",
                      }}
                    >
                      <s.icon
                        size={18}
                        className="transition-colors duration-300"
                        style={{ color: isActive ? "#FFFFFF" : "#9CA3AF" }}
                      />
                    </div>
                    <span
                      className={`font-heading font-bold text-lg transition-colors duration-300 ${
                        isActive ? "text-[#0F172A]" : "text-[#B0B5BF] group-hover:text-[#374151]"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Detail panel ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden rounded-3xl border border-gray-100 bg-[#FAFAFA] p-8 sm:p-12"
            >
              {/* Faint numeral watermark */}
              <span
                aria-hidden
                className="pointer-events-none select-none absolute -top-6 right-4 font-heading font-extrabold text-[160px] leading-none"
                style={{ color: "#0F172A", opacity: 0.035 }}
              >
                0{active + 1}
              </span>

              <div className="relative max-w-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${step.accent}14` }}
                  >
                    <step.icon size={19} style={{ color: step.accent }} />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-[#0F172A]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[#374151] leading-relaxed mb-8">{step.description}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Key Activities</p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {step.activities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-[#374151]">
                      <CheckCircle2 size={15} style={{ color: step.accent }} className="flex-shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
