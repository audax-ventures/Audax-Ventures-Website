"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  { quote: "[PLACEHOLDER quote]", name: "[PLACEHOLDER name]", title: "[PLACEHOLDER title, company]" },
  { quote: "[PLACEHOLDER quote]", name: "[PLACEHOLDER name]", title: "[PLACEHOLDER title, company]" },
  { quote: "[PLACEHOLDER quote]", name: "[PLACEHOLDER name]", title: "[PLACEHOLDER title, company]" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-widest uppercase text-[#2E5F8A] font-semibold mb-4">What Clients Say</p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A2E]">
            Trusted by Leadership Teams
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-[#F8F9FA] rounded-3xl border border-gray-100 p-8 flex flex-col"
            >
              <Quote className="text-[#2E5F8A]/25 mb-4" size={32} />
              <p className="text-[#374151] text-sm leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-heading font-bold text-[#1A1A2E] text-sm">{t.name}</p>
                <p className="text-[#9CA3AF] text-xs">{t.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
