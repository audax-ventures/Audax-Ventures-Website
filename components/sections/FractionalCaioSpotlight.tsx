"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Quote, ArrowRight } from "lucide-react";

const credentials = [
  "President, Audax Ventures",
  "10+ Years in Strategy, Operations & Technology",
  "Board Member & Industry Advisor",
  "Entrepreneur with Successful Exits",
];

export default function FractionalCaioSpotlight() {
  return (
    <section className="py-24 bg-white overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-10"
        >
          Meet The Audax President &amp; Fractional CAIO
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8 lg:gap-10 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5] w-full max-w-xs mx-auto lg:mx-0"
          >
            <Image
              src="/team/joshua-zaporzan.avif"
              alt="Joshua Zaporzan"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 60vw, 280px"
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="font-heading font-extrabold text-3xl text-[#0F172A] mb-3">
              Joshua Zaporzan
            </h2>
            <p className="text-[#374151] leading-relaxed mb-6">
              President of Audax Ventures, entrepreneur, and AI strategist helping business owners turn ambitious ideas into practical technology. Joshua combines executive-level strategy with hands-on software development to help organizations adopt AI, build custom software, and create lasting competitive advantages.
            </p>
            <div className="space-y-2.5 mb-6">
              {credentials.map((c) => (
                <div key={c} className="flex items-center gap-2.5">
                  <Briefcase size={14} className="text-[#2563EB] flex-shrink-0" />
                  <span className="text-sm text-[#374151]">{c}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/about/joshua-zaporzan"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors"
              >
                Read Full Bio <ArrowRight size={14} />
              </Link>
              <a
                href="https://www.linkedin.com/in/joshua-zaporzan/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#374151] hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a
                href="mailto:joshua@audaxventures.ca"
                aria-label="Email"
                className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#374151] hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6l-10 7L2 6"/><path d="M2 6h20v12H2z"/></svg>
              </a>
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#F8F9FA] rounded-3xl p-7"
          >
            <Quote className="text-[#2563EB]/30 mb-3" size={28} />
            <p className="text-[#0F172A] text-base font-medium leading-relaxed mb-4">
              &ldquo;AI won&apos;t replace great businesses. Businesses that learn to use AI will replace those that don&apos;t. Our role is to help you become one of them.&rdquo;
            </p>
            <p className="text-[#374151] text-sm">— Joshua Zaporzan</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
