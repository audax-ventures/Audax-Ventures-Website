import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Audax Ventures",
  description:
    "How Audax Ventures collects, uses, and protects your personal information, including our PIPEDA compliance, Canadian data residency, and your privacy rights.",
};

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-extrabold text-4xl text-[#1A1A2E] mb-6">Privacy Policy</h1>
        <p className="text-[#374151] mb-8">Last updated: [confirm publish date]</p>
        <div className="prose prose-lg text-[#374151]">
          <p>
            Audax Ventures (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a Canadian AI strategy and software
            development studio based in Winnipeg, Manitoba. This Privacy Policy explains what personal information we
            collect, why we collect it, how we protect it, and the rights you have over it — both as a visitor to this
            website and as a client engaging our services.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">PIPEDA Compliance</h2>
          <p>
            Audax Ventures collects, uses, and discloses personal information in accordance with the Personal
            Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation.
            We only collect information that is reasonably necessary for the purposes described in this policy, we
            obtain your consent before collecting or using it for any other purpose, and we take reasonable steps to
            keep it accurate, secure, and accessible to you on request.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          <ul>
            <li><strong>Information you provide directly</strong> — your name, email address, company name, phone number, budget range, and project details when you fill out our contact form, book a strategy call, or otherwise correspond with us.</li>
            <li><strong>Website usage data</strong> — pages visited, referral source, device and browser type, and general location (city/region level), collected automatically via Google Analytics (GA4).</li>
            <li><strong>Chat interactions</strong> — messages you send through our on-site chat widget, which is provided by a third-party vendor (see &ldquo;Third-Party Services&rdquo; below).</li>
            <li><strong>Client engagement data</strong> — information exchanged during active projects, governed additionally by the Master Services Agreement (MSA) and Statement of Work (SOW) for that engagement.</li>
          </ul>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Respond to your inquiries and schedule strategy calls</li>
            <li>Scope, deliver, and support the services you&apos;ve engaged us for</li>
            <li>Send relevant communications about your project or inquiry</li>
            <li>Understand how visitors use our website so we can improve it</li>
            <li>Meet our own legal, accounting, and contractual obligations</li>
          </ul>
          <p>We do not sell your personal information, and we do not use it for purposes unrelated to those listed above without asking first.</p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Data Storage &amp; Canadian Residency</h2>
          <p>
            As a Canadian company, we prioritize keeping personal information within Canada wherever practical.
            Website and application infrastructure we build for clients is hosted in [confirm hosting region — e.g.,
            AWS Canada (Central) / Vercel]. Where a project&apos;s requirements call for data residency guarantees
            (for example, healthcare or financial services clients), we confirm and document the specific hosting
            region as part of that engagement&apos;s Statement of Work.
          </p>
          <p>
            Some third-party tools we rely on for this website (analytics, scheduling, and chat) may process data on
            servers located outside Canada, including in the United States, as part of their standard infrastructure.
            Where that&apos;s the case, we choose vendors that maintain industry-standard security and privacy
            commitments, and we list them below.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Third-Party Services</h2>
          <p>This website uses the following third-party services, each governed by its own privacy policy:</p>
          <ul>
            <li><strong>Google Analytics (GA4)</strong> — website usage analytics</li>
            <li><strong>Calendly</strong> — strategy call scheduling</li>
            <li><strong>Intuitina</strong> — on-site chat widget</li>
            <li><strong>Vercel</strong> — website hosting</li>
          </ul>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Data Retention</h2>
          <p>
            We retain contact and inquiry information for as long as reasonably necessary to respond to your inquiry
            or maintain our business relationship with you, and client engagement data for the period specified in
            the applicable MSA plus any period required by law (e.g., tax and accounting record retention). You can
            request earlier deletion at any time — see &ldquo;Your Rights&rdquo; below.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Your Rights</h2>
          <p>Under PIPEDA, you have the right to:</p>
          <ul>
            <li>Know what personal information we hold about you and why</li>
            <li>Request a copy of that information</li>
            <li>Request correction of inaccurate information</li>
            <li>Withdraw consent for us to use your information (subject to legal or contractual obligations)</li>
            <li>Request deletion of your information, where we are not required to retain it</li>
          </ul>
          <p>To exercise any of these rights, contact us at privacy@audaxventures.ca. We will respond within a reasonable timeframe.</p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Security</h2>
          <p>
            We use industry-standard technical and organizational measures — including encryption in transit,
            access controls, and least-privilege practices — to protect personal information against unauthorized
            access, alteration, disclosure, or destruction. No method of transmission or storage is 100% secure, and
            we cannot guarantee absolute security.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal
            reasons. We&apos;ll update the &ldquo;Last updated&rdquo; date above when we do, and for material changes
            we&apos;ll take reasonable steps to notify active clients directly.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or want to exercise your privacy rights, contact us at
            privacy@audaxventures.ca.
          </p>
        </div>
      </div>
    </section>
  );
}
