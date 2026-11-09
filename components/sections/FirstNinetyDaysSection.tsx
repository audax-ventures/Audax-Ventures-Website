"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check } from "lucide-react";
import type { ServicePageData } from "@/lib/service-pages-data";
import { FadeIn } from "@/components/ui/FadeIn";
import { SECTION_CREAM_BG, headerAccentClass, SignatureLine } from "./ServicePageVisuals";

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

// Mirrors the sitewide Think/Build/Scale phase palette — this 90-day plan
// moves through the same strategy → build → optimize arc, so each stage
// borrows that phase's color instead of reusing one flat accent.
const stageAccents = ["#2563EB", "#7C3AED", "#10B981"];

export default function FirstNinetyDaysSection({
  data, accent,
}: {
  data: NonNullable<ServicePageData["firstNinetyDays"]>;
  accent: string;
}) {
  const [active, setActive] = useState(0);
  const stage = data.stages[active];
  const stageAccent = stageAccents[active] ?? accent;

  return (
    <section className="py-20 relative overflow-hidden" style={{ backgroundColor: SECTION_CREAM_BG }}>
      <SignatureLine variant={2} color={`${accent}0D`} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-4xl mb-14">
          <SectionEyebrow icon={Calendar} label={data.eyebrow} accent={accent} />
          <p className="text-sm font-semibold mb-4 text-pretty" style={{ color: accent }}>{data.permanentNote}</p>
          <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-4 leading-snug ${headerAccentClass}`} style={{ borderColor: accent }}>
            {data.heading}
          </h2>
          <p className="text-[#374151] leading-relaxed text-pretty">{data.subhead}</p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-start">

          {/* ── Vertical stage stepper ── */}
          <FadeIn delay={0.08} className="relative">
            <div
              className="absolute left-[21px] top-3 bottom-3 w-px"
              style={{ background: "linear-gradient(180deg, #2563EB4D 0%, #7C3AED4D 50%, #10B9814D 100%)" }}
            />
            <div className="flex flex-col">
              {data.stages.map((s, i) => {
                const isActive = i === active;
                const sAccent = stageAccents[i] ?? accent;
                return (
                  <button
                    key={s.title}
                    onClick={() => setActive(i)}
                    className={`group relative flex items-center gap-4 py-3 px-3 -mx-3 text-left rounded-2xl transition-colors duration-300 ${!isActive ? "hover:bg-black/[0.02]" : ""}`}
                    style={{ backgroundColor: isActive ? `${sAccent}0D` : undefined }}
                  >
                    <div
                      className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 font-heading font-extrabold text-sm transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? sAccent : "#FFFFFF",
                        borderColor: isActive ? sAccent : "#E5E7EB",
                        color: isActive ? "#FFFFFF" : "#9CA3AF",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-0.5 transition-colors duration-300"
                        style={{ color: isActive ? sAccent : "#9CA3AF" }}
                      >
                        {s.range}
                      </p>
                      <p className={`font-heading font-bold text-base leading-snug transition-colors duration-300 ${isActive ? "text-[#0F172A]" : "text-[#B0B5BF] group-hover:text-[#374151]"}`}>
                        {s.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </FadeIn>

          {/* ── Detail panel ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 sm:p-12"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 85% 0%, ${stageAccent}14 0%, transparent 55%)` }}
              />
              <span
                aria-hidden
                className="pointer-events-none select-none absolute -top-6 right-4 font-heading font-extrabold text-[160px] leading-none"
                style={{ color: stageAccent, opacity: 0.05 }}
              >
                0{active + 1}
              </span>

              <div className="relative max-w-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stageAccent}14` }}>
                    <span className="font-heading font-extrabold text-sm" style={{ color: stageAccent }}>{active + 1}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: stageAccent }}>{stage.range}</p>
                    <h3 className="font-heading font-extrabold text-2xl text-[#0F172A]">{stage.title}</h3>
                  </div>
                </div>
                <p className="text-[#374151] leading-relaxed mb-8">{stage.description}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Typically Includes:</p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {stage.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-[#374151]">
                      <Check size={15} style={{ color: stageAccent }} className="flex-shrink-0 mt-0.5" />
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-sm text-[#374151] leading-relaxed mt-8 max-w-4xl text-pretty">{data.footerNote}</p>
      </div>
    </section>
  );
}
