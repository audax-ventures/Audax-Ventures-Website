"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/portal/supabase/client";
import { Button, ErrorNote, Field, inputClass } from "@/components/portal/ui";

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email">
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <ErrorNote message={error} />
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-slate-500">Forgot your password? Ask your admin to reset it.</p>
    </form>
  );
}
