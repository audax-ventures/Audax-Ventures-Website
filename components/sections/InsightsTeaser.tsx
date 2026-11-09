"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const articles = [
  { title: "[PLACEHOLDER article title]", excerpt: "[PLACEHOLDER excerpt]", category: "[PLACEHOLDER]" },
  { title: "[PLACEHOLDER article title]", excerpt: "[PLACEHOLDER excerpt]", category: "[PLACEHOLDER]" },
  { title: "[PLACEHOLDER article title]", excerpt: "[PLACEHOLDER excerpt]", category: "[PLACEHOLDER]" },
];

export default function InsightsTeaser() {
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
            <p className="text-xs tracking-widest uppercase text-[#2E5F8A] font-semibold mb-4">Insights</p>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A2E]">
              AI Leadership &amp; Software Insights
            </h2>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2E5F8A] hover:text-[#3A7BD5] transition-colors flex-shrink-0"
          >
            View all insights <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Link
                href="/insights"
                className="group block bg-white rounded-3xl border border-gray-100 p-7 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-xs font-semibold text-[#2E5F8A] bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {a.category}
                </span>
                <h3 className="font-heading font-bold text-[#1A1A2E] text-base leading-snug mt-4 mb-2 group-hover:text-[#2E5F8A] transition-colors">
                  {a.title}
                </h3>
                <p className="text-[#374151] text-sm leading-relaxed">{a.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
