import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CTABanner from "@/components/layout/CTABanner";
import CaseStudyContent from "@/components/sections/CaseStudyContent";
import { caseStudiesData, getCaseStudyBySlug, getAllCaseStudySlugs } from "@/lib/case-studies-data";
import { defaultOgImage } from "@/lib/og-image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: study.metaTitle,
    description: study.metaDescription,
    alternates: { canonical: `https://audaxventures.ca/success-stories/${slug}` },
    openGraph: {
      images: [defaultOgImage],
      title: study.metaTitle,
      description: study.metaDescription,
      url: `https://audaxventures.ca/success-stories/${slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://audaxventures.ca" },
      { "@type": "ListItem", position: 2, name: "Client Success Stories", item: "https://audaxventures.ca/success-stories" },
      { "@type": "ListItem", position: 3, name: study.title, item: `https://audaxventures.ca/success-stories/${slug}` },
    ],
  };

  const otherStudies = caseStudiesData.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CaseStudyContent study={study} otherStudies={otherStudies} />
      <CTABanner
        heading="Ready to Become Our Next Success Story?"
        subtext="Book a free strategy call and let's talk about what you're building."
      />
    </>
  );
}
