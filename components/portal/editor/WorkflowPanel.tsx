"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, MessageSquare, RotateCcw, Send, Trash2, Undo2 } from "lucide-react";
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
import { Button, Card, ErrorNote, inputClass } from "../ui";

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
}: {
  reportId: string;
  status: ReportStatus;
  isAdmin: boolean;
  canDelete: boolean;
  activity: ActivityItem[];
  flush: () => Promise<boolean>;
  pdfUrl: string;
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
      router.refresh();
    });
  }

  const help = STATUS_HELP[status][isAdmin ? "admin" : "member"];

  return (
    <>
      <Card>
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold">Review &amp; approval</h3>
          <p className="mt-0.5 text-xs text-slate-500">{help}</p>
        </div>
        <div className="space-y-2.5 p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
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
            <a href={`${pdfUrl}?download=1`} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2E5F8A] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#1A3A5C]">
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

      <Card>
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold">History</h3>
        </div>
        <ol className="max-h-[420px] space-y-3 overflow-y-auto p-4">
          {activity.length === 0 ? <li className="text-xs text-slate-500">Nothing yet.</li> : null}
          {activity.map((a) => (
            <li key={a.id} className="text-xs">
              <p className="text-slate-700">
                <strong className="font-medium text-slate-900">{a.who}</strong> {ACTION_TEXT[a.action] ?? a.action}
              </p>
              {a.note ? <p className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 px-2 py-1.5 text-slate-700">{a.note}</p> : null}
              <p className="mt-0.5 text-slate-400">
                {new Date(a.at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
