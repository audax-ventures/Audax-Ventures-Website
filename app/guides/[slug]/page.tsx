import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CTABanner from "@/components/layout/CTABanner";
import { getGuideBySlug, getAllGuideSlugs } from "@/lib/guides-data";
import { servicePagesData } from "@/lib/service-pages-data";
import { defaultOgImage } from "@/lib/og-image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `https://audaxventures.ca/guides/${slug}` },
    openGraph: { images: [defaultOgImage], title: guide.metaTitle, description: guide.metaDescription },
  };
}

function markdownToHtml(markdown: string): string {
  return markdown
    .trim()
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([123])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><\/p>/g, '')
    .replace(/^(?!<)(.*\S.*)/gm, '<p>$1</p>');
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://audaxventures.ca/insights" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `https://audaxventures.ca/guides/${slug}` },
    ],
  };

  const relatedServicesData = guide.relatedServices
    .map((s) => servicePagesData.find((d) => d.slug === s))
    .filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <article className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-sm text-[#374151] hover:text-[#2E5F8A] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Resources
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E5F8A]/10 text-[#2E5F8A] text-xs font-semibold mb-5 uppercase tracking-widest">
            Guide
          </div>
          <h1 className="font-[var(--font-outfit)] font-extrabold text-3xl sm:text-4xl text-[#1A1A2E] mb-6 leading-tight">
            {guide.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2E5F8A] flex items-center justify-center text-white text-xs font-bold">AV</div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{guide.author}</p>
                <p className="text-xs text-[#374151]">{guide.publishDate} · {guide.readTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg prose-headings:font-[var(--font-outfit)] prose-headings:font-bold prose-headings:text-[#1A1A2E] prose-p:text-[#374151] prose-p:leading-relaxed prose-a:text-[#2E5F8A] prose-strong:text-[#1A1A2E] prose-li:text-[#374151] max-w-none"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(guide.content) }}
          />
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <h2 className="font-[var(--font-outfit)] font-extrabold text-2xl text-[#1A1A2E] mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {guide.faq.map((f) => (
              <div key={f.q} className="bg-[#F8F9FA] rounded-2xl p-6">
                <h3 className="font-[var(--font-outfit)] font-bold text-[#1A1A2E] mb-2">{f.q}</h3>
                <p className="text-[#374151] text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Services */}
        {relatedServicesData.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <h2 className="font-[var(--font-outfit)] font-bold text-xl text-[#1A1A2E] mb-4">Related Services</h2>
            <div className="flex flex-wrap gap-3">
              {relatedServicesData.map((s) => s && (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#2E5F8A] text-[#2E5F8A] text-sm font-semibold hover:bg-[#2E5F8A] hover:text-white transition-colors"
                >
                  {s.title} <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author block */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-[#F8F9FA] rounded-3xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2E5F8A] flex items-center justify-center text-white font-bold flex-shrink-0">AV</div>
            <div>
              <p className="font-bold text-[#1A1A2E] text-sm">{guide.author}</p>
              <p className="text-[#374151] text-sm mt-1">
                This guide was written by the Audax Ventures team — experienced builders who have helped 50+ founders and enterprise teams bring software products to market.
              </p>
            </div>
          </div>
        </div>
      </article>

      <CTABanner />
    </>
  );
}
