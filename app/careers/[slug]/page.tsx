import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareersContent from "@/components/sections/CareersContent";
import { getCareerBySlug, getAllCareerSlugs } from "@/lib/careers-data";
import { defaultOgImage } from "@/lib/og-image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCareerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = getCareerBySlug(slug);
  if (!job) return {};
  return {
    title: job.metaTitle,
    description: job.metaDescription,
    alternates: { canonical: `https://audaxventures.ca/careers/${slug}` },
    openGraph: {
      images: [defaultOgImage],
      title: job.metaTitle,
      description: job.metaDescription,
      url: `https://audaxventures.ca/careers/${slug}`,
    },
  };
}

export default async function CareerJobPage({ params }: Props) {
  const { slug } = await params;
  const job = getCareerBySlug(slug);
  if (!job) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://audaxventures.ca" },
      { "@type": "ListItem", position: 2, name: "Careers", item: "https://audaxventures.ca/careers" },
      { "@type": "ListItem", position: 3, name: job.title, item: `https://audaxventures.ca/careers/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CareersContent job={job} />
    </>
  );
}
