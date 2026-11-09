"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Receipt, LayoutDashboard, MessageCircle } from "lucide-react";
import { impactHighlights } from "@/lib/impact-highlights-data";

const cardIcons: Record<string, typeof Receipt> = {
  "automated-invoice-processing": Receipt,
  "operations-intelligence-platform": LayoutDashboard,
  "customer-support-ai-assistant": MessageCircle,
};

export default function ImpactHighlights() {
  return (
    <section className="py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
        >
          <div>
            <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-4">Real Solutions. Real Results.</p>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
              Impact Across Industries
            </h2>
          </div>
          <Link
            href="/success-stories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#0F172A] transition-colors flex-shrink-0"
          >
            View All Success Stories <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {impactHighlights.map((h, i) => {
            const Icon = cardIcons[h.slug] ?? Receipt;
            return (
              <motion.div
                key={h.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Visual */}
                <div
                  className="relative h-40 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${h.accent} 0%, ${h.accent}CC 100%)` }}
                >
                  <Icon size={40} className="text-white/90" strokeWidth={1.5} />
                  <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                    {h.badge}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading font-extrabold text-lg text-[#0F172A] mb-2">
                    {h.title}
                  </h3>
                  <p className="text-[#374151] text-sm leading-relaxed mb-5 flex-1">{h.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-extrabold text-2xl text-[#0F172A] leading-none">{h.stat}</p>
                      <p className="text-[#9CA3AF] text-xs mt-1">{h.statLabel}</p>
                    </div>
                    <Link
                      href="/success-stories"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] group-hover:gap-2.5 transition-all"
                    >
                      View Success Story <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
