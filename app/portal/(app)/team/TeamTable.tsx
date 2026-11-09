"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMember } from "@/lib/portal/actions";
import type { Profile, Role } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Avatar, ErrorNote, thClass } from "@/components/portal/ui";

export default function TeamTable({ people, currentUserId }: { people: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(id: string, changes: { role?: Role; active?: boolean }) {
    setError(null);
    startTransition(async () => {
      const res = await updateMember(id, changes);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      {error ? <div className="p-4"><ErrorNote message={error} /></div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-b border-[#EEF1F5] bg-[#F8FAFC]">
            <tr>
              <th className={`${thClass} pl-5`}>Person</th>
              <th className={thClass}>Role</th>
              <th className={`${thClass} pr-5`}>Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF1F5]">
            {people.map((p) => {
              const me = p.id === currentUserId;
              const name = p.full_name || p.email;
              return (
                <tr key={p.id} className={cn(!p.active && "bg-[#FBFCFE]")}>
                  <td className="py-3.5 pl-5 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size={34} className={cn(!p.active && "opacity-50")} />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[#0F2341]">
                          {name}
                          {me ? <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span> : null}
                        </div>
                        {p.full_name ? <div className="truncate text-xs text-slate-500">{p.email}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={p.role}
                      disabled={me || pending}
                      aria-label={`Role for ${name}`}
                      onChange={(e) => change(p.id, { role: e.target.value as Role })}
                      className="rounded-lg border border-[#D5DCE6] bg-white px-2.5 py-1.5 text-sm focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:bg-[#F6F8FB] disabled:text-slate-500"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3.5 pl-4 pr-5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.active}
                      aria-label={`${name} can sign in`}
                      disabled={me || pending}
                      onClick={() => change(p.id, { active: !p.active })}
                      className="group inline-flex items-center gap-2.5 disabled:cursor-not-allowed"
                    >
                      <span className={cn("relative h-6 w-11 rounded-full transition-colors", p.active ? "bg-emerald-600" : "bg-slate-300", (me || pending) && "opacity-60")}>
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", p.active ? "left-[22px]" : "left-0.5")} />
                      </span>
                      <span className={cn("text-sm", p.active ? "text-emerald-700" : "text-slate-500")}>{p.active ? "Can sign in" : "No access"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
