import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CTABanner from "@/components/layout/CTABanner";
import IndustryPageContent from "@/components/sections/IndustryPageContent";
import {
  getIndustryBySlug,
  getAllIndustrySlugs,
  industriesData,
} from "@/lib/industries-data";
import { defaultOgImage } from "@/lib/og-image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    alternates: { canonical: `https://audaxventures.ca/industries/${slug}` },
    openGraph: {
      images: [defaultOgImage],
      title: industry.metaTitle,
      description: industry.metaDescription,
      url: `https://audaxventures.ca/industries/${slug}`,
    },
  };
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: "https://audaxventures.ca" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://audaxventures.ca/industries" },
      { "@type": "ListItem", position: 3, name: industry.title, item: `https://audaxventures.ca/industries/${slug}` },
    ],
  };

  const relatedIndustries = industriesData
    .filter((i) => i.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <IndustryPageContent industry={industry} relatedIndustries={relatedIndustries} />

      <CTABanner />
    </>
  );
}
