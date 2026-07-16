"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export default function BookingsTable({ initialBookings }: { initialBookings: Booking[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("upcoming");

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (filter === "cancelled") return b.status === "cancelled";
    if (b.status === "cancelled") return false;
    if (filter === "upcoming") return new Date(b.start_time) >= now;
    if (filter === "past") return new Date(b.start_time) < now;
    return true;
  });

  async function cancel(id: string) {
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["upcoming", "past", "cancelled", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-medium border ${
              filter === f ? "bg-ink text-white border-ink" : "border-line text-muted hover:bg-black/5"
            }`}
          >
            {{ all: "Toutes", upcoming: "À venir", past: "Passées", cancelled: "Annulées" }[f]}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-line bg-surface overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Horaire</th>
              <th className="px-4 py-3 font-medium">Salle</th>
              <th className="px-4 py-3 font-medium">Motif</th>
              <th className="px-4 py-3 font-medium">Organisateur</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((b) => (
              <tr key={b.id} className={b.status === "cancelled" ? "opacity-50" : ""}>
                <td className="px-4 py-3">{new Date(b.start_time).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {formatTime(b.start_time)}–{formatTime(b.end_time)}
                </td>
                <td className="px-4 py-3">{b.room?.name ?? "—"}</td>
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3">{b.organizer?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {b.status === "confirmed" && new Date(b.start_time) >= now && (
                    <button
                      onClick={() => cancel(b.id)}
                      className="text-xs font-medium text-occupied hover:underline"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Aucune réservation dans cette catégorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
