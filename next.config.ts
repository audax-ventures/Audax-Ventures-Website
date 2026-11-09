import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Report portal: the PDF renderer reads its fonts and the Audax logo from disk.
  outputFileTracingIncludes: {
    "/portal/**": ["./lib/portal/pdf/fonts/**/*", "./public/audax-logo.png"],
  },
  experimental: {
    // Client logo uploads go through a server action.
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/solutions",       destination: "/programs",       permanent: true },
      { source: "/solutions/:slug", destination: "/programs/:slug", permanent: true },
      // Content restructure 2026-07-25 — repositioning toward AI leadership + custom software
      { source: "/blog",            destination: "/insights",       permanent: true },
      { source: "/blog/:slug",      destination: "/insights/:slug", permanent: true },
      { source: "/process",         destination: "/approach",       permanent: true },
      // Case Studies rebranded to Client Success Stories 2026-07-28 — /work was
      // briefly the live route before settling on /success-stories for SEO.
      { source: "/work",            destination: "/success-stories",       permanent: true },
      { source: "/work/:slug",      destination: "/success-stories/:slug", permanent: true },
      { source: "/industries/fintech-finance",             destination: "/industries/financial-services",   permanent: true },
      { source: "/industries/legal-professional-services", destination: "/industries/professional-services", permanent: true },
      // Enterprise Innovation Program and AI Implementation removed 2026-06-24 — send old links to the programs hub
      { source: "/programs/sme-ai-implementation", destination: "/programs", permanent: true },
      { source: "/programs/ai-implementation", destination: "/programs", permanent: true },
      { source: "/programs/enterprise-innovation-program", destination: "/programs", permanent: true },
      // Catalyst for Founders program removed 2026-05-28 — send old links to the programs hub
      { source: "/programs/catalyst-for-founders", destination: "/programs", permanent: true },
      { source: "/solutions/catalyst-for-founders", destination: "/programs", permanent: true },
      // CTO-as-a-Service renamed to Fractional Chief AI Officer, then to AI Leadership
      { source: "/services/cto-as-a-service", destination: "/services/ai-leadership", permanent: true },
      // Services consolidated to 3 core Think/Build/Scale pages 2026-07-27
      { source: "/services/fractional-caio", destination: "/services/ai-leadership", permanent: true },
      { source: "/services/custom-ai-software-development", destination: "/services/custom-software-development", permanent: true },
    ];
  },
};

export default nextConfig;
