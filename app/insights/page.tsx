import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { blogPosts, categories } from "@/lib/insights-data";

export const metadata: Metadata = {
  title: "Insights — AI Leadership & Software Development | Audax Ventures",
  description:
    "Insights on AI strategy, Fractional CAIO leadership, and custom software development from the Audax Ventures team. Practical advice for executives and enterprise builders.",
  alternates: { canonical: "https://audaxventures.ca/insights" },
};

export default function InsightsPage() {
  return (
    <section className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase text-[#2563EB] font-semibold mb-3">Resources</p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0F172A] mb-4">
            News & Tech Insights
          </h1>
          <p className="text-[#374151] text-lg max-w-xl mx-auto">
            Practical advice on AI strategy, executive AI leadership, and building software that ships.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/insights/${post.slug}`}
              className="group flex flex-col bg-white rounded-3xl border border-gray-100 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                {i === 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#2563EB] px-2.5 py-0.5 rounded-full">
                    <Star size={10} className="fill-current" /> Featured
                  </span>
                )}
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full">{post.category}</span>
              </div>
              <h3 className="font-heading font-bold text-[#0F172A] text-lg leading-snug mb-3 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-[#374151] text-sm leading-relaxed line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-medium text-[#9CA3AF]">{post.author}</span>
                <span className="text-xs font-semibold text-[#2563EB] inline-flex items-center gap-1">
                  Read more <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
