import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HideOnPortal from "@/components/layout/HideOnPortal";

// Fonts are stored in app/fonts (variable-weight, Latin) rather than downloaded
// from Google at build time, which occasionally failed and broke deploys.
const outfit = localFont({
  src: "./fonts/outfit-latin-wght-normal.woff2",
  variable: "--font-outfit",
  weight: "100 900",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://audaxventures.ca"),
  title: {
    default: "Audax Ventures — Canada's Leading Software Development Company",
    template: "%s | Audax Ventures",
  },
  description:
    "Audax Ventures helps startup founders and enterprise innovation teams build MVPs and scalable SaaS products. Book a free strategy call today.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://audaxventures.ca",
    siteName: "Audax Ventures",
  },
  twitter: {
    card: "summary_large_image",
    site: "@audaxventures",
  },
  icons: {
    icon: "/audax-icon.png",
    apple: "/audax-icon.png",
  },
  robots: { index: true, follow: true },
};

// Organization JSON-LD — emitted on every page so Google has a consistent
// Organization graph regardless of entry point. Page-level pages still emit
// additional schemas (BreadcrumbList, Service, FAQ) on top of this.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Audax Ventures",
  url: "https://audaxventures.ca",
  logo: "https://audaxventures.ca/audax-icon.png",
  description:
    "Canadian software studio helping funded founders ship MVPs and helping SMEs bring AI into their business.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Winnipeg",
    addressRegion: "MB",
    addressCountry: "CA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@audaxventures.ca",
    url: "https://calendly.com/audax-ventures/30min",
  },
  sameAs: [
    "https://www.linkedin.com/company/audax-ventures-inc/",
    "https://twitter.com/audaxventures",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-R9L7H4ZR4F" strategy="afterInteractive" />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R9L7H4ZR4F');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-[#1A1A2E]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <HideOnPortal>
          <Navbar />
        </HideOnPortal>
        <main className="flex-1">{children}</main>
        <HideOnPortal>
          <Footer />
        </HideOnPortal>

        <HideOnPortal>
          <Script id="intuitina-chatbot-loader" strategy="lazyOnload">
            {`
              if (!document.getElementById('custom-chatbot-iframe')) {
                var s = document.createElement('script');
                s.src = 'https://chat.intuitina.com/widget.js';
                s.async = true;
                s.id = 'custom-chatbot-iframe';
                s.setAttribute('cid', 'MTIwODI1NDU0');
                s.setAttribute('pod', '4');
                document.body.appendChild(s);
              }
            `}
          </Script>
        </HideOnPortal>
      </body>
    </html>
  );
}
