import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lightbulb, Code2, TrendingUp, Check } from "lucide-react";
import { servicePagesData } from "@/lib/service-pages-data";
import { defaultOgImage } from "@/lib/og-image";

export const metadata: Metadata = {
  title: "Services | Audax Ventures",
  description:
    "AI Leadership, Custom Software Development, and Digital Operations — the three ways Audax helps organizations think bigger, build better, and scale smarter.",
  alternates: { canonical: "https://audaxventures.ca/services" },
  openGraph: {
    images: [defaultOgImage],
    title: "Services | Audax Ventures",
    description:
      "AI Leadership, Custom Software Development, and Digital Operations — the three ways Audax helps organizations think bigger, build better, and scale smarter.",
    url: "https://audaxventures.ca/services",
  },
};

const icons = { Think: Lightbulb, Build: Code2, Scale: TrendingUp } as const;
const accentBg = { Think: "bg-[#2563EB]", Build: "bg-[#7C3AED]", Scale: "bg-[#10B981]" } as const;

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-[#2563EB] mb-6">
            Think Bigger. Build Better. Scale Smarter.
          </p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-6 leading-tight">
            One Partner From Strategy Through Execution
          </h1>
          <p className="text-[#374151] text-lg leading-relaxed max-w-2xl mx-auto">
            Audax helps organizations transform how they operate through AI leadership, custom software, and long-term technology partnership.
          </p>
        </div>
      </section>

      {/* ── 3 Service Cards ── */}
      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {servicePagesData.map((s) => {
              const Icon = icons[s.phase];
              const previewItems = s.whatWeDeliver?.items ?? s.howWeHelp.services;
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8"
                >
                  <div className={`w-12 h-12 rounded-2xl ${accentBg[s.phase]} flex items-center justify-center mb-6`}>
                    <Icon size={22} className="text-white" />
                  </div>

                  <p className="text-xs tracking-widest uppercase text-[#2563EB] font-bold mb-2">{s.phase}</p>
                  <h2 className="font-heading font-extrabold text-xl text-[#0F172A] mb-2">{s.title}</h2>
                  <p className="text-[#374151] text-sm leading-relaxed mb-6">{s.hero.body}</p>

                  <div className="space-y-2.5 mb-8 flex-1">
                    {previewItems.slice(0, 4).map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <Check size={14} className="text-[#10B981] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#374151]">{item}</span>
                      </div>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors self-start">
                    Learn More <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Not sure? CTA ── */}
      <section className="py-20 bg-[#F8F9FA] border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-4">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-[#374151] leading-relaxed mb-8">
            Book a free 30-minute call. We&apos;ll listen to what you&apos;re building, ask the right questions, and tell you exactly where to start — no pitch, no pressure.
          </p>
          <Link
            href="https://calendly.com/audax-ventures/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-bold hover:bg-[#1E293B] transition-colors"
          >
            Book a Free Strategy Call <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
