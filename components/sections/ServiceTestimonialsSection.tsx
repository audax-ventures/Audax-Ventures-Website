import { Quote } from "lucide-react";
import type { ServicePageData } from "@/lib/service-pages-data";
import { FadeIn } from "@/components/ui/FadeIn";
import { SECTION_TINT_BG, headerAccentClass } from "./ServicePageVisuals";

function SectionEyebrow({ icon: Icon, label, accent }: { icon: React.ElementType; label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}14` }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</p>
    </div>
  );
}

// Real client testimonials, shared anonymously — not fabricated or
// AI-generated. Each array holds the 3 quotes for that page's phase.
const testimonialsByPhase: Record<ServicePageData["phase"], string[]> = {
  Think: [
    "Before working with Audax, we knew AI could improve our business, but we didn't have a clear strategy for where to start. They helped us identify the highest-impact opportunities, prioritize what was actually worth pursuing, and build a practical roadmap our team could execute.",
    "What stood out about Audax was their ability to go beyond AI strategy. They worked with our leadership team to understand our operations, identified several workflows we could improve with AI, and then helped us move those opportunities from ideas into real solutions.",
    "Audax helped us look at AI through the lens of business value rather than simply adopting new tools. We now have a clear AI strategy, stronger internal processes, and automation initiatives underway that are saving our team time and improving how we operate.",
  ],
  Build: [
    "Audax took us from an early-stage idea to a fully functioning platform in the market. They helped us define the product, prioritize the right features, build the MVP, and continue improving it after launch. Within our first two months, the platform had already generated more than $50,000 in revenue.",
    "We were relying on multiple systems and manual processes that simply weren't built around the way our business operated. Audax took the time to understand our workflows and built a custom solution around them. The result has reduced manual work, improved visibility across our team, and given us a platform we can continue to grow.",
    "Working with Audax felt very different from working with a traditional software developer. They challenged our thinking, helped us make better product decisions, and translated our business goals into technology that actually works. They became a strategic partner in the product, not just the team writing the code.",
  ],
  Scale: [
    "Most development teams disappear once the software is launched. Audax has stayed involved as our business has evolved, helping us prioritize new features, improve workflows, solve technical challenges, and continuously make the platform better. They've become an extension of our team.",
    "Our initial launch was only the beginning. Since then, Audax has helped us identify new automation opportunities, improve existing features, and introduce new capabilities based on how our team actually uses the technology. The platform continues to become more valuable as our business grows.",
    "Having Audax involved on an ongoing basis means we're not waiting for technology problems to become urgent. We regularly review what's working, what can be improved, and where new technology or AI can create value. That ongoing relationship has helped us operate more efficiently and make better technology decisions.",
  ],
};

export default function ServiceTestimonialsSection({ phase, accent }: { phase: ServicePageData["phase"]; accent: string }) {
  const quotes = testimonialsByPhase[phase];

  return (
    <section className="py-20" style={{ backgroundColor: SECTION_TINT_BG }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-2xl mb-14">
          <SectionEyebrow icon={Quote} label="Testimonials" accent={accent} />
          <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl text-[#0F172A] mb-5 leading-snug ${headerAccentClass}`} style={{ borderColor: accent }}>
            What Clients Say
          </h2>
          <p className="text-[#374151] leading-relaxed">
            Real feedback from real Audax clients, shared anonymously to protect their privacy.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((quote, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex flex-col h-full rounded-3xl border border-gray-100 bg-white p-7">
                <Quote size={24} style={{ color: accent }} className="mb-4 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-[#0F172A] leading-relaxed flex-1">{quote}</p>
                <p className="text-xs font-semibold text-[#9CA3AF] mt-6 pt-5 border-t border-gray-100">— Audax Client</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
