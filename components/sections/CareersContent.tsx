"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Upload, FileCheck2, Video,
} from "lucide-react";
import type { CareerJob } from "@/lib/careers-data";

// ── Shared styling ──────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors";
const labelClass = "block text-xs font-semibold text-[#0F172A] mb-1.5 tracking-wide";
const bodyTextClass = "text-[#374151] leading-relaxed";
const listClass = "list-disc pl-5 space-y-1.5 text-[#374151] leading-relaxed marker:text-[#9CA3AF]";
const sectionHeadingClass = "font-heading font-bold text-xl text-[#0F172A] mb-3";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function FileField({
  label, file, onChange, error,
}: {
  label: string; file: File | null; onChange: (file: File | null, error: string | null) => void; error: string | null;
}) {
  const inputId = `file-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) { onChange(null, null); return; }
    if (f.size > MAX_FILE_SIZE) { onChange(null, "File must be under 4MB."); return; }
    if (!ALLOWED_DOC_TYPES.includes(f.type)) { onChange(null, "File must be a PDF, DOC, or DOCX."); return; }
    onChange(f, null);
  };

  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>{label} <span className="text-red-400">*</span></label>
      <label
        htmlFor={inputId}
        className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-colors ${
          file ? "border-[#10B981] bg-[#10B981]/5" : error ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-[#2563EB]/40 hover:bg-[#F8F9FA]"
        }`}
      >
        {file ? <FileCheck2 size={18} className="text-[#10B981] flex-shrink-0" /> : <Upload size={18} className="text-[#9CA3AF] flex-shrink-0" />}
        <span className={`text-sm truncate ${file ? "text-[#0F172A] font-medium" : "text-[#9CA3AF]"}`}>
          {file ? file.name : "Click to upload — PDF, DOC, or DOCX (max 4MB)"}
        </span>
        <input id={inputId} type="file" required={!file} accept=".pdf,.doc,.docx" onChange={handleFile} className="sr-only" />
      </label>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

