"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2, ArrowRight, Calendar, Mail, MapPin, Check,
  Lightbulb, Code2, TrendingUp, Clock, DollarSign, Send, ShieldCheck,
} from "lucide-react";
import Turnstile, { type TurnstileHandle } from "@/components/ui/Turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// ── Data ──────────────────────────────────────────────────────────────────────

const contactMethods = [
  {
    icon: Mail,
    label: "Email Us",
    value: "info@audaxventures.ca",
    sub: "We respond within one business day",
    href: "mailto:info@audaxventures.ca",
  },
  {
    icon: Calendar,
    label: "Book a Call",
    value: "Free 30-min strategy call",
    sub: "No pitch. Just clarity.",
    href: "https://calendly.com/audax-ventures/30min",
    external: true,
  },
  {
    icon: MapPin,
    label: "Based In",
    value: "Winnipeg, Manitoba, Canada",
    sub: "Working in your timezone",
    href: null,
  },
];

const serviceOptions = [
  { label: "AI Leadership", icon: Lightbulb },
  { label: "Software Development", icon: Code2 },
  { label: "Digital Operations", icon: TrendingUp },
];

const faqs = [
  { icon: Clock, q: "How quickly will you respond?", a: "Within one business day. Usually the same day if you reach out in the morning." },
  { icon: DollarSign, q: "Is the strategy call really free?", a: "Yes — no credit card, no commitment. It's a 30-minute conversation to see if we're the right fit for each other." },
  { icon: Send, q: "What if I'm not sure exactly what I need yet?", a: "That's completely normal — most conversations start that way. Tell us what you're working on and we'll help you figure out the right starting point on our call." },
  { icon: ShieldCheck, q: "Do you sign NDAs?", a: "Absolutely. We sign an NDA before any substantive discussion about your product or idea." },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors";
const labelClass = "block text-xs font-semibold text-[#0F172A] mb-1.5 tracking-wide";

// ── Component ─────────────────────────────────────────────────────────────────

const initialForm = {
  name: "", email: "", company: "", phone: "",
  services: [] as string[], message: "",
};

export default function ContactContent() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const set = (field: "name" | "email" | "company" | "phone" | "message") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleService = (service: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter((s) => s !== service)
        : [...f.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 relative overflow-hidden bg-white">
        <div
          className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 68%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 68%)" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-[#2563EB] font-bold mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Open to new conversations
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-[var(--font-outfit)] font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] mb-5 leading-tight"
          >
            Let&apos;s{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              Connect
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#374151] text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Whether you have a question, an idea, or just want to explore what&apos;s possible — we&apos;d love to hear from you. Reach out and let&apos;s start the conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="https://calendly.com/audax-ventures/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
            >
              <Calendar size={16} /> Book a Free Strategy Call
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Main two-column layout ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[380px_1fr] gap-12 items-start">

            {/* ── Left: photo + contact methods ── */}
            <div className="space-y-4">

              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-2"
              >
                <Image
                  src="/about/whiteboard-strategy.png"
                  alt="Audax Ventures team working through a strategy session"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 380px"
                />
              </motion.div>

              {/* Contact method cards */}
              {contactMethods.map((c, i) => {
                const Icon = c.icon;
                const inner = (
                  <div className={`group flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-200 ${c.href ? "hover:border-[#2563EB]/30 hover:shadow-md cursor-pointer" : ""}`}>
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={17} className="text-[#2563EB]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1">{c.label}</p>
                      <p className="font-[var(--font-outfit)] font-bold text-[#0F172A] text-sm mb-0.5 group-hover:text-[#2563EB] transition-colors truncate">{c.value}</p>
                      <p className="text-xs text-[#9CA3AF]">{c.sub}</p>
                    </div>
                  </div>
                );
                return c.href ? (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    className="block"
                  >
                    {inner}
                  </motion.a>
                ) : (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    {inner}
                  </motion.div>
                );
              })}

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl bg-white border border-gray-100 p-6"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-4">Follow Us</p>
                <div className="flex items-center gap-3">
                  {[
                    { href: "https://www.linkedin.com/company/audax-ventures-inc/", label: "LinkedIn", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
                    { href: "https://instagram.com/audax.ventures", label: "Instagram", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#374151] hover:bg-[#0F172A] hover:text-white transition-all duration-200"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right: Form ── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 px-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h3 className="font-[var(--font-outfit)] font-extrabold text-2xl text-[#0F172A] mb-3">
                      Message sent!
                    </h3>
                    <p className="text-[#374151] max-w-sm leading-relaxed mb-8">
                      Your message has been sent to{" "}
                      <span className="font-semibold text-[#2563EB]">info@audaxventures.ca</span>.
                      We&apos;ll get back to you within one business day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="https://calendly.com/audax-ventures/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B1220] text-white font-bold text-sm hover:bg-[#1E293B] transition-colors"
                      >
                        <Calendar size={14} /> Also book a call
                      </Link>
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setForm(initialForm);
                          setTurnstileToken(null);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-[#374151] font-bold text-sm hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                      >
                        Send another message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="p-8 sm:p-10"
                  >
                    <div className="mb-8">
                      <h2 className="font-[var(--font-outfit)] font-extrabold text-2xl text-[#0F172A] mb-2">
                        Connect with Us Today
                      </h2>
                      <p className="text-[#374151] text-sm">
                        Share a few details and we&apos;ll take it from there.
                      </p>
                    </div>

                    <div className="space-y-5">

                      {/* Name + Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                          <input required value={form.name} onChange={set("name")} className={inputClass} placeholder="Jane Smith" />
                        </div>
                        <div>
                          <label className={labelClass}>Email Address <span className="text-red-400">*</span></label>
                          <input required type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="jane@company.com" />
                        </div>
                      </div>

                      {/* Company + Phone */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Company <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
                          <input value={form.company} onChange={set("company")} className={inputClass} placeholder="Acme Corp" />
                        </div>
                        <div>
                          <label className={labelClass}>Phone <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
                          <input type="tel" value={form.phone} onChange={set("phone")} className={inputClass} placeholder="+1 (204) 555-0100" />
                        </div>
                      </div>

                      {/* Service(s) */}
                      <div>
                        <label className={labelClass}>Which service(s) are you interested in?</label>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {serviceOptions.map(({ label, icon: Icon }) => {
                            const checked = form.services.includes(label);
                            return (
                              <label
                                key={label}
                                className={`relative flex flex-col gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                                  checked
                                    ? "border-[#2563EB] bg-[#2563EB]/5 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${checked ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-400"}`}>
                                    <Icon size={16} />
                                  </div>
                                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-[#2563EB] border-[#2563EB]" : "border-gray-300"}`}>
                                    {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                                  </span>
                                </div>
                                <span className={`text-sm leading-snug ${checked ? "text-[#0F172A] font-semibold" : "text-[#374151] font-medium"}`}>
                                  {label}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleService(label)}
                                  className="sr-only"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className={labelClass}>Message <span className="text-red-400">*</span></label>
                        <textarea
                          required
                          rows={5}
                          value={form.message}
                          onChange={set("message")}
                          className={`${inputClass} resize-none`}
                          placeholder="Tell us a bit about yourself and what you'd like to connect with us about — a question, an idea, a potential project, or just to say hello."
                        />
                      </div>

                      {/* Spam protection */}
                      {TURNSTILE_SITE_KEY && (
                        <div className="flex justify-center">
                          <Turnstile
                            ref={turnstileRef}
                            siteKey={TURNSTILE_SITE_KEY}
                            onVerify={setTurnstileToken}
                            onExpire={() => setTurnstileToken(null)}
                          />
                        </div>
                      )}

                      {error && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                          {error}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
                        className="w-full py-4 rounded-full bg-[#0B1220] text-white font-bold hover:bg-[#1E293B] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Sending…
                          </>
                        ) : (
                          <>Submit <ArrowRight size={15} /></>
                        )}
                      </button>

                      <p className="text-center text-xs text-[#9CA3AF]">
                        Prefer a direct email?{" "}
                        <a href="mailto:info@audaxventures.ca" className="text-[#2563EB] hover:underline font-medium">
                          info@audaxventures.ca
                        </a>
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom FAQ strip ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[var(--font-outfit)] font-extrabold text-xl text-[#0F172A] mb-10 text-center">
            Common Questions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {faqs.map((f) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-[#2563EB]" />
                </div>
                <p className="font-[var(--font-outfit)] font-bold text-[#0F172A] text-sm mb-2 leading-snug">{f.q}</p>
                <p className="text-[#374151] text-xs leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
