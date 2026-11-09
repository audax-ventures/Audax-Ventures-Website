"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Cinematic above-the-fold hero with staggered entrance.
 *
 * - Eyebrow fades in first (delay 0).
 * - Headline reveals word-by-word with a 50ms stagger.
 *   Pre-coloured spans inside the headline (e.g. `<span class="text-accent">…</span>`)
 *   are preserved — only the wrapper words animate.
 * - Subhead fades in after the headline finishes.
 * - prefers-reduced-motion: renders the final state, no animation.
 *
 * Splits the headline by whitespace, which is robust enough for marketing
 * copy. Coloured spans should be self-contained words; the wrapper wraps
 * each whitespace-split chunk in its own animated <span>.
 */

const blockVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const wordContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045 },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function AnimatedHero({
  eyebrow,
  headline,
  subhead,
}: {
  eyebrow: ReactNode;
  headline: ReactNode[]; // Array of word-or-colored-span chunks
  subhead: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div>
        <div className="font-[family-name:var(--font-jetbrains-mono),ui-monospace,SFMono-Regular,Menlo,monospace] text-xs font-medium tracking-[0.12em] uppercase text-[var(--color-fg-muted)] mb-10">
          {eyebrow}
        </div>
        <h1 className="font-heading text-[clamp(3rem,7.5vw,7.5rem)] font-bold leading-[0.95] tracking-tight text-[var(--color-fg)] max-w-[16ch] mb-10">
          {headline.map((chunk, i) => (
            <span key={i}>
              {chunk}
              {i < headline.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-[var(--color-fg-muted)] max-w-[52ch]">
          {subhead}
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={blockVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-[family-name:var(--font-jetbrains-mono),ui-monospace,SFMono-Regular,Menlo,monospace] text-xs font-medium tracking-[0.12em] uppercase text-[var(--color-fg-muted)] mb-10"
      >
        {eyebrow}
      </motion.div>

      <motion.h1
        initial="hidden"
        animate="visible"
        variants={wordContainer}
        transition={{ delayChildren: 0.15 }}
        className="font-heading text-[clamp(3rem,7.5vw,7.5rem)] font-bold leading-[0.95] tracking-tight text-[var(--color-fg)] max-w-[16ch] mb-10"
      >
        {headline.map((chunk, i) => (
          <span key={i} className="inline-block overflow-hidden align-baseline pb-[0.05em]">
            <motion.span
              variants={wordVariants}
              className="inline-block"
            >
              {chunk}
            </motion.span>
            {i < headline.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.h1>

      <motion.p
        initial="hidden"
        animate="visible"
        variants={blockVariants}
        transition={{
          duration: 0.6,
          delay: 0.15 + 0.045 * headline.length + 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="text-xl md:text-2xl leading-relaxed text-[var(--color-fg-muted)] max-w-[52ch]"
      >
        {subhead}
      </motion.p>
    </>
  );
}
