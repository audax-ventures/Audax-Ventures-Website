"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "[PLACEHOLDER]", label: "Years Operating" },
  { value: "[PLACEHOLDER]", label: "Engagements Delivered" },
  { value: "[PLACEHOLDER]", label: "Avg. Time to Roadmap" },
  { value: "[PLACEHOLDER]", label: "Industries Served" },
];

export default function ProofBar() {
  return (
    <section className="bg-white py-12 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#2E5F8A] mb-1 tabular-nums">
                {s.value}
              </div>
              <div className="text-[#374151] text-sm font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