function YesNoQuestion({
  index, question, value, onChange,
}: {
  index: number; question: string; value: string | null; onChange: (v: string) => void;
}) {
  return (
    <div className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
      <p className="text-sm text-[#0F172A] font-medium leading-relaxed mb-3">
        {index + 1}. {question} <span className="text-red-400">*</span>
      </p>
      <div className="flex gap-3">
        {["Yes", "No"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-6 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              value === opt
                ? "bg-[#0B1220] border-[#0B1220] text-white"
                : "border-gray-200 text-[#374151] hover:border-[#0F172A]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const scrollToApply = () => {
  document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function CareersContent({ job }: { job: CareerJob }) {
  const badgeLabel = job.badgeLabel ?? "Open Role";
  const applyLabel = job.applyLabel ?? "Apply for This Role";
  const hasQuestions = job.questions.length > 0;
  const hasCoverLetterPrompt = !!job.coverLetterPrompt;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [answers, setAnswers] = useState<(string | null)[]>(Array(job.questions.length).fill(null));

  const setAnswer = (i: number, v: string) =>
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resume) { setError("Please upload your resume."); return; }
    if (hasCoverLetterPrompt) {
      if (!coverLetterText.trim()) { setError("Please answer the cover letter question."); return; }
    } else if (!coverLetter) {
      setError("Please upload your cover letter.");
      return;
    }
    if (hasQuestions && answers.some((a) => a === null)) { setError("Please answer all screening questions."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("jobSlug", job.slug);
      fd.append("name", name);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("videoLink", videoLink);
      fd.append("resume", resume);
      if (hasCoverLetterPrompt) {
        fd.append("coverLetterText", coverLetterText);
      } else {
        fd.append("coverLetter", coverLetter as File);
      }
      answers.forEach((a, i) => fd.append(`question-${i}`, a as string));

      const res = await fetch("/api/careers/apply", { method: "POST", body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #2563EB14 0%, transparent 68%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] mb-6">
            <Link href="/" className="hover:text-[#374151] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/careers" className="hover:text-[#374151] transition-colors">Careers</Link>
            <span>/</span>
            <span className="text-[#374151]">{job.title}</span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-widest uppercase text-[#2563EB] mb-5"
          >
            {badgeLabel}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F172A] mb-8 leading-tight"
          >
            {job.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
          >
            <button
              onClick={scrollToApply}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
            >
              {applyLabel} <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Job Description ── */}
      <section className="pb-16 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="space-y-4 mb-8">
            {job.intro.map((p, i) => (
              <p key={i} className={bodyTextClass}>{p}</p>
            ))}
          </div>

          {job.sections.map((section, si) => (
            <div key={si} className="mb-8">
              {section.heading && <h2 className={sectionHeadingClass}>{section.heading}</h2>}
              {section.paragraphs?.map((p, i) => (
                <p key={i} className={`${bodyTextClass} mb-3`}>{p}</p>
              ))}
              {section.items && (
                <ul className={`${listClass} mb-3`}>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {section.outro?.map((p, i) => (
                <p key={i} className={`${bodyTextClass} mb-3`}>{p}</p>
              ))}
            </div>
          ))}

          <div className="space-y-3 mb-8">
            {job.closing.map((p, i) => (
              <p key={i} className={bodyTextClass}>{p}</p>
            ))}
          </div>

          <button
            onClick={scrollToApply}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0B1220] text-white font-semibold hover:bg-[#1E293B] transition-colors shadow-lg shadow-black/10"
          >
            {applyLabel} <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* ── Application form ── */}
      <section id="apply" className="py-20 bg-[#F8F9FA] scroll-mt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                  <h3 className="font-heading font-extrabold text-2xl text-[#0F172A] mb-3">
                    Application submitted!
                  </h3>
                  <p className="text-[#374151] max-w-sm leading-relaxed">
                    Thanks for applying to {job.title}. We&apos;ve sent a confirmation to your email, and if you&apos;re selected to move forward, we&apos;ll be in touch.
                  </p>
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
                    <h2 className="font-heading font-extrabold text-2xl text-[#0F172A] mb-2">
                      {applyLabel}
                    </h2>
                    <p className="text-[#374151] text-sm">
                      All fields are required. We&apos;ll follow up by email or phone.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Jane Smith" />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address <span className="text-red-400">*</span></label>
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="jane@email.com" />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                      <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+1 (204) 555-0100" />
                    </div>

                    <FileField label="Resume" file={resume} error={resumeError} onChange={(f, err) => { setResume(f); setResumeError(err); }} />

                    {hasCoverLetterPrompt ? (
                      <div>
                        <label className={labelClass}>{job.coverLetterPrompt} <span className="text-red-400">*</span></label>
                        <textarea
                          required
                          rows={6}
                          value={coverLetterText}
                          onChange={(e) => setCoverLetterText(e.target.value)}
                          className={`${inputClass} resize-none`}
                          placeholder="Type your answer here…"
                        />
                      </div>
                    ) : (
                      <FileField label="Cover Letter" file={coverLetter} error={coverLetterError} onChange={(f, err) => { setCoverLetter(f); setCoverLetterError(err); }} />
                    )}

                    <div>
                      <label className={labelClass}>
                        <span className="inline-flex items-center gap-1.5"><Video size={13} /> Video Cover Letter Link</span>{" "}
                        <span className="text-[#9CA3AF] font-normal">(optional — bonus points!)</span>
                      </label>
                      <input
                        type="url"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className={inputClass}
                        placeholder="Link to a Loom, YouTube, or Drive video"
                      />
                    </div>

                    {hasQuestions && (
                      <div className="pt-2">
                        <p className={labelClass}>Screening Questions</p>
                        <div className="space-y-5 bg-[#F8F9FA] rounded-2xl p-5">
                          {job.questions.map((q, i) => (
                            <YesNoQuestion key={i} index={i} question={q} value={answers[i]} onChange={(v) => setAnswer(i, v)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-full bg-[#0B1220] text-white font-bold hover:bg-[#1E293B] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Submitting…
                        </>
                      ) : (
                        <>Submit Application <ArrowRight size={15} /></>
                      )}
                    </button>

                    <p className="text-center text-xs text-[#9CA3AF]">
                      Prefer a direct email?{" "}
                      <Link href="mailto:joshua@audaxventures.ca" className="text-[#2563EB] hover:underline font-medium">
                        joshua@audaxventures.ca
                      </Link>
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
