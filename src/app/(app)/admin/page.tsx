import { createClient } from "@/lib/supabase/server";
import StatsCards from "@/components/StatsCards";
import BookingsBarChart from "@/components/BookingsBarChart";
import type { Booking, Room } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [{ data: rooms }, { data: bookings }, { count: userCount }] = await Promise.all([
    supabase.from("rooms").select("*"),
    supabase
      .from("bookings")
      .select("*, room:rooms(*)")
      .eq("status", "confirmed")
      .gte("start_time", since.toISOString())
      .order("start_time"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const allRooms = (rooms as Room[]) ?? [];
  const allBookings = (bookings as Booking[]) ?? [];
  const activeRooms = allRooms.filter((r) => r.is_active);

  // Salle la plus utilisée sur les 30 derniers jours
  const usageByRoom = new Map<string, number>();
  for (const b of allBookings) {
    usageByRoom.set(b.room_id, (usageByRoom.get(b.room_id) ?? 0) + 1);
  }
  let topRoom: { name: string; count: number } | null = null;
  for (const [roomId, count] of usageByRoom) {
    const room = allRooms.find((r) => r.id === roomId);
    if (room && (!topRoom || count > topRoom.count)) topRoom = { name: room.name, count };
  }

  // Heures totales reservees sur 30 jours, pour un taux d'occupation approximatif
  const totalBookedMinutes = allBookings.reduce((sum, b) => {
    return sum + (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000;
  }, 0);
  const avgOpenMinutesPerDay = 11 * 60; // approx 8h-19h
  const capacityMinutes = activeRooms.length * avgOpenMinutesPerDay * 30;
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
        totalRooms={activeRooms.length}
        totalBookings={allBookings.length}
        occupancyRate={occupancyRate}
        userCount={userCount ?? 0}
        topRoomName={topRoom?.name ?? "—"}
      />

      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-medium text-sm mb-4">Réservations par jour</h2>
        <BookingsBarChart data={days} />
      </div>
    </div>
  );
}
