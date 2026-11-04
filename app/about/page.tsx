import type { Metadata } from "next";
import CTABanner from "@/components/layout/CTABanner";
import AboutContent from "@/components/sections/AboutContent";
import { defaultOgImage } from "@/lib/og-image";

export const metadata: Metadata = {
  title: "About Audax Ventures",
  description:
    "Learn about Audax Ventures — the Canadian AI strategy and innovation firm behind Fractional Chief AI Officer services and custom AI & software development.",
  alternates: { canonical: "https://audaxventures.ca/about" },
  openGraph: { images: [defaultOgImage], title: "About Audax Ventures", url: "https://audaxventures.ca/about" },
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
      <CTABanner subtext="Let's create an AI strategy and custom solution that drives real, measurable impact." />
    </>
  );
}
