import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Audax Ventures",
  description:
    "Audax Ventures' Terms of Service, including our IP-ownership guarantee, engagement structure, governing law, and liability terms for clients and website visitors.",
};

export default function TermsPage() {
  return (
    <section className="pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-extrabold text-4xl text-[#1A1A2E] mb-6">Terms of Service</h1>
        <p className="text-[#374151] mb-8">Last updated: [confirm publish date]</p>
        <div className="prose prose-lg text-[#374151]">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Audax Ventures website
            (audaxventures.ca) and, alongside your Master Services Agreement (MSA) and Statement of Work (SOW),
            your engagement of our services. By using this website or engaging us for a project, you agree to
            these Terms.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Who We Are</h2>
          <p>
            Audax Ventures is a Canadian AI strategy and software development studio, incorporated in
            [confirm incorporation jurisdiction — e.g., Manitoba, Canada], operating primarily out of
            Winnipeg, Manitoba.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Use of This Website</h2>
          <p>
            This website is provided for informational purposes — to describe our services, share our work, and
            let you get in touch with us. You may not use this website in any way that could damage, disable, or
            impair it, or interfere with anyone else&apos;s use of it.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Client Engagements</h2>
          <p>
            Every client project is governed by a signed Master Services Agreement (MSA) and a project-specific
            Statement of Work (SOW), which set out the scope, timeline, pricing, and deliverables for that
            engagement. Where these Terms and a signed MSA/SOW conflict, the MSA/SOW governs for that engagement.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">IP Ownership Guarantee</h2>
          <p>
            Unless your MSA/SOW states otherwise, you own 100% of the source code, documentation, and other work
            product we create specifically for your project once it&apos;s been paid for in full. We do not retain
            licensing rights, hold your code hostage behind a retainer, or require ongoing payment to keep using
            what we built for you. This is a deliberate policy, not just boilerplate — full IP transfer is part of
            how we operate.
          </p>
          <p>
            This guarantee does not extend to Audax Ventures&apos; own pre-existing tools, frameworks, or general
            know-how used to build your project, which we retain the right to reuse on other engagements, nor to
            third-party software, libraries, or services your project depends on, which remain governed by their
            own licenses.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Website Content &amp; Intellectual Property</h2>
          <p>
            All content on this website — including text, graphics, logos, and code — is the property of Audax
            Ventures unless otherwise noted, and may not be reproduced or used without our written permission.
            Client-specific work product is governed by the IP Ownership Guarantee above and the applicable
            client agreement.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Payment &amp; Fixed-Price Phases</h2>
          <p>
            Client engagements are typically structured as fixed-price phases, with payment terms set out in the
            applicable SOW. Work on a given phase begins once that phase is confirmed and, where applicable, an
            initial payment has been received. Scope changes outside a signed SOW are handled through a change
            order, agreed in writing before additional work begins.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Audax Ventures will not be liable for any indirect, incidental,
            or consequential damages arising from your use of this website or our services. For client engagements,
            liability is further governed and, where applicable, capped by the terms of the signed MSA.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Governing Law</h2>
          <p>
            These Terms are governed by the laws of [confirm governing province — e.g., Manitoba] and the federal
            laws of Canada applicable therein, without regard to conflict-of-law principles.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We&apos;ll update the &ldquo;Last updated&rdquo; date above
            when we do. Continued use of this website after changes take effect means you accept the updated Terms.
          </p>

          <h2 className="font-heading font-bold text-[#1A1A2E] mt-8 mb-3">Contact</h2>
          <p>For questions about these Terms, contact legal@audaxventures.ca.</p>
        </div>
      </div>
    </section>
  );
}
