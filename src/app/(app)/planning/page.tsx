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
    error: userError,
  } = await supabase.auth.getUser();

  const dateKey = searchParams.date ?? new Date().toISOString().slice(0, 10);
  const dayStart = new Date(`${dateKey}T00:00:00`);
  const dayEnd = new Date(`${dateKey}T23:59:59`);

  const roomsResult = await supabase.from("rooms").select("*").eq("is_active", true).order("name");
  const bookingsResult = await supabase
    .from("bookings")
    .select("*, organizer:profiles(*)")
    .eq("status", "confirmed")
    .gte("start_time", dayStart.toISOString())
    .lte("start_time", dayEnd.toISOString())
    .order("start_time");

  // --- DEBUG TEMPORAIRE ---
  return (
    <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, background: "#111", color: "#0f0", padding: 16 }}>
      {JSON.stringify(
        {
          user: user ? { id: user.id, email: user.email } : null,
          userError,
          roomsCount: roomsResult.data?.length ?? 0,
          roomsError: roomsResult.error,
          bookingsCount: bookingsResult.data?.length ?? 0,
          bookingsError: bookingsResult.error,
        },
        null,
        2
      )}
    </pre>
  );
}
