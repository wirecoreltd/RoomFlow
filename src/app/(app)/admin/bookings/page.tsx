import { createClient } from "@/lib/supabase/server";
import BookingsTable from "@/components/BookingsTable";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const supabase = createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, resource:resources(*), organizer:profiles(*)")
    .order("start_time", { ascending: false })
    .limit(200);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Réservations</h1>
        <p className="text-sm text-muted">Historique et supervision de toutes les réservations.</p>
      </div>
      <BookingsTable initialBookings={(bookings as Booking[]) ?? []} />
    </div>
  );
}
