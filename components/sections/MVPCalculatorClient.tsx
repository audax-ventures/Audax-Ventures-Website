"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const productTypes = [
  { id: "web", label: "Web App", icon: "🌐", base: 30000 },
  { id: "mobile", label: "Mobile App", icon: "📱", base: 40000 },
  { id: "saas", label: "SaaS Platform", icon: "☁️", base: 50000 },
  { id: "internal", label: "Internal Tool", icon: "🔧", base: 25000 },
];

const featureOptions = [
  { id: "auth", label: "Authentication & User Management", cost: 4000 },
  { id: "payments", label: "Payments & Billing (Stripe)", cost: 6000 },
  { id: "dashboard", label: "Dashboard & Analytics", cost: 8000 },
  { id: "api", label: "Third-Party API Integrations", cost: 5000 },
  { id: "admin", label: "Admin Panel", cost: 5000 },
  { id: "notifications", label: "Notifications (Email/Push/SMS)", cost: 4000 },
  { id: "ai", label: "AI / Machine Learning Features", cost: 15000 },
  { id: "uploads", label: "File Uploads & Storage", cost: 3000 },
  { id: "realtime", label: "Real-Time Features (Chat/Live Data)", cost: 8000 },
  { id: "analytics", label: "User Analytics & Tracking", cost: 3000 },
];

const stages = [
  { id: "idea", label: "Just an idea", discount: 0 },
  { id: "wireframes", label: "Wireframes ready", discount: 2000 },
  { id: "design", label: "Full design ready", discount: 5000 },
  { id: "spec", label: "Full spec / PRD ready", discount: 8000 },
];

const timelines = [
  { id: "asap", label: "ASAP", multiplier: 1.2 },
  { id: "1-3", label: "1–3 months", multiplier: 1.0 },
  { id: "3-6", label: "3–6 months", multiplier: 0.95 },
  { id: "flexible", label: "Flexible", multiplier: 0.9 },
];

const budgets = [
  { id: "under25", label: "Under $25K" },
  { id: "25-50", label: "$25K – $50K" },
  { id: "50-100", label: "$50K – $100K" },
  { id: "100plus", label: "$100K+" },
];

type Selections = {
  productType: string;
  features: string[];
  stage: string;
  timeline: string;
  budget: string;
};

