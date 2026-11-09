import { displayName, requireMember } from "@/lib/portal/auth";
import { signOut } from "@/lib/portal/actions";
import PortalNav from "@/components/portal/PortalNav";

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await requireMember();
  const { count } = await supabase
    .from("portal_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "in_review");

  return (
    <div className="lg:flex">
      <PortalNav
        isAdmin={profile.role === "admin"}
        reviewCount={profile.role === "admin" ? (count ?? 0) : 0}
        userName={displayName(profile)}
        userEmail={profile.email}
        signOutAction={signOut}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
