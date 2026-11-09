"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";

export default function CTABanner({
  heading = "Ready to Build the Future of Your Business?",
  subtext = "Book a free strategy call with our team and discover how AI leadership can drive real results.",
  buttonText = "Book a Free Strategy Call",
}: {
  heading?: string;
  subtext?: string;
  buttonText?: string;
}) {
  return (
    <section className="relative bg-[#0B1220] py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.18) 0%, transparent 55%), radial-gradient(circle at 70% 70%, rgba(37,99,235,0.16) 0%, transparent 55%)" }}
      />
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
        >
          <Rocket size={22} className="text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4"
        >
          {heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/55 text-lg mb-8"
        >
          {subtext}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.04 }}
        >
          <Link
            href="https://calendly.com/audax-ventures/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#0F172A] font-bold text-base hover:bg-gray-100 transition-colors shadow-lg"
          >
            {buttonText}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
