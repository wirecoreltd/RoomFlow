import { createClient } from "@/lib/supabase/server";
import UsersManager from "@/components/UsersManager";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Utilisateurs</h1>
        <p className="text-sm text-muted">Gérez les droits d&apos;accès de votre organisation.</p>
      </div>
      <UsersManager initialProfiles={(profiles as Profile[]) ?? []} currentUserId={user?.id ?? ""} />
    </div>
  );
}
