"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/lib/portal/actions";
import type { Client } from "@/lib/portal/types";
import { Button, ClientLogo, ErrorNote, Field, inputClass } from "./ui";

export default function ClientForm({
  client,
  action,
  submitLabel,
}: {
  client?: Client;
  action: (state: unknown, form: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [color, setColor] = useState(client?.brand_color ?? "#2E5F8A");
  const [preview, setPreview] = useState<string | null>(client?.logo_data ?? null);
  const [removeLogo, setRemoveLogo] = useState(false);

  return (
    <form action={formAction} className="space-y-5 p-5">
      <Field label="Client name">
        <input name="name" required defaultValue={client?.name} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <Field label="Logo" hint="PNG with a transparent background looks best. Shown at the top of every report.">
          <div className="flex items-center gap-3">
            <ClientLogo src={removeLogo ? null : preview} name={client?.name ?? "?"} size={52} />
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                  setRemoveLogo(false);
                }
              }}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          {client?.logo_data ? (
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" name="remove_logo" checked={removeLogo} onChange={(e) => setRemoveLogo(e.target.checked)} />
              Remove logo
            </label>
          ) : null}
        </Field>
        <Field label="Brand colour" hint="Used for headings and charts.">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
            />
            <input
              name="brand_color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`${inputClass} w-28 font-mono`}
            />
          </div>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contact name (optional)">
          <input name="contact_name" defaultValue={client?.contact_name ?? ""} className={inputClass} />
        </Field>
        <Field label="Contact email (optional)">
          <input name="contact_email" type="email" defaultValue={client?.contact_email ?? ""} className={inputClass} />
        </Field>
      </div>
      <Field label="Internal notes (optional)" hint="Only your team sees this.">
        <textarea name="notes" rows={3} defaultValue={client?.notes ?? ""} className={inputClass} />
      </Field>

      <ErrorNote message={state && !state.ok ? state.error : null} />
      <div className="flex items-center justify-end gap-3">
        {state?.ok ? <span className="text-sm text-emerald-700">Saved</span> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
