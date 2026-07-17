"use client";

import { useRouter } from "next/navigation";
import { toDateKey } from "@/lib/utils";
import type { Booking, Resource } from "@/lib/types";

export default function WeekMonthView({
  resources,
  bookings,
  days,
}: {
  resources: Resource[];
  bookings: Booking[];
  days: Date[];
}) {
  const router = useRouter();

  if (resources.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center text-muted">
        Aucune ressource n&apos;est configurée pour le moment. Un administrateur doit en ajouter depuis{" "}
        <span className="font-medium text-text">Ressources</span>.
      </div>
    );
  }

  function bookingsFor(resourceId: string, day: Date) {
    const key = toDateKey(day);
    return bookings.filter((b) => b.resource_id === resourceId && b.start_time.slice(0, 10) === key);
  }

  function goToDay(day: Date) {
    router.push(`/planning?date=${toDateKey(day)}&view=day`);
  }

  const today = toDateKey(new Date());

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted px-3 py-3 border-b border-line w-40">
                Ressource
              </th>
              {days.map((day) => {
                const key = toDateKey(day);
                const isToday = key === today;
                const headerClass = isToday
                  ? "px-2 py-3 border-b border-l border-line text-xs font-medium cursor-pointer hover:bg-black/5 text-brand"
                  : "px-2 py-3 border-b border-l border-line text-xs font-medium cursor-pointer hover:bg-black/5 text-muted";
                return (
                  <th key={key} onClick={() => goToDay(day)} className={headerClass}>
                    <div className="capitalize">{day.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                    <div className="text-sm text-text mt-0.5">{day.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="px-3 py-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: resource.color }} />
                    <span className="font-medium text-sm">{resource.name}</span>
                  </div>
                </td>
                {days.map((day) => {
                  const dayBookings = bookingsFor(resource.id, day);
                  const key = toDateKey(day);
                  return (
                    <td
                      key={key}
                      onClick={() => goToDay(day)}
                      className="px-2 py-3 border-b border-l border-line text-center cursor-pointer hover:bg-black/5 align-top"
                    >
                      {dayBookings.length === 0 ? (
                        <span className="text-xs text-line">—</span>
                      ) : (
                        <span
                          className="text-xs font-medium rounded-full px-2 py-0.5 text-white inline-block"
                          style={{ backgroundColor: resource.color }}
                        >
                          {dayBookings.length} resa.
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
