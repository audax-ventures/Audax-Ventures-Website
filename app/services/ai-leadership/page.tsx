import type { Metadata } from "next";
import ServiceLandingContent from "@/components/sections/ServiceLandingContent";
import { getServicePageBySlug } from "@/lib/service-pages-data";
import { defaultOgImage } from "@/lib/og-image";

const service = getServicePageBySlug("ai-leadership")!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: "https://audaxventures.ca/services/ai-leadership" },
  openGraph: {
    images: [defaultOgImage],
    title: service.metaTitle,
    description: service.metaDescription,
    url: "https://audaxventures.ca/services/ai-leadership",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: service.faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://audaxventures.ca" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://audaxventures.ca/services" },
    { "@type": "ListItem", position: 3, name: service.title, item: "https://audaxventures.ca/services/ai-leadership" },
  ],
};

export default function AILeadershipPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ServiceLandingContent data={service} />
    </>
  );
}
