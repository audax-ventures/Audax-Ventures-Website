"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutAudaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative z-10 pt-24 pb-0">
      {/* Thread marker */}
      <div className="hidden lg:block absolute left-8 top-14 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FAFAF8] border-2 border-[#2E5F8A]/50 z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — matches the "How We Help" treatment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-widest uppercase text-[#2E5F8A] font-semibold mb-4">About Audax</p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A2E]">
            Strategy That Ships
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* ── Left: copy — slides in from the left ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          >
            <p className="text-[#374151] text-lg leading-relaxed">
              Most AI advisory stops at the roadmap. Audax Ventures pairs executive-level Fractional Chief AI Officer leadership with an in-house development team — so the strategy we set is the same team that builds it. No handoff to a separate vendor, no slide deck that never becomes software. Just a single accountable partner from opportunity assessment through shipped product.
            </p>
          </motion.div>

          {/* ── Right: photo — slides in from the right, drifts gently on scroll ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
            style={{ y: photoY }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5] max-w-md mx-auto lg:mx-0">
              <Image
                src="/about-audax.png"
                alt="Audax Ventures advisor reviewing AI-driven business performance data with a client"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 480px"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
