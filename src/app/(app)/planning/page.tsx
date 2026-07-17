import { createClient } from "@/lib/supabase/server";
import PlanningGrid from "@/components/PlanningGrid";
import WeekMonthView from "@/components/WeekMonthView";
import DateNav, { type PlanningView } from "@/components/DateNav";
import { addDays, startOfWeek, startOfMonth, endOfMonth, toDateKey } from "@/lib/utils";
import type { Booking, Resource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: { date?: string; view?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();
  const isAdmin = profile?.role === "admin";

  const requestedView = searchParams.view;
  const view: PlanningView =
    requestedView === "day" || requestedView === "week" || requestedView === "month"
      ? requestedView
      : "month";

  const dateKey = searchParams.date ?? toDateKey(new Date());
  const current = new Date(`${dateKey}T00:00:00`);

  let rangeStart: Date;
  let rangeEnd: Date;
  const days: Date[] = [];

  if (view === "day") {
    rangeStart = new Date(`${dateKey}T00:00:00`);
    rangeEnd = new Date(`${dateKey}T23:59:59`);
  } else if (view === "week") {
    rangeStart = startOfWeek(current);
    for (let i = 0; i < 7; i++) {
      days.push(addDays(rangeStart, i));
    }
    rangeEnd = addDays(rangeStart, 6);
    rangeEnd.setHours(23, 59, 59);
  } else {
    rangeStart = startOfMonth(current);
    rangeEnd = endOfMonth(current);
    const totalDays = rangeEnd.getDate();
    for (let i = 0; i < totalDays; i++) {
      days.push(addDays(rangeStart, i));
    }
    rangeEnd.setHours(23, 59, 59);
  }

  const [{ data: resources }, { data: bookings }] = await Promise.all([
    supabase.from("resources").select("*").eq("is_active", true).order("name"),
    supabase
      .from("bookings")
      .select("*, organizer:profiles(*)")
      .eq("status", "confirmed")
      .gte("start_time", rangeStart.toISOString())
      .lte("start_time", rangeEnd.toISOString())
      .order("start_time"),
  ]);

  const subtitle =
    view === "day"
      ? "Cliquez sur un creneau libre pour reserver. Le planning se met a jour en temps reel."
      : "Cliquez sur un jour pour voir le detail et reserver un creneau.";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl">Planning des ressources</h1>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <DateNav dateKey={dateKey} view={view} />
      </div>

      {view === "day" ? (
        <PlanningGrid
          dateKey={dateKey}
          resources={(resources as Resource[]) ?? []}
          initialBookings={(bookings as Booking[]) ?? []}
          currentUserId={user?.id ?? ""}
          isAdmin={isAdmin}
        />
      ) : (
        <WeekMonthView
          resources={(resources as Resource[]) ?? []}
          bookings={(bookings as Booking[]) ?? []}
          days={days}
        />
      )}
    </div>
  );
}
