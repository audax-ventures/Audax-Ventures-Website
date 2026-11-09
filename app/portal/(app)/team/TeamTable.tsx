"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMember } from "@/lib/portal/actions";
import type { Profile, Role } from "@/lib/portal/types";
import { ErrorNote } from "@/components/portal/ui";

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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
              <th className="px-5 py-2.5 font-medium">Person</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">Access</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const me = p.id === currentUserId;
              return (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{p.full_name || p.email}{me ? <span className="text-slate-400"> (you)</span> : null}</div>
                    {p.full_name ? <div className="text-xs text-slate-500">{p.email}</div> : null}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={p.role}
                      disabled={me || pending}
                      onChange={(e) => change(p.id, { role: e.target.value as Role })}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm disabled:bg-slate-50"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.active}
                        disabled={me || pending}
                        onChange={(e) => change(p.id, { active: e.target.checked })}
                        className="h-4 w-4 accent-[#2E5F8A]"
                      />
                      <span className={p.active ? "text-emerald-700" : "text-slate-500"}>{p.active ? "Can sign in" : "No access"}</span>
                    </label>
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
