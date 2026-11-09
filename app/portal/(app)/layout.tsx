import { displayName, requireMember } from "@/lib/portal/auth";
import { signOut } from "@/lib/portal/actions";
import PortalShell from "@/components/portal/PortalShell";

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await requireMember();
  const isAdmin = profile.role === "admin";
  const { count } = isAdmin
    ? await supabase.from("portal_reports").select("id", { count: "exact", head: true }).eq("status", "in_review")
    : { count: 0 };

  return (
    <PortalShell
      isAdmin={isAdmin}
      reviewCount={count ?? 0}
      userName={displayName(profile)}
      userEmail={profile.email}
      signOutAction={signOut}
    >
      {children}
    </PortalShell>
  );
}
