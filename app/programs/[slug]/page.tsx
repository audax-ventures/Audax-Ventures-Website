import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import CTABanner from "@/components/layout/CTABanner";
import { getSolutionBySlug, getAllSolutionSlugs } from "@/lib/solutions-data";
import { defaultOgImage } from "@/lib/og-image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSolutionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = getSolutionBySlug(slug);
  if (!program) return {};
  return {
    title: program.metaTitle,
    description: program.metaDescription,
    alternates: { canonical: `https://audaxventures.ca/programs/${slug}` },
    openGraph: {
      images: [defaultOgImage],
      title: program.metaTitle,
      description: program.metaDescription,
      url: `https://audaxventures.ca/programs/${slug}`,
    },
  };
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = getSolutionBySlug(slug);
  if (!program) notFound();
  // External programs live on their own domain — redirect rather than
  // rendering a duplicate detail page. generateStaticParams already skips
  // these at build time; this catches the dev-mode dynamic render.
  if (program.externalUrl) redirect(program.externalUrl);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: program.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://audaxventures.ca" },
      { "@type": "ListItem", position: 2, name: "Programs", item: "https://audaxventures.ca/programs" },
      { "@type": "ListItem", position: 3, name: program.title, item: `https://audaxventures.ca/programs/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ── Breadcrumb ── */}
      <div className="pt-24 pb-0 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#374151]">
            <Link href="/" className="hover:text-[#2E5F8A] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/programs" className="hover:text-[#2E5F8A] transition-colors">Programs</Link>
            <span>/</span>
            <span className="text-[#1A1A2E] font-medium">{program.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="pt-8 pb-20 bg-gradient-to-b from-[#F8F9FA] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2E5F8A]/10 text-[#2E5F8A] text-xs font-semibold mb-6 uppercase tracking-widest">
            Program
          </div>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1A1A2E] mb-5 leading-tight">
            {program.heroTitle}
          </h1>
          <p className="text-[#374151] text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            {program.heroSub}
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
              href="/programs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[#2E5F8A] text-[#2E5F8A] font-bold hover:bg-[#2E5F8A] hover:text-white transition-colors"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Description ── */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#374151] text-lg leading-relaxed">{program.description}</p>
        </div>
      </section>

      {/* ── Phases ── */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-extrabold text-3xl text-[#1A1A2E] mb-12 text-center">
            The Program Phases
          </h2>
          <div className="space-y-8">
            {program.phases.map((phase) => (
              <div
                key={phase.name}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 text-center md:text-left">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-4xl mb-2">{phase.icon}</span>
                      <span className="font-heading font-extrabold text-3xl text-[#2E5F8A]/20">
                        0{phase.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="font-heading font-extrabold text-2xl text-[#1A1A2E]">
                        Phase {phase.number}: {phase.name}
                      </h3>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F9FA] border border-gray-200 text-xs text-[#374151]">
                        <Clock size={12} /> {phase.duration}
                      </div>
                    </div>
                    <p className="text-[#374151] leading-relaxed mb-5">{phase.description}</p>
                    <div className="grid md:grid-cols-[1fr_auto] gap-5 items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E] mb-3">
                          {phase.outcome ? "What we do" : "Deliverables"}
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {phase.deliverables.map((d) => (
                            <li key={d} className="flex items-start gap-2 text-sm text-[#374151]">
                              <CheckCircle2 size={14} className="text-[#2E5F8A] mt-0.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {phase.outcome && (
                        <aside className="md:max-w-[260px] border-l-2 border-[#2E5F8A] bg-[#F8F9FA] rounded-r-md px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2E5F8A] mb-1.5">
                            Phase Deliverable
                          </p>
                          <p className="text-sm text-[#1A1A2E] leading-relaxed">{phase.outcome}</p>
                        </aside>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-extrabold text-3xl text-[#1A1A2E] mb-8 text-center">
            Who This Program Is For
          </h2>
          <div className="space-y-3">
            {program.whoItsFor.map((w) => (
              <div key={w} className="flex items-center gap-3 bg-[#F8F9FA] rounded-xl px-5 py-3">
                <CheckCircle2 size={18} className="text-[#2E5F8A] flex-shrink-0" />
                <span className="text-[#1A1A2E] text-sm">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Differentiators ── */}
      <section className="py-14 bg-[#F8F9FA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-extrabold text-2xl text-[#1A1A2E] mb-8 text-center">
            What Makes This Different
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {program.differentiators.map((d) => (
              <div key={d} className="flex items-start gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100">
                <CheckCircle2 size={18} className="text-[#2E5F8A] mt-0.5 flex-shrink-0" />
                <span className="text-[#1A1A2E] text-sm">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-extrabold text-3xl text-[#1A1A2E] mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {program.faq.map((f) => (
              <div key={f.q} className="bg-[#F8F9FA] rounded-2xl p-6 hover:shadow-sm transition-shadow">
                <h3 className="font-heading font-bold text-[#1A1A2E] mb-2">{f.q}</h3>
                <p className="text-[#374151] text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other program CTA ── */}
      <section className="py-14 bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#374151] mb-3">Also Available</p>
          <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-4">
            Explore Our Other Program
          </h2>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E5F8A] hover:text-[#3A7BD5] transition-colors"
          >
            View all programs <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
