"use client";

import { motion } from "framer-motion";
import { Search, Palette, Code2, Cloud, HeartHandshake, Clock, CheckCircle2 } from "lucide-react";

const phases = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    duration: "1–2 weeks",
    description:
      "Every engagement starts with a structured discovery process. We interview your stakeholders, map the user journey, define the problem space, and document the precise requirements before any design or development begins. This is the highest-leverage phase: every dollar invested here saves ten in rework.",
    deliverables: [
      "Stakeholder interview synthesis",
      "User persona document",
      "Requirements specification",
      "Technical feasibility assessment",
      "MVP scope definition",
      "Preliminary project estimate",
    ],
    color: "bg-blue-50",
    iconColor: "text-[#2E5F8A]",
    accent: "border-[#2E5F8A]",
  },
  {
    icon: Palette,
    number: "02",
    title: "UI/UX Design",
    duration: "2–3 weeks",
    description:
      "With requirements locked, our design team creates wireframes and high-fidelity Figma prototypes. We design iteratively — wireframes first, then visual design, with your review and feedback at each stage. We don't write a line of code until designs are approved. This prevents the most common and costly type of rework.",
    deliverables: [
      "Information architecture",
      "User flow diagrams",
      "Mobile and desktop wireframes",
      "High-fidelity Figma designs",
      "Interactive clickable prototype",
      "Design system and component library",
    ],
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    accent: "border-indigo-400",
  },
  {
    icon: Code2,
    number: "03",
    title: "Core Development",
    duration: "6–16 weeks",
    description:
      "Development happens in 2-week sprints. At the end of each sprint, we demo working software to you. You can use it, test it, and give feedback. Nothing goes into the next sprint without your approval. Our engineers write tests as they build, and code is reviewed by a senior engineer before every merge.",
    deliverables: [
      "Sprint-by-sprint working software",
      "Unit and integration test suite",
      "Code documentation",
      "API documentation (if applicable)",
      "Weekly progress reports",
      "GitHub repository access throughout",
    ],
    color: "bg-slate-50",
    iconColor: "text-slate-600",
    accent: "border-slate-400",
  },
  {
    icon: Cloud,
    number: "04",
    title: "DevOps & Infrastructure",
    duration: "1–2 weeks",
    description:
      "Before launch, we configure your production environment: cloud hosting on AWS, GCP, or Vercel; CI/CD pipelines for automated deployment; database backups; monitoring and alerting; and security hardening. You get a production-grade infrastructure from day one — not something you'll need to retrofit later.",
    deliverables: [
      "Production cloud environment",
      "Staging environment",
      "CI/CD pipeline",
      "Monitoring and alerting (Datadog / Sentry)",
      "Database backup configuration",
      "Security headers and SSL",
    ],
    color: "bg-teal-50",
    iconColor: "text-teal-600",
    accent: "border-teal-400",
  },
  {
    icon: HeartHandshake,
    number: "05",
    title: "Ongoing Support",
    duration: "Monthly retainer",
    description:
      "Launch is the beginning, not the end. Most clients move into a retainer-based support engagement after launch: ongoing bug fixes, performance optimization, feature development based on user feedback, and strategic technical guidance. We structure retainers around your growth stage and budget.",
    deliverables: [
      "Monthly sprint cycles",
      "Bug fix SLA (response within 24 hours)",
      "Performance monitoring and optimization",
      "Security patch management",
      "Feature development from prioritized backlog",
      "Quarterly technical roadmap review",
    ],
    color: "bg-green-50",
    iconColor: "text-green-600",
    accent: "border-green-400",
  },
];

const faq = [
  { q: "Do you always follow this exact process?", a: "The phases are consistent, but the durations and emphasis vary by project. A design-heavy product spends more time in UI/UX. A data-intensive platform spends more time in architecture. We adapt the process to your project, not the other way around." },
  { q: "What if requirements change mid-project?", a: "They always do. We use a lightweight change management process: small changes are absorbed in the current sprint; significant scope changes are re-estimated transparently, with your approval required before we proceed." },
  { q: "How often do we communicate?", a: "Weekly video calls, asynchronous Slack communication, and bi-weekly sprint demos. You'll never wonder what's happening — and you'll never wait more than 2 weeks to see working software." },
  { q: "Can we start development before design is complete?", a: "Sometimes. For large projects, we structure work so development of completed designs can begin in parallel with design of later features. But we never build without approved designs for the specific features being built." },
  { q: "What does the discovery phase cost?", a: "Discovery is priced as a fixed-fee sprint: $5,000–$9,000 depending on complexity. This is separate from the development engagement and produces everything you need to get an accurate development estimate from any agency." },
];

export default function ProcessContent() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs tracking-widest uppercase text-[#2E5F8A] font-semibold mb-4"
          >
            How We Work
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1A1A2E] mb-6"
          >
            Our Development Process
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#374151] text-lg leading-relaxed"
          >
            A transparent, repeatable 5-phase process that keeps you in control, surfaces problems early, and delivers working software every two weeks.
          </motion.p>
        </div>
      </section>

      {/* Phases */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`bg-white rounded-3xl border-l-4 ${phase.accent} p-8 md:p-10 shadow-sm`}
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl ${phase.color} flex items-center justify-center`}>
                      <phase.icon className={phase.iconColor} size={28} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[#374151] text-sm font-mono">Phase {phase.number}</span>
                      <h2 className="font-heading font-extrabold text-2xl text-[#1A1A2E]">{phase.title}</h2>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F9FA] border border-gray-200 text-xs text-[#374151]">
                        <Clock size={12} />
                        {phase.duration}
                      </div>
                    </div>
                    <p className="text-[#374151] leading-relaxed mb-6">{phase.description}</p>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E] mb-3">Key Deliverables</p>
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {phase.deliverables.map((d) => (
                          <li key={d} className="flex items-center gap-2 text-sm text-[#374151]">
                            <CheckCircle2 size={14} className="text-[#2E5F8A] flex-shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-extrabold text-3xl text-[#1A1A2E] mb-10 text-center"
          >
            Process FAQ
          </motion.h2>
          <div className="space-y-4">
            {faq.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#F8F9FA] rounded-2xl p-6"
              >
                <h3 className="font-heading font-bold text-[#1A1A2E] mb-2">{f.q}</h3>
                <p className="text-[#374151] text-sm leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
