import { createClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/DashboardStats";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const supabase = createClient();
  const daysBack = Number(searchParams.days ?? 30);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center text-muted">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  const { data: stats, error } = await supabase.rpc("get_dashboard_stats", {
    days_back: daysBack,
  });

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center text-muted">
        Impossible de charger les statistiques.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl">Tableau de bord</h1>
          <p className="text-sm text-muted">Statistiques d&apos;utilisation des salles.</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[7, 30, 90].map((d) => (
            
              key={d}
              href={`/admin/dashboard?days=${d}`}
              className={`px-3 py-1.5 rounded border ${
                daysBack === d ? "bg-ink text-white border-ink" : "border-line text-muted hover:border-ink"
              }`}
            >
              {d} jours
            </a>
          ))}
        </div>
      </div>
      <DashboardStats stats={stats} />
    </div>
  );
}
