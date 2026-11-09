import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Building2, Zap, ShieldCheck, Link2 } from "lucide-react";
import CTABanner from "@/components/layout/CTABanner";
import { mainIndustries, otherIndustries } from "@/lib/industries-data";
import { defaultOgImage } from "@/lib/og-image";

export const metadata: Metadata = {
  title: "Industries We Serve | Audax Ventures",
  description:
    "Custom software development for healthcare, manufacturing, real estate, fintech, retail, education, hospitality, legal, logistics, non-profit, and SaaS companies across Canada.",
  alternates: { canonical: "https://audaxventures.ca/industries" },
  openGraph: {
    images: [defaultOgImage],
    title: "Industries We Serve | Audax Ventures",
    description:
      "Custom software development across 11 industries in Canada. From healthcare compliance to logistics visibility — we build software that fits your industry's specific constraints.",
    url: "https://audaxventures.ca/industries",
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://audaxventures.ca" },
    { "@type": "ListItem", position: 2, name: "Industries", item: "https://audaxventures.ca/industries" },
  ],
};

const whyAudax = [
  {
    icon: Building2,
    title: "Industry context, not just code",
    description:
      "We study the operational realities of each industry we serve — the compliance constraints, workflow patterns, and data structures that shape what good software looks like in that context.",
  },
  {
    icon: Zap,
    title: "8–16 week delivery timelines",
    description:
      "Our production-track process delivers working software in weeks, not quarters — without cutting corners on architecture, security, or compliance.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-first architecture",
    description:
      "Privacy, security, and regulatory requirements are architecture decisions, not afterthoughts. We build compliant systems before the first line of feature code.",
  },
  {
    icon: Link2,
    title: "Integration over replacement",
    description:
      "We build software that works with your existing systems — EHRs, ERPs, PLCs, payment processors — rather than demanding a disruptive rip-and-replace migration.",
  },
];

export default function IndustriesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#F8F9FA] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2E5F8A]/10 text-[#2E5F8A] text-xs font-semibold mb-6 uppercase tracking-widest">
            Industries We Serve
          </div>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1A1A2E] mb-6 leading-tight">
            Software Built for{" "}
            <span className="text-[#2E5F8A]">Your Industry</span>
          </h1>
          <p className="text-[#374151] text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Off-the-shelf software solves generic problems. We build around the real rules, workflows, and data you actually deal with in your industry — not a one-size-fits-all template.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="https://calendly.com/audax-ventures/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#2E5F8A] text-white font-bold hover:bg-[#3A7BD5] transition-colors"
            >
              Book a Free Strategy Call <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[#2E5F8A] text-[#2E5F8A] font-bold hover:bg-[#2E5F8A] hover:text-white transition-colors"
            >
              Tell Us About Your Project
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main Industries ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#2E5F8A] mb-3">Primary Focus</p>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A2E]">
              Our Main Industries
            </h2>
            <p className="text-[#374151] mt-4 max-w-xl mx-auto">
              Where our deepest domain expertise and most extensive delivery track record lives.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {mainIndustries.map((industry, i) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#2E5F8A] hover:shadow-xl hover:shadow-[#2E5F8A]/8 transition-all duration-300"
              >
                {/* Number */}
                <span className="absolute top-6 right-8 text-5xl font-extrabold text-[#F0F4F8] font-heading select-none group-hover:text-[#2E5F8A]/10 transition-colors">
                  0{i + 1}
                </span>

                <div className="text-4xl mb-5">{industry.icon}</div>
                <h3 className="font-heading font-extrabold text-xl text-[#1A1A2E] mb-3 group-hover:text-[#2E5F8A] transition-colors">
                  {industry.title}
                </h3>
                <p className="text-[#374151] text-sm leading-relaxed mb-6">{industry.tagline}</p>

                {/* Solutions preview */}
                <div className="space-y-2 mb-8">
                  {industry.solutions.slice(0, 3).map((sol) => (
                    <div key={sol.title} className="flex items-center gap-2 text-sm text-[#374151]">
                      <CheckCircle2 size={14} className="text-[#2E5F8A] flex-shrink-0" />
                      {sol.title}
                    </div>
                  ))}
                  {industry.solutions.length > 3 && (
                    <div className="text-xs text-[#374151] pl-5">
                      +{industry.solutions.length - 3} more solutions
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-[#2E5F8A] group-hover:gap-3 transition-all">
                  Explore {industry.title} <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Industries Grid ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#374151] mb-3">Full Coverage</p>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A2E]">
              All Industries
            </h2>
            <p className="text-[#374151] mt-4 max-w-xl mx-auto">
              Deep domain knowledge across every vertical we serve — with purpose-built solutions for each industry&apos;s unique constraints.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {otherIndustries.map((industry) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#2E5F8A] hover:shadow-lg hover:shadow-[#2E5F8A]/6 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{industry.icon}</div>
                <h3 className="font-heading font-bold text-[#1A1A2E] mb-2 group-hover:text-[#2E5F8A] transition-colors text-sm leading-snug">
                  {industry.title}
                </h3>
                <p className="text-[#374151] text-xs leading-relaxed mb-4 line-clamp-2">{industry.tagline}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E5F8A] group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Audax ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#2E5F8A] mb-3">What Sets Us Apart</p>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A2E]">
              Why Industry Leaders Choose Audax
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyAudax.map((item) => (
              <div key={item.title} className="text-center">
                <item.icon size={32} className="mx-auto mb-4 text-[#2E5F8A]" strokeWidth={1.75} />
                <h3 className="font-heading font-bold text-[#1A1A2E] mb-3 text-base">{item.title}</h3>
                <p className="text-[#374151] text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-16 bg-[#2E5F8A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "11", label: "Industries Served" },
              { stat: "50+", label: "Projects Delivered" },
              { stat: "8–16 wks", label: "Typical Time to MVP" },
              { stat: "98%", label: "Client Satisfaction" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-heading font-extrabold text-4xl text-white mb-2">{s.stat}</div>
                <div className="text-blue-200 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
