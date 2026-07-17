"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatTime, initials } from "@/lib/utils";
import type { Booking, Resource } from "@/lib/types";
import BookingModal from "@/components/BookingModal";

const HOUR_HEIGHT = 64; // px per hour

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function PlanningGrid({
  dateKey,
  resources,
  initialBookings,
  currentUserId,
  isAdmin,
}: {
  dateKey: string;
  resources: Resource[];
  initialBookings: Booking[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [draft, setDraft] = useState<{ resourceId: string; start: Date; end: Date } | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => setBookings(initialBookings), [initialBookings]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, async () => {
        const dayStart = new Date(`${dateKey}T00:00:00`);
        const dayEnd = new Date(`${dateKey}T23:59:59`);
        const { data } = await supabase
          .from("bookings")
          .select("*, organizer:profiles(*)")
          .eq("status", "confirmed")
          .gte("start_time", dayStart.toISOString())
          .lte("start_time", dayEnd.toISOString())
          .order("start_time");
        if (data) setBookings(data as Booking[]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateKey, supabase]);

  const dayStartMin = resources.length
    ? Math.min(...resources.map((r) => timeToMinutes(r.opening_time))) - 30
    : 8 * 60;
  const dayEndMin = resources.length
    ? Math.max(...resources.map((r) => timeToMinutes(r.closing_time)))
    : 23 * 60;
  const totalMinutes = Math.max(60, dayEndMin - dayStartMin);
  const totalHeight = (totalMinutes / 60) * HOUR_HEIGHT;

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let m = Math.ceil(dayStartMin / 60) * 60; m <= dayEndMin; m += 60) marks.push(m);
    return marks;
  }, [dayStartMin, dayEndMin]);

  const isToday = dateKey === now.toISOString().slice(0, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - dayStartMin) / totalMinutes) * totalHeight;

  function bookingsForResource(resourceId: string) {
    return bookings.filter((b) => b.resource_id === resourceId);
  }

  function handleColumnClick(resource: Resource, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const rawMinutes = dayStartMin + (offsetY / totalHeight) * totalMinutes;
    const snapped = Math.round(rawMinutes / 15) * 15;
    const start = new Date(`${dateKey}T00:00:00`);
    start.setMinutes(snapped);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 60);
    setDraft({ resourceId: resource.id, start, end });
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center text-muted">
        Aucune ressource n&apos;est configurée pour le moment. Un administrateur doit en ajouter depuis{" "}
        <span className="font-medium text-text">Ressources</span>.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[720px]">
          <div className="grid border-b border-line" style={{ gridTemplateColumns: `64px repeat(${resources.length}, 1fr)` }}>
            <div />
            {resources.map((resource) => (
              <div key={resource.id} className="px-3 py-3 border-l border-line">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: resource.color }} />
                  <span className="font-medium text-sm">{resource.name}</span>
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {resource.capacity ? `${resource.capacity} pers. ` : ""}
                  {resource.location ? `· ${resource.location}` : ""}
                </div>
              </div>
            ))}
          </div>

          <div className="grid relative" style={{ gridTemplateColumns: `64px repeat(${resources.length}, 1fr)` }}>
            <div className="relative" style={{ height: totalHeight }}>
              {hourMarks.map((m) => (
                <div
                  key={m}
                  className="absolute right-2 -translate-y-1/2 text-xs font-mono text-muted"
                  style={{ top: ((m - dayStartMin) / totalMinutes) * totalHeight }}
                >
                  {String(Math.floor(m / 60)).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {resources.map((resource) => (
              <div
                key={resource.id}
                className="relative border-l border-line cursor-crosshair"
                style={{ height: totalHeight }}
                onClick={(e) => handleColumnClick(resource, e)}
              >
                {hourMarks.map((m) => (
                  <div
                    key={m}
                    className="absolute left-0 right-0 border-t border-line/70"
                    style={{ top: ((m - dayStartMin) / totalMinutes) * totalHeight }}
                  />
                ))}

                <div
                  className="absolute left-0 right-0 top-0 bg-black/[0.03]"
                  style={{ height: ((timeToMinutes(resource.opening_time) - dayStartMin) / totalMinutes) * totalHeight }}
                />
                <div
                  className="absolute left-0 right-0 bottom-0 bg-black/[0.03]"
                  style={{
                    height:
                      totalHeight -
                      ((timeToMinutes(resource.closing_time) - dayStartMin) / totalMinutes) * totalHeight,
                  }}
                />

                {bookingsForResource(resource.id).map((b) => {
                  const start = new Date(b.start_time);
                  const end = new Date(b.end_time);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const top = ((startMin - dayStartMin) / totalMinutes) * totalHeight;
                  const height = Math.max(20, ((endMin - startMin) / totalMinutes) * totalHeight);
                  const mine = b.user_id === currentUserId;
                  return (
                    <button
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(b);
                      }}
                      className="absolute left-1 right-1 rounded px-2 py-1 text-left text-white text-xs shadow-sm overflow-hidden hover:brightness-95 transition-all"
                      style={{ top, height, backgroundColor: resource.color }}
                    >
                      <div className="font-medium truncate">{b.title}</div>
                      <div className="opacity-80 truncate">
                        {formatTime(b.start_time)}–{formatTime(b.end_time)} ·{" "}
                        {mine ? "vous" : b.organizer?.full_name ?? initials(b.organizer?.full_name)}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {isToday && nowMinutes >= dayStartMin && nowMinutes <= dayEndMin && (
              <div
                className="absolute left-16 right-0 flex items-center pointer-events-none"
                style={{ top: nowTop }}
              >
                <div className="h-px w-full bg-occupied/70" />
                <span className="absolute -left-14 -translate-y-1/2 text-[10px] font-mono text-occupied bg-occupied-light px-1 rounded">
                  {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {draft && (
        <BookingModal
          resources={resources}
          initialResourceId={draft.resourceId}
          initialStart={draft.start}
          initialEnd={draft.end}
          onClose={() => setDraft(null)}
          onCreated={() => setDraft(null)}
        />
      )}

      {selected && (
        <BookingModal
          resources={resources}
          viewBooking={selected}
          canManage={selected.user_id === currentUserId || isAdmin}
          onClose={() => setSelected(null)}
          onCancelled={() => setSelected(null)}
        />
      )}
    </div>
  );
}
