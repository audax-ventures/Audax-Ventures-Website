import type { Metadata } from "next";
import CTABanner from "@/components/layout/CTABanner";
import WorkListing from "@/components/sections/WorkListing";

export const metadata: Metadata = {
  title: "Client Success Stories | Audax Ventures",
  description:
    "See how organizations have partnered with Audax to transform operations, build custom technology, and create measurable business outcomes.",
  alternates: { canonical: "https://audaxventures.ca/success-stories" },
};

export default function WorkPage() {
  return (
    <>
      <section className="pt-32 pb-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Client Success Stories</p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-4">
            Client Success Stories
          </h1>
          <p className="text-[#374151] text-lg">
            See how organizations have partnered with Audax to transform operations, build custom technology, and create measurable business outcomes.
          </p>
        </div>
      </section>

      <section className="pb-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-100 bg-[#F8F9FA] p-8 sm:p-10 text-center">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F172A] mb-3">
              Real Results. Confidential by Design.
            </h2>
            <p className="text-[#374151] leading-relaxed max-w-2xl mx-auto">
              Every organization we work with has unique challenges, ideas, and competitive advantages. Because many of our engagements involve confidential technology, AI initiatives, and proprietary business processes, we keep our clients anonymous while sharing the outcomes and impact of our work. These case studies represent real projects and measurable results delivered across a range of industries.
            </p>
          </div>
        </div>
      </section>

      <WorkListing />

      <CTABanner
        heading="Ready to Become Our Next Success Story?"
        subtext="Book a free strategy call and let's talk about what you're building."
      />
    </>
  );
}