export default function MVPCalculatorClient() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({
    productType: "",
    features: [],
    stage: "",
    timeline: "",
    budget: "",
  });

  const totalSteps = 5;

  function computeEstimate() {
    const product = productTypes.find((p) => p.id === selections.productType);
    const base = product?.base ?? 35000;
    const featureCost = featureOptions
      .filter((f) => selections.features.includes(f.id))
      .reduce((sum, f) => sum + f.cost, 0);
    const stageDiscount = stages.find((s) => s.id === selections.stage)?.discount ?? 0;
    const multiplier = timelines.find((t) => t.id === selections.timeline)?.multiplier ?? 1;
    const raw = (base + featureCost - stageDiscount) * multiplier;
    const low = Math.round(raw / 1000) * 1000;
    const high = Math.round((raw * 1.3) / 1000) * 1000;
    return { low, high };
  }

  function getRecommendation() {
    return "Founder Prototype Program";
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  function next() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function prev() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  const canNext = () => {
    if (step === 0) return !!selections.productType;
    if (step === 1) return selections.features.length > 0;
    if (step === 2) return !!selections.stage;
    if (step === 3) return !!selections.timeline;
    if (step === 4) return !!selections.budget;
    return true;
  };

  const estimate = computeEstimate();
  const recommendation = getRecommendation();

  return (
    <section className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-[#2E5F8A] font-semibold mb-3">Free Tool</p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1A1A2E] mb-4">
            MVP Cost Calculator
          </h1>
          <p className="text-[#374151]">Answer 5 questions to get your estimated project range.</p>
        </div>

        {/* Progress bar */}
        {step < totalSteps && (
          <div className="mb-10">
            <div className="flex justify-between text-xs text-[#374151] mb-2">
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(((step) / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#2E5F8A] rounded-full"
                animate={{ width: `${((step) / totalSteps) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <div className="bg-[#F8F9FA] rounded-3xl p-8 min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Step 0: Product Type */}
              {step === 0 && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6">What type of product are you building?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {productTypes.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelections((s) => ({ ...s, productType: p.id }))}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                          selections.productType === p.id
                            ? "border-[#2E5F8A] bg-[#2E5F8A]/5"
                            : "border-gray-200 bg-white hover:border-[#2E5F8A]/50"
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{p.icon}</span>
                        <span className="font-semibold text-[#1A1A2E] text-sm">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Features */}
              {step === 1 && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6">Which features do you need?</h2>
                  <div className="space-y-2">
                    {featureOptions.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelections((s) => ({
                          ...s,
                          features: s.features.includes(f.id)
                            ? s.features.filter((x) => x !== f.id)
                            : [...s.features, f.id],
                        }))}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          selections.features.includes(f.id)
                            ? "border-[#2E5F8A] bg-[#2E5F8A]/5"
                            : "border-gray-200 bg-white hover:border-[#2E5F8A]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                            selections.features.includes(f.id) ? "border-[#2E5F8A] bg-[#2E5F8A]" : "border-gray-300"
                          }`}>
                            {selections.features.includes(f.id) && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-[#1A1A2E]">{f.label}</span>
                        </div>
                        <span className="text-xs text-[#374151]">+${(f.cost / 1000).toFixed(0)}K</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Stage */}
              {step === 2 && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6">What stage are you at?</h2>
                  <div className="space-y-3">
                    {stages.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelections((sel) => ({ ...sel, stage: s.id }))}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                          selections.stage === s.id
                            ? "border-[#2E5F8A] bg-[#2E5F8A]/5"
                            : "border-gray-200 bg-white hover:border-[#2E5F8A]/40"
                        }`}
                      >
                        <span className="font-semibold text-[#1A1A2E] text-sm">{s.label}</span>
                        {s.discount > 0 && (
                          <span className="ml-2 text-xs text-green-600 font-medium">Saves ~${(s.discount / 1000).toFixed(0)}K</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Timeline */}
              {step === 3 && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6">What&apos;s your preferred timeline?</h2>
                  <div className="space-y-3">
                    {timelines.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelections((s) => ({ ...s, timeline: t.id }))}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                          selections.timeline === t.id
                            ? "border-[#2E5F8A] bg-[#2E5F8A]/5"
                            : "border-gray-200 bg-white hover:border-[#2E5F8A]/40"
                        }`}
                      >
                        <span className="font-semibold text-[#1A1A2E] text-sm">{t.label}</span>
                        {t.multiplier > 1 && <span className="text-xs text-orange-500 font-medium">Rush fee applies</span>}
                        {t.multiplier < 1 && <span className="text-xs text-green-600 font-medium">Slight discount</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Budget */}
              {step === 4 && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6">What&apos;s your budget range?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {budgets.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelections((s) => ({ ...s, budget: b.id }))}
                        className={`p-5 rounded-2xl border-2 transition-all ${
                          selections.budget === b.id
                            ? "border-[#2E5F8A] bg-[#2E5F8A]/5"
                            : "border-gray-200 bg-white hover:border-[#2E5F8A]/40"
                        }`}
                      >
                        <span className="font-semibold text-[#1A1A2E] text-sm">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {step === 5 && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#2E5F8A] flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-white" size={32} />
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl text-[#1A1A2E] mb-3">
                    Your Estimated Range
                  </h2>
                  <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
                    <p className="text-[#374151] text-sm mb-2">Based on your selections:</p>
                    <p className="font-heading font-extrabold text-4xl text-[#2E5F8A]">
                      ${(estimate.low / 1000).toFixed(0)}K – ${(estimate.high / 1000).toFixed(0)}K CAD
                    </p>
                    <p className="text-[#374151] text-xs mt-2">
                      This is a rough estimate. Actual cost depends on final scope.
                    </p>
                  </div>
                  <div className="bg-[#2E5F8A]/5 rounded-2xl p-5 mb-6 border border-[#2E5F8A]/20">
                    <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Recommended Program:</p>
                    <p className="text-[#2E5F8A] font-heading font-bold text-lg">{recommendation}</p>
                    <Link
                      href="https://www.audaxventures.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#2E5F8A] hover:underline"
                    >
                      Learn about this program →
                    </Link>
                  </div>
                  <Link
                    href="https://calendly.com/audax-ventures/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2E5F8A] text-white font-bold hover:bg-[#3A7BD5] transition-colors w-full justify-center"
                  >
                    Get Your Free Custom Quote <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={() => { setStep(0); setSelections({ productType: "", features: [], stage: "", timeline: "", budget: "" }); }}
                    className="mt-4 text-sm text-[#374151] hover:text-[#2E5F8A] transition-colors"
                  >
                    Start over
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < totalSteps && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-[#374151] hover:border-[#2E5F8A] hover:text-[#2E5F8A] transition-colors ${step === 0 ? "invisible" : ""}`}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={next}
              disabled={!canNext()}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2E5F8A] text-white font-semibold text-sm hover:bg-[#3A7BD5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 4 ? "Get My Estimate" : "Next"} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
