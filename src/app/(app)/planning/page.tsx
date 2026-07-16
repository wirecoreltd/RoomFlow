import { createClient } from "@/lib/supabase/server";
import PlanningGrid from "@/components/PlanningGrid";
import DateNav from "@/components/DateNav";
import type { Booking, Room } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dateKey = searchParams.date ?? new Date().toISOString().slice(0, 10);
  const dayStart = new Date(`${dateKey}T00:00:00`);
  const dayEnd = new Date(`${dateKey}T23:59:59`);

  const [{ data: rooms }, { data: bookings }] = await Promise.all([
    supabase.from("rooms").select("*").eq("is_active", true).order("name"),
    supabase
      .from("bookings")
      .select("*, organizer:profiles(*)")
      .eq("status", "confirmed")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString())
      .order("start_time"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl">Planning des salles</h1>
          <p className="text-sm text-muted">
            Cliquez sur un créneau libre pour réserver. Le planning se met à jour en temps réel.
          </p>
        </div>
        <DateNav dateKey={dateKey} />
      </div>

      <PlanningGrid
        dateKey={dateKey}
        rooms={(rooms as Room[]) ?? []}
        initialBookings={(bookings as Booking[]) ?? []}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}
