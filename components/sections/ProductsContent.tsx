"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, ShieldCheck, Zap, Lock, Briefcase,
  LayoutDashboard, MessageCircle, Sparkles, CheckCircle2,
} from "lucide-react";
import CTABanner from "@/components/layout/CTABanner";
import { productsData, withUtm, type ProductData } from "@/lib/products-data";

const valueProps = [
  { icon: ShieldCheck, title: "Built From Real Problems", desc: "Every product solves a pain we faced — or our clients did." },
  { icon: Zap, title: "Ready to Use", desc: "Live, tested, and continuously improved with real users." },
  { icon: Lock, title: "Secure & Reliable", desc: "Enterprise-grade security and privacy built in." },
];

const productIcons: Record<string, React.ElementType> = {
  Verclara: LayoutDashboard,
  Intuitina: MessageCircle,
};

function HeroMockup() {
  const featured = productsData[0];
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <div className="absolute inset-0 bg-[#2563EB]/20 rounded-3xl blur-3xl translate-y-6 scale-90 pointer-events-none" />

      <div className="relative bg-[#0B1220] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#080D18] border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 bg-white/5 rounded-md py-1 px-3 text-[10px] text-white/25 text-center max-w-xs mx-auto">
            {new URL(featured.url).hostname.replace("www.", "")}
          </div>
        </div>
        {featured.screenshot && (
          <div className="relative aspect-[16/10]">
            <Image src={featured.screenshot} alt={`${featured.name} product screenshot`} fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 560px" priority />
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4, ease: "backOut" }}
        className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[#059669]">
          <CheckCircle2 size={14} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#0F172A]">{productsData.length} Live Products</p>
          <p className="text-[9px] text-[#374151]">Available today</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4, ease: "backOut" }}
        className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB]">
          <Sparkles size={14} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#0F172A]">Built by Audax</p>
          <p className="text-[9px] text-[#374151]">Real products, real use</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductScreenshotFrame({ product }: { product: ProductData }) {
  if (product.screenshot) {
    return (
      <div className="relative w-full md:w-[420px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-lg bg-black/20">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-black/20 border-b border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="flex-1 text-center text-[10px] text-white/35 truncate">
            {new URL(product.url).hostname.replace("www.", "")}
          </span>
        </div>
        <div className="relative aspect-[16/10]">
          <Image
            src={product.screenshot}
            alt={`${product.name} product screenshot`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 420px"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full md:w-[420px] aspect-[16/10] flex-shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-lg bg-[#0D1526]">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#080F1C] border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
      </div>
      <div className="absolute inset-0 top-9 flex flex-col items-center justify-center gap-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-extrabold text-2xl text-white"
          style={{ backgroundColor: product.accentColor }}
        >
          {product.name.charAt(0)}
        </div>
        <p className="text-white/30 text-xs font-medium">Screenshot coming soon</p>
      </div>
    </div>
  );
}

export default function ProductsContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-20 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #2563EB14 0%, transparent 68%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center mb-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-bold tracking-widest uppercase text-[#2563EB] mb-5"
              >
                Products
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-6 leading-tight"
              >
                Software Products You Can{" "}
                <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                  Go Use
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14 }}
                className="text-[#374151] text-lg leading-relaxed mb-4"
              >
                Across enough client engagements, we kept hearing the same problems come up again and again — so instead of solving them one project at a time, we built products to solve them for good.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="text-[#374151] text-lg leading-relaxed mb-10"
              >
                These products are live and available to try or purchase today.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              >
                {valueProps.map((v) => (
                  <div key={v.title}>
                    <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-3">
                      <v.icon size={16} className="text-[#2563EB]" />
                    </div>
                    <p className="font-heading font-bold text-sm text-[#0F172A] mb-1 leading-snug">{v.title}</p>
                    <p className="text-[#374151] text-xs leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 48, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="hidden lg:block px-6"
            >
              <HeroMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Product cards ── */}
      <section className="pb-20 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-widest uppercase text-[#2563EB] text-center mb-8"
          >
            Our Products
          </motion.p>

          <div className="flex flex-col gap-6">
            {productsData.map((product, i) => {
              const light = product.textColor === "light";
              const Icon = productIcons[product.name] ?? LayoutDashboard;
              const url = withUtm(product.url, product.name);
              return (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ background: product.gradient }}
                  className={`rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 md:items-center ${
                    light ? "border border-white/10" : "border border-black/5"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${product.accentColor}${light ? "26" : "1A"}` }}
                      >
                        <Icon size={16} style={{ color: light ? "#fff" : product.accentColor }} />
                      </div>
                      <h3 className={`font-heading font-extrabold text-xl ${light ? "text-white" : "text-[#0F172A]"}`}>
                        {product.name}
                      </h3>
                    </div>
                    <p
                      className="text-xs font-bold tracking-widest uppercase mb-4"
                      style={{ color: light ? `${product.accentColor}` : product.accentColor }}
                    >
                      {product.category}
                    </p>
                    <h4 className={`font-heading font-extrabold text-2xl leading-snug mb-3 ${light ? "text-white" : "text-[#0F172A]"}`}>
                      {product.headline}
                    </h4>
                    <p className={`text-base leading-relaxed mb-3 ${light ? "text-white/70" : "text-[#374151]"}`}>
                      {product.description}
                    </p>
                    {product.note && (
                      <p className={`text-xs italic leading-relaxed mb-5 ${light ? "text-white/40" : "text-[#374151]"}`}>
                        {product.note}
                      </p>
                    )}
                    <div className={`flex items-center gap-5 ${product.note ? "" : "mt-5"}`}>
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-transform hover:scale-[1.03]"
                        style={{ backgroundColor: product.accentColor }}
                      >
                        Explore {product.name} <ArrowRight size={14} />
                      </Link>
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                          light ? "text-white/70 hover:text-white" : "text-[#374151] hover:text-[#0F172A]"
                        }`}
                      >
                        Learn More <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>

                  <ProductScreenshotFrame product={product} />
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#2563EB]/10 items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="font-heading font-bold text-[#0F172A] text-sm">Want to see how we build these?</p>
                <p className="text-[#374151] text-sm">Explore our client work and success stories.</p>
              </div>
            </div>
            <Link
              href="/success-stories"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#0F172A] transition-colors flex-shrink-0"
            >
              See Our Client Work <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      <CTABanner
        heading="Have a Product Idea of Your Own?"
        subtext="Book a free strategy call and let's talk about what you're building."
      />
    </>
  );
}
