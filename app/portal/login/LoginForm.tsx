"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/portal/supabase/client";
import { ErrorNote } from "@/components/portal/ui";

const fieldClass =
  "block w-full rounded-xl border border-[#D6DCE4] bg-white py-3.5 pl-11 pr-4 text-[0.95rem] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10";

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "That email and password don't match." : error.message);
      setBusy(false);
      return;
    }
    // Full page load so the server sees the new session cookie.
    window.location.assign(next && next.startsWith("/portal") ? next : "/portal");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#0B1B33]">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#0B1B33]">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <ErrorNote message={error} />

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-[#0B1B33] py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(11,27,51,0.55)] transition-colors hover:bg-[#1A3A5C] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <div className="h-px bg-[#E4E0DA]" aria-hidden />
      <p className="text-center text-sm text-[#3E5878]">Forgot your password? Ask your admin to reset it.</p>
    </form>
  );
}
