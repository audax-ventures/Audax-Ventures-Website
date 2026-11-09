import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import CTABanner from "@/components/layout/CTABanner";
import { guidesData } from "@/lib/guides-data";

export const metadata: Metadata = {
  title: "Guides — In-Depth Resources for Builders & Buyers | Audax Ventures",
  description:
    "In-depth guides on AI strategy, software development, and building products — from the Audax Ventures team.",
  alternates: { canonical: "https://audaxventures.ca/guides" },
};

export default function GuidesPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
          <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Resources</p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-4">
            Guides
          </h1>
          <p className="text-[#374151] text-lg max-w-xl mx-auto">
            In-depth guides for builders and buyers navigating AI strategy and software development.
          </p>
        </div>
      </section>

      <section className="pb-20 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidesData.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-[#2563EB]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                  <BookOpen size={18} className="text-[#2563EB]" />
                </div>
                <h3 className="font-heading font-bold text-[#0F172A] text-base leading-snug mb-2 group-hover:text-[#2563EB] transition-colors flex-1">
                  {g.title}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#9CA3AF]">{g.readTime}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                    Read guide <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
