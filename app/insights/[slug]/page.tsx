import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { marked } from "marked";
import { ArrowLeft } from "lucide-react";
import CTABanner from "@/components/layout/CTABanner";
import { getBlogPostBySlug, getAllBlogSlugs, blogPosts } from "@/lib/insights-data";
import { defaultOgImage } from "@/lib/og-image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `https://audaxventures.ca/insights/${slug}` },
    openGraph: {
      images: [defaultOgImage],
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishDate,
      authors: [post.author],
    },
  };
}

export default async function InsightPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Audax Ventures" },
    datePublished: post.publishDate,
    image: post.thumbnail,
  };

  const relatedPostsData = post.relatedPosts
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean)
    .slice(0, 3);

  const contentHtml = await marked.parse(post.content);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="pt-32 pb-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-sm text-[#374151] hover:text-[#2E5F8A] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Insights
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-[#2E5F8A] bg-blue-50 px-2.5 py-0.5 rounded-full">{post.category}</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#1A1A2E] mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 pb-8 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#2E5F8A] flex items-center justify-center text-white font-bold text-sm">
              {post.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <p className="font-semibold text-[#1A1A2E] text-sm">{post.author}</p>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden">
            <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-headings:text-[#1A1A2E] prose-p:text-[#374151] prose-p:leading-relaxed prose-a:text-[#2E5F8A] prose-strong:text-[#1A1A2E] prose-li:text-[#374151] max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

        {/* Author block */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-[#F8F9FA] rounded-3xl p-8 flex gap-6">
            <div className="w-16 h-16 rounded-full bg-[#2E5F8A] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {post.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-heading font-bold text-[#1A1A2E] mb-2">{post.author}</p>
              <p className="text-[#374151] text-sm">
                The Audax Ventures team writes about software development, startups, and building great products. All views are our own.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPostsData.length > 0 && (
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading font-extrabold text-2xl text-[#1A1A2E] mb-8">Related Posts</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {relatedPostsData.map((p) => p && (
                <Link
                  key={p.slug}
                  href={`/insights/${p.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image src={p.thumbnail} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-[#2E5F8A] bg-blue-50 px-2 py-0.5 rounded-full">{p.category}</span>
                    <h3 className="font-heading font-bold text-[#1A1A2E] text-sm mt-2 line-clamp-2 group-hover:text-[#2E5F8A] transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
