"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Download, MessageSquare, RotateCcw, Send, Trash2, Undo2 } from "lucide-react";
import {
  addComment,
  approveReport,
  deleteReport,
  markSent,
  moveBackToDraft,
  reopenReport,
  submitForReview,
  type ActionResult,
} from "@/lib/portal/actions";
import type { ReportStatus } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Avatar, Button, Card, ErrorNote, buttonClass, inputClass } from "../ui";

export interface ActivityItem {
  id: string;
  action: string;
  note: string | null;
  who: string;
  at: string;
}

const ACTION_TEXT: Record<string, string> = {
  created: "started the report",
  submitted: "submitted it for review",
  withdrawn: "moved it back to draft",
  changes_requested: "asked for changes",
  approved: "approved it",
  sent: "marked it as sent to the client",
  reopened: "reopened it",
  comment: "commented",
  template_updated: "updated it to the latest template",
};

const STEPS: { key: ReportStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "in_review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "sent", label: "Sent" },
];

const STATUS_HELP: Record<ReportStatus, { member: string; admin: string }> = {
  draft: {
    member: "Fill in the numbers, then submit it for review.",
    admin: "Fill in the numbers. You can approve it straight away or have someone else submit it.",
  },
  in_review: {
    member: "Waiting for an admin to review and approve.",
    admin: "Check the PDF preview, then approve it or send it back with a note.",
  },
  approved: {
    member: "Approved. An admin will send it to the client.",
    admin: "Approved and saved. Download the PDF, send it to the client, then mark it as sent.",
  },
  sent: {
    member: "Sent to the client.",
    admin: "Sent to the client. The saved PDF is exactly what they received.",
  },
};

