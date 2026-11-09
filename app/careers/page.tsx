import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { careersData } from "@/lib/careers-data";

export const metadata: Metadata = {
  title: "Careers | Audax Ventures",
  description: "Open positions at Audax Ventures — join us in building meaningful technology and companies.",
  alternates: { canonical: "https://audaxventures.ca/careers" },
};

export default function CareersPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Careers</p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-4">
            Careers at Audax Ventures
          </h1>
          <p className="text-[#374151] text-lg">
            We&apos;re looking for driven, entrepreneurial people to help us build. Explore our open positions below.
          </p>
        </div>
      </section>

      <section className="pb-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {careersData.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {careersData.map((job) => (
                <Link
                  key={job.slug}
                  href={`/careers/${job.slug}`}
                  className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8"
                >
                  <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold uppercase tracking-widest mb-4">
                    {job.badgeLabel ?? "Open Role"}
                  </span>
                  <h2 className="font-heading font-extrabold text-xl text-[#0F172A] mb-3 leading-snug group-hover:text-[#2563EB] transition-colors">
                    {job.title}
                  </h2>
                  <p className="text-[#374151] text-sm leading-relaxed mb-6 flex-1">{job.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors self-start">
                    View & Apply <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="font-heading font-extrabold text-2xl text-[#0F172A] mb-3">
                No Open Positions Right Now
              </h2>
              <p className="text-[#374151] text-lg">
                We don&apos;t have any open roles at the moment, but check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
