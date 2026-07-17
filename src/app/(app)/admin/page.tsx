import { createClient } from "@/lib/supabase/server";
import StatsCards from "@/components/StatsCards";
import BookingsBarChart from "@/components/BookingsBarChart";
import type { Booking, Resource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [{ data: resources }, { data: bookings }, { count: userCount }] = await Promise.all([
    supabase.from("resources").select("*"),
    supabase
      .from("bookings")
      .select("*, resource:resources(*)")
      .eq("status", "confirmed")
      .gte("start_time", since.toISOString())
      .order("start_time"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const allResources = (resources as Resource[]) ?? [];
  const allBookings = (bookings as Booking[]) ?? [];
  const activeResources = allResources.filter((r) => r.is_active);

  // Ressource la plus utilisée sur les 30 derniers jours
  const usageByResource = new Map<string, number>();
  for (const b of allBookings) {
    usageByResource.set(b.resource_id, (usageByResource.get(b.resource_id) ?? 0) + 1);
  }
  let topResource: { name: string; count: number } | null = null;
  for (const [resourceId, count] of usageByResource) {
    const resource = allResources.find((r) => r.id === resourceId);
    if (resource && (!topResource || count > topResource.count)) topResource = { name: resource.name, count };
  }

  // Heures totales reservees sur 30 jours, pour un taux d'occupation approximatif
  const totalBookedMinutes = allBookings.reduce((sum, b) => {
    return sum + (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000;
  }, 0);
  const avgOpenMinutesPerDay = 15 * 60; // 08:00-23:00
  const capacityMinutes = activeResources.length * avgOpenMinutesPerDay * 30;
  const occupancyRate = capacityMinutes > 0 ? Math.round((totalBookedMinutes / capacityMinutes) * 100) : 0;

  // Reservations par jour, pour le graphique
  const byDay = new Map<string, number>();
  for (const b of allBookings) {
    const key = b.start_time.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Tableau de bord</h1>
        <p className="text-sm text-muted">Statistiques d&apos;utilisation sur les 30 derniers jours.</p>
      </div>
      <StatsCards
        totalRooms={activeResources.length}
        totalBookings={allBookings.length}
        occupancyRate={occupancyRate}
        userCount={userCount ?? 0}
        topRoomName={topResource?.name ?? "—"}
      />
      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-medium text-sm mb-4">Réservations par jour</h2>
        <BookingsBarChart data={days} />
      </div>
    </div>
  );
}