export default function WorkflowPanel({
  reportId,
  status,
  isAdmin,
  canDelete,
  activity,
  flush,
  pdfUrl,
  contents,
}: {
  reportId: string;
  status: ReportStatus;
  isAdmin: boolean;
  canDelete: boolean;
  activity: ActivityItem[];
  flush: () => Promise<boolean>;
  pdfUrl: string;
  contents?: React.ReactNode;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: (id: string, note: string) => Promise<ActionResult>, opts: { needsNote?: boolean; confirm?: string } = {}) {
    setError(null);
    if (opts.needsNote && !note.trim()) {
      setError("Add a note so they know what to change.");
      return;
    }
    if (opts.confirm && !window.confirm(opts.confirm)) return;
    startTransition(async () => {
      const saved = await flush();
      if (!saved) {
        setError("Your latest changes couldn't be saved, so nothing was changed. Try again.");
        return;
      }
      const res = await action(reportId, note);
      if (res && !res.ok) {
        setError(res.error);
        return;
      }
      setNote("");
      // After submitting, go back to the reports list (with a confirmation banner).
      if (action === submitForReview) router.push("/portal/reports?submitted=1");
      else router.refresh();
    });
  }

  const help = STATUS_HELP[status][isAdmin ? "admin" : "member"];
  const currentStep = STEPS.findIndex((st) => st.key === status);

  return (
    <>
      <Card className="overflow-hidden">
        <div
          aria-hidden
          className={cn(
            "h-1.5 bg-gradient-to-r",
            status === "draft" && "from-slate-300 to-slate-400",
            status === "in_review" && "from-amber-300 to-amber-500",
            status === "approved" && "from-emerald-400 to-emerald-600",
            status === "sent" && "from-sky-400 to-sky-600",
          )}
        />
        <div className="px-4 pb-4 pt-4">
          <h3 className="font-heading text-[1.05rem] font-semibold text-[#0B1B33]">Review &amp; approval</h3>
          {/* Progress */}
          <ol className="mt-4 grid grid-cols-4" aria-label="Report progress">
            {STEPS.map((st, i) => {
              const done = i < currentStep;
              const current = i === currentStep;
              return (
                <li key={st.key} className="relative flex flex-col items-center text-center">
                  {i > 0 ? (
                    <span
                      aria-hidden
                      className={cn("absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2", i <= currentStep ? "bg-[#2E5F8A]" : "bg-[#E4E9F0]")}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                      done && "bg-[#2E5F8A] text-white",
                      current && "bg-[#0F2341] text-white ring-4 ring-[#2E5F8A]/15",
                      !done && !current && "border-2 border-[#E4E9F0] bg-white text-slate-400",
                    )}
                    aria-current={current ? "step" : undefined}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={cn("mt-1.5 text-[11px] font-medium", current ? "text-[#0F2341]" : "text-slate-400")}>{st.label}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 rounded-xl bg-[#F6F8FB] px-3 py-2.5 text-xs leading-relaxed text-slate-600">{help}</p>
        </div>
        <div className="space-y-2.5 border-t border-[#EEF1F5] p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            aria-label="Note"
            placeholder={status === "in_review" && isAdmin ? "Note for the team (needed when asking for changes)" : "Add a note (optional)"}
            className={inputClass}
          />
          <ErrorNote message={error} />

          {status === "draft" ? (
            <>
              <Button className="w-full" onClick={() => run(submitForReview)} disabled={pending}>
                <Send className="h-4 w-4" /> Submit for review
              </Button>
              {isAdmin ? (
                <Button variant="success" className="w-full" disabled={pending} onClick={() => run(approveReport, { confirm: "Approve this report now? It will be locked and the final PDF saved." })}>
                  <CheckCircle2 className="h-4 w-4" /> Approve now
                </Button>
              ) : null}
            </>
          ) : null}

          {status === "in_review" ? (
            isAdmin ? (
              <>
                <Button variant="success" className="w-full" disabled={pending} onClick={() => run(approveReport)}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button variant="secondary" className="w-full" disabled={pending} onClick={() => run(moveBackToDraft, { needsNote: true })}>
                  <Undo2 className="h-4 w-4" /> Ask for changes
                </Button>
              </>
            ) : (
              <Button variant="secondary" className="w-full" disabled={pending} onClick={() => run(moveBackToDraft)}>
                <Undo2 className="h-4 w-4" /> Move back to draft
              </Button>
            )
          ) : null}

          {status === "approved" || status === "sent" ? (
            <a href={`${pdfUrl}?download=1`} className={cn(buttonClass("primary"), "w-full")}>
              <Download className="h-4 w-4" /> Download final PDF
            </a>
          ) : null}

          {status === "approved" && isAdmin ? (
            <Button variant="secondary" className="w-full" disabled={pending} onClick={() => run(markSent)}>
              <Send className="h-4 w-4" /> Mark as sent to client
            </Button>
          ) : null}

          {(status === "approved" || status === "sent") && isAdmin ? (
            <Button variant="ghost" className="w-full" disabled={pending} onClick={() => run(reopenReport, { confirm: "Reopen this report? It goes back to draft so it can be edited, and will need approving again." })}>
              <RotateCcw className="h-4 w-4" /> Reopen for changes
            </Button>
          ) : null}

          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" disabled={pending || !note.trim()} onClick={() => run(addComment)}>
              <MessageSquare className="h-3.5 w-3.5" /> Add as comment
            </Button>
            {canDelete ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={pending}
                onClick={() => run(deleteReport, { confirm: "Delete this report for good? This can't be undone." })}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {contents}

      <Card>
        <div className="border-b border-[#EEF1F5] px-4 py-3.5">
          <h3 className="font-heading text-[1.05rem] font-semibold text-[#0B1B33]">History</h3>
        </div>
        <ol className="max-h-[420px] overflow-y-auto p-4">
          {activity.length === 0 ? <li className="text-xs text-slate-500">Nothing yet.</li> : null}
          {activity.map((a, i) => (
            <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < activity.length - 1 ? <span aria-hidden className="absolute bottom-0 left-[13px] top-8 w-px bg-[#E4E9F0]" /> : null}
              <Avatar name={a.who} size={27} />
              <div className="min-w-0 text-xs">
                <p className="text-slate-600">
                  <strong className="font-semibold text-[#0F2341]">{a.who}</strong> {ACTION_TEXT[a.action] ?? a.action}
                </p>
                {a.note ? <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-[#EEF1F5] bg-[#F8FAFC] px-2.5 py-2 text-slate-700">{a.note}</p> : null}
                <p className="mt-1 text-slate-400">
                  {new Date(a.at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
