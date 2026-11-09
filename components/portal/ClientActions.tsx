"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Plus } from "lucide-react";
import { createTemplate, setClientArchived } from "@/lib/portal/actions";
import { Button, ErrorNote } from "./ui";

export function NewTemplateButton({
  clientId,
  starters,
}: {
  clientId: string;
  starters: { key: string; name: string; description: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpen((o) => !o)}>
        <Plus className="h-3.5 w-3.5" /> New template
      </Button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-2 pb-1 pt-1 text-xs font-medium text-slate-500">Start from</p>
          {starters.map((s) => (
            <button
              key={s.key}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await createTemplate(clientId, s.key);
                  if (res && !res.ok) setError(res.error);
                })
              }
              className="block w-full rounded-lg px-2 py-2 text-left hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="block text-sm font-medium text-slate-900">{s.name}</span>
              <span className="block text-xs text-slate-500">{s.description}</span>
            </button>
          ))}
          <ErrorNote message={error} />
        </div>
      ) : null}
    </div>
  );
}

export function ArchiveClientButton({ clientId, archived }: { clientId: string; archived: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!archived && !confirm("Archive this client? Their reports stay saved, but they're hidden from lists and new reports.")) return;
        startTransition(async () => {
          await setClientArchived(clientId, !archived);
          router.refresh();
        });
      }}
    >
      {archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
      {archived ? "Restore client" : "Archive client"}
    </Button>
  );
}
