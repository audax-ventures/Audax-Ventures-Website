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
    <form action={formAction} className="space-y-6 p-5 sm:p-6">
      <Field label="Client name">
        <input name="name" required defaultValue={client?.name} className={inputClass} />
      </Field>

      <div className="grid gap-6">
        <Field label="Logo" hint="PNG with a transparent background looks best. Shown at the top of every report.">
          <div className="flex items-center gap-3">
            <ClientLogo src={removeLogo ? null : preview} name={client?.name ?? "?"} size={60} />
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
              className="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-[#D9E0EA] file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
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
              className="h-10 w-12 cursor-pointer rounded-xl border border-[#D5DCE6] bg-white p-1"
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
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F5] pt-5">
        {state?.ok ? <span className="text-sm text-emerald-700">Saved</span> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
