"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMyName } from "@/lib/portal/actions";
import { createSupabaseBrowserClient } from "@/lib/portal/supabase/client";
import { Button, ErrorNote, Field, inputClass } from "@/components/portal/ui";

export default function AccountForms({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function saveName() {
    startTransition(async () => {
      const res = await updateMyName(name);
      setMsg(res.ok ? { ok: true, text: "Name saved." } : { ok: false, text: res.error });
      router.refresh();
    });
  }

  function savePassword() {
    if (password.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (password !== confirm) return setMsg({ ok: false, text: "The two passwords don't match." });
    startTransition(async () => {
      const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
      setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password changed." });
      if (!error) {
        setPassword("");
        setConfirm("");
      }
    });
  }

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-end gap-3">
        <Field label="Your name" className="flex-1" hint="Shown in report history.">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Button variant="secondary" onClick={saveName} disabled={pending} className="mb-6">Save</Button>
      </div>
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <Field label="New password">
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Repeat new password">
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </Field>
        <div className="flex justify-end">
          <Button onClick={savePassword} disabled={pending || !password}>Change password</Button>
        </div>
      </div>
      {msg ? (msg.ok ? <p className="text-sm text-emerald-700">{msg.text}</p> : <ErrorNote message={msg.text} />) : null}
    </div>
  );
}
