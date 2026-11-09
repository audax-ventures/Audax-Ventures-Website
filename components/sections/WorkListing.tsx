"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { caseStudiesData, type CaseStudyService } from "@/lib/case-studies-data";

const filters: ("All Projects" | CaseStudyService)[] = [
  "All Projects",
  "AI Leadership",
  "Custom Software Development",
  "Digital Operations",
];

export default function WorkListing() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All Projects");

  const visibleStudies =
    activeFilter === "All Projects"
      ? caseStudiesData
      : caseStudiesData.filter((c) => c.services.includes(activeFilter));

  return (
    <section className="pb-20 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === f
                  ? "bg-[#0B1220] border-[#0B1220] text-white"
                  : "border-gray-200 bg-white text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {visibleStudies.map((c) => (
            <Link
              key={c.slug}
              href={`/success-stories/${c.slug}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {c.industry}
                </span>
                {c.tag && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] bg-purple-50 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={10} className="fill-current" /> {c.tag}
                  </span>
                )}
              </div>

              <h3 className="font-heading font-extrabold text-lg text-[#0F172A] mb-3 leading-snug group-hover:text-[#2563EB] transition-colors">
                {c.title}
              </h3>

              <p className="text-[#374151] text-sm leading-relaxed mb-6 flex-1">{c.excerpt}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {c.services.map((s) => (
                  <span key={s} className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#0F172A]/6 text-[#374151] text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] group-hover:gap-2.5 transition-all">
                Read the success story <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {visibleStudies.length === 0 && (
          <p className="text-center text-[#374151] py-12">No success stories found for this filter yet.</p>
        )}
      </div>
    </section>
  );
}
