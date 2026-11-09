"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { createTemplate, moveTemplate, setClientArchived } from "@/lib/portal/actions";
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
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-[#E4E9F0] bg-white p-2 shadow-xl">
          <p className="px-2.5 pb-1.5 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Start from</p>
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
              className="block w-full rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[#F6F8FB] disabled:opacity-50"
            >
              <span className="block text-sm font-semibold text-[#0F2341]">{s.name}</span>
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

export function TemplateOrderButtons({ templateId, isFirst, isLast, name }: { templateId: string; isFirst: boolean; isLast: boolean; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const move = (dir: -1 | 1) =>
    startTransition(async () => {
      const res = await moveTemplate(templateId, dir);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  return (
    <span className="flex flex-col">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={isFirst || pending}
        aria-label={`Move ${name} up`}
        title="Move up"
        className="rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0B1B33] disabled:opacity-25"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={isLast || pending}
        aria-label={`Move ${name} down`}
        title="Move down"
        className="rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0B1B33] disabled:opacity-25"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </span>
  );
}
