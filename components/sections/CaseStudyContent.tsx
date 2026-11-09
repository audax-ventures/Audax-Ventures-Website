"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, Compass, TrendingUp, Quote, Sparkles } from "lucide-react";
import type { CaseStudy, CaseStudyService } from "@/lib/case-studies-data";

const serviceAccent: Record<CaseStudyService, string> = {
  "AI Leadership": "#2563EB",
  "Custom Software Development": "#7C3AED",
  "Digital Operations": "#10B981",
};

const serviceHref: Record<CaseStudyService, string> = {
  "AI Leadership": "/services/ai-leadership",
  "Custom Software Development": "/services/custom-software-development",
  "Digital Operations": "/services/digital-operations",
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

export default function CaseStudyContent({ study, otherStudies }: { study: CaseStudy; otherStudies: CaseStudy[] }) {
  const accent = serviceAccent[study.services[0]];
  const statResults = study.results.filter((r) => r.stat);
  const plainResults = study.results.filter((r) => !r.stat);

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}14 0%, transparent 68%)` }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] mb-8">
            <Link href="/" className="hover:text-[#374151] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/success-stories" className="hover:text-[#374151] transition-colors">Client Success Stories</Link>
            <span>/</span>
            <span className="text-[#374151]">{study.industry}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full" style={{ color: accent, backgroundColor: `${accent}14` }}>
              {study.industry}
            </span>
            {study.tag && (
              <span className="inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full text-[#7C3AED] bg-purple-50">
                <Sparkles size={10} className="fill-current" /> {study.tag}
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F172A] mb-6 leading-tight"
          >
            {study.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-10"
          >
            {study.services.map((s) => (
              <Link
                key={s}
                href={serviceHref[s]}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors hover:opacity-80"
                style={{ borderColor: `${serviceAccent[s]}4D`, color: serviceAccent[s] }}
              >
                {s}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a
              href="https://calendly.com/audax-ventures/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
            >
              Book a Discovery Call <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── The Challenge ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <SectionEyebrow icon={AlertTriangle} label="The Challenge" accent={accent} />
            <div className="space-y-4">
              {study.challenge.map((p, i) => (
                <p key={i} className="text-[#374151] leading-relaxed">{p}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Our Approach ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <SectionEyebrow icon={Compass} label="Our Approach" accent={accent} />
            {study.approachIntro?.map((p, i) => (
              <p key={i} className="text-[#374151] leading-relaxed mb-2">{p}</p>
            ))}
            <div className="space-y-3 mt-6">
              {study.approach.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-heading font-bold text-xs"
                    style={{ backgroundColor: `${accent}14`, color: accent }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[#374151] leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <SectionEyebrow icon={TrendingUp} label="Results" accent={accent} />
          </motion.div>

          {statResults.length > 0 && (
            <div className={`grid gap-6 ${plainResults.length > 0 ? "mb-8" : ""} sm:grid-cols-2 lg:grid-cols-4`}>
              {statResults.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
                >
                  <p className="font-heading font-extrabold text-2xl sm:text-3xl mb-2 leading-none" style={{ color: accent }}>
                    {r.stat}
                  </p>
                  <p className="text-[#374151] text-sm leading-snug">{r.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {plainResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`grid sm:grid-cols-2 gap-x-8 gap-y-3 ${statResults.length > 0 ? "max-w-3xl" : ""}`}
            >
              {plainResults.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white rounded-xl border border-gray-100 px-4 py-3.5">
                  <TrendingUp size={15} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span className="text-sm text-[#374151] leading-snug">{r.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Key Takeaway ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden bg-[#0B1220] p-8 sm:p-12"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 10%, ${accent}29 0%, transparent 55%)` }}
            />
            <div className="relative">
              <Quote size={28} className="text-white/30 mb-5" />
              <p className="text-xs tracking-widest uppercase font-semibold mb-4" style={{ color: "#60A5FA" }}>Key Takeaway</p>
              <p className="text-white text-lg sm:text-xl leading-relaxed font-heading font-medium">
                {study.keyTakeaway}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── More Success Stories ── */}
      {otherStudies.length > 0 && (
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading font-extrabold text-2xl text-[#0F172A] mb-8">More Success Stories</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {otherStudies.map((c) => (
                <Link
                  key={c.slug}
                  href={`/success-stories/${c.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-[#2563EB] bg-blue-50 inline-flex px-2.5 py-0.5 rounded-full mb-3">
                    {c.industry}
                  </p>
                  <h3 className="font-heading font-bold text-[#0F172A] text-base leading-snug group-hover:text-[#2563EB] transition-colors">
                    {c.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
