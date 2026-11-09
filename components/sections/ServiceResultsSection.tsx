import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { ServicePageData } from "@/lib/service-pages-data";
import { getCaseStudyBySlug } from "@/lib/case-studies-data";
import { FadeIn } from "@/components/ui/FadeIn";
import { SECTION_CREAM_BG, headerAccentClass } from "./ServicePageVisuals";

function SectionEyebrow({ icon: Icon, label, accent }: { icon: React.ElementType; label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}14` }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</p>
    </div>
  );
}

/**
 * Every highlight below is drawn from a real, already-published case study
 * in lib/case-studies-data.ts (client identities are anonymized there the
 * same way — by industry, never by name). Nothing here is a fabricated
 * quote or an invented persona; statIndex just picks which real result to
 * feature as the headline number for that card. statLabel is an optional,
 * shorter restatement of that same real result's label (some of the
 * original labels run long and wrap unevenly in a compact card) — the
 * number itself is always the source data's, never invented.
 */
type FeaturedResult = { slug: string; statIndex: number; statLabel?: string; highlight: string };

const featuredResultsByPhase: Record<ServicePageData["phase"], FeaturedResult[]> = {
  Think: [
    {
      slug: "healthtech-founder-scaling",
      statIndex: 0,
      highlight:
        "A non-technical HealthTech founder needed executive-level guidance before building a full leadership team. Audax led technology, operations, and product strategy as the business scaled.",
    },
    {
      slug: "ai-digital-transformation-manufacturing",
      statIndex: 1,
      highlight:
        "A manufacturer had the appetite for AI but no roadmap and no internal technical leadership. Audax built the strategy first, then automated 15+ workflows across the business.",
    },
    {
      slug: "ai-client-assistant-professional-services",
      statIndex: 0,
      statLabel: "Reduction in routine inquiries",
      highlight:
        "Before writing a line of code, Audax ran a full AI opportunity assessment across a growing firm's customer workflows — then built the assistant that followed from it.",
    },
  ],
  Build: [
    {
      slug: "ai-marketplace-launch",
      statIndex: 1,
      statLabel: "Valuation within 18 months",
      highlight:
        "A founding team came to Audax with an early-stage concept and nothing built. Audax validated the opportunity, designed and built the MVP, and shipped it to market.",
    },
    {
      slug: "ai-consumer-app-launch",
      statIndex: 0,
      highlight:
        "An entrepreneur had a consumer AI idea but no product. Audax validated the market, designed the experience, and built the app from the ground up.",
    },
    {
      slug: "custom-operating-system-professional-services",
      statIndex: 0,
      highlight:
        "A service business ran on three disconnected SaaS platforms. Audax designed and built one custom operating system to replace all of them.",
    },
  ],
  Scale: [
    {
      slug: "custom-platform-replaces-legacy-saas",
      statIndex: 0,
      statLabel: "Admin hours saved every week",
      highlight:
        "A transportation organization was held back by fragmented, outdated SaaS tools. Audax consolidated them into one integrated platform and automated the manual work behind it.",
    },
    {
      slug: "internal-ai-knowledge-assistant",
      statIndex: 0,
      statLabel: "Less time spent searching for info",
      highlight:
        "Years of internal documentation left employees searching, asking, and recreating work that already existed. Audax built a secure internal AI assistant trained on it all.",
    },
    {
      slug: "crm-optimization-professional-services",
      statIndex: 0,
      highlight:
        "A growing service business was outgrowing its CRM and racking up SaaS costs. Audax fixed what was broken and mapped the roadmap for what comes next.",
    },
  ],
};

export default function ServiceResultsSection({ phase, accent }: { phase: ServicePageData["phase"]; accent: string }) {
  const items = featuredResultsByPhase[phase]
    .map((f) => {
      const caseStudy = getCaseStudyBySlug(f.slug);
      if (!caseStudy) return null;
      const stat = caseStudy.results[f.statIndex];
      return { ...f, caseStudy, stat };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <section className="py-20" style={{ backgroundColor: SECTION_CREAM_BG }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-2xl mb-14">
          <SectionEyebrow icon={TrendingUp} label="Real Results" accent={accent} />
          <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-5 leading-snug ${headerAccentClass}`} style={{ borderColor: accent }}>
            What Working With Audax Looks Like
          </h2>
          <p className="text-[#374151] leading-relaxed">
            A few outcomes from real Audax engagements. Client identities are kept confidential, the same way they are throughout our case studies — but every result below is real.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map(({ caseStudy, stat, statLabel, highlight }, i) => (
            <FadeIn key={caseStudy.slug} delay={i * 0.1}>
              <div className="group flex flex-col h-full rounded-3xl border border-gray-100 bg-white p-7 transition-colors hover:bg-[#FAFAFA]">
                <p className="text-[#0F172A] leading-relaxed mb-6 flex-1">{highlight}</p>
                <div className="flex items-end justify-between gap-4 pt-5 border-t border-gray-100">
                  <div>
                    {stat?.stat && (
                      <p className="font-heading font-extrabold text-2xl leading-none mb-1" style={{ color: accent }}>
                        {stat.stat}
                      </p>
                    )}
                    <p className="text-xs text-[#9CA3AF] leading-snug max-w-[18ch]">{statLabel ?? stat?.label}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-[#6B7280] mb-1">{caseStudy.industry}</p>
                    <Link
                      href={`/success-stories/${caseStudy.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-1.5 transition-all"
                      style={{ color: accent }}
                    >
                      Read the story <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
