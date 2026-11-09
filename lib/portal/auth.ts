import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import type { Profile } from "./types";

/** The signed-in user and their profile (once per request). */
export const getSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("portal_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  return { supabase, user, profile: profile ?? null };
});

/** For pages: send people who aren't active team members away. */
export async function requireMember() {
  const session = await getSession();
  if (!session.user) redirect("/portal/login");
  if (!session.profile?.active) redirect("/portal/pending");
  return { ...session, user: session.user, profile: session.profile };
}

export async function requireAdmin() {
  const session = await requireMember();
  if (session.profile.role !== "admin") redirect("/portal");
  return session;
}

/** For server actions: throw instead of redirecting. */
export async function memberOrThrow() {
  const session = await getSession();
  if (!session.user || !session.profile?.active) throw new Error("You need to be signed in.");
  return { ...session, user: session.user, profile: session.profile };
}

export async function adminOrThrow() {
  const session = await memberOrThrow();
  if (session.profile.role !== "admin") throw new Error("Only an admin can do that.");
  return session;
}

export function displayName(p: Pick<Profile, "full_name" | "email"> | null | undefined): string {
  if (!p) return "Someone";
  return p.full_name?.trim() || p.email.split("@")[0];
}
