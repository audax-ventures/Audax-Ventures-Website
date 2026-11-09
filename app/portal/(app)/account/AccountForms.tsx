"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { updateMyName } from "@/lib/portal/actions";
import { createSupabaseBrowserClient } from "@/lib/portal/supabase/client";
import { Button, Card, CardHeader, ErrorNote, Field, inputClass } from "@/components/portal/ui";

type Msg = { ok: boolean; text: string } | null;

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return msg.ok ? <p className="text-sm text-emerald-700">{msg.text}</p> : <ErrorNote message={msg.text} />;
}

export default function AccountForms({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nameMsg, setNameMsg] = useState<Msg>(null);
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [pending, startTransition] = useTransition();

  function saveName() {
    startTransition(async () => {
      const res = await updateMyName(name);
      setNameMsg(res.ok ? { ok: true, text: "Name saved." } : { ok: false, text: res.error });
      router.refresh();
    });
  }

  function savePassword() {
    if (password.length < 8) return setPwMsg({ ok: false, text: "Use at least 8 characters." });
    if (password !== confirm) return setPwMsg({ ok: false, text: "The two passwords don't match." });
    startTransition(async () => {
      const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
      setPwMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password changed." });
      if (!error) {
        setPassword("");
        setConfirm("");
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader icon={UserRound} title="Profile" description="Your name appears in report history." />
        <div className="space-y-4 p-5 sm:p-6">
          <Field label="Your name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <div className="flex items-center justify-end gap-3">
            <Message msg={nameMsg} />
            <Button onClick={saveName} disabled={pending || name === fullName}>Save name</Button>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader icon={KeyRound} title="Password" description="At least 8 characters." />
        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password">
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Repeat new password">
              <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Message msg={pwMsg} />
            <Button onClick={savePassword} disabled={pending || !password}>Change password</Button>
          </div>
        </div>
      </Card>
    </>
  );
}
