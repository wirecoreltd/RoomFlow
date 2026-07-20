"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Resource } from "@/lib/types";
import { formatTime } from "@/lib/utils";

function toDateInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BookingModal({
  resources,
  initialResourceId,
  initialStart,
  initialEnd,
  viewBooking,
  canManage,
  onClose,
  onCreated,
  onCancelled,
}: {
  resources: Resource[];
  initialResourceId?: string;
  initialStart?: Date;
  initialEnd?: Date;
  viewBooking?: Booking;
  canManage?: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onCancelled?: () => void;
}) {
  const router = useRouter();
  const isViewMode = !!viewBooking;

  const [resourceId, setResourceId] = useState(initialResourceId ?? resources[0]?.id ?? "");
  const [date, setDate] = useState(initialStart ? toDateInput(initialStart) : toDateInput(new Date()));
  const [startTime, setStartTime] = useState(initialStart ? toTimeInput(initialStart) : "09:00");
  const [endTime, setEndTime] = useState(initialEnd ? toTimeInput(initialEnd) : "10:00");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (end <= start) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource_id: resourceId,
        title,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(
        res.status === 409
          ? "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez un autre horaire."
          : body.error ?? "Impossible de créer la réservation."
      );
      return;
    }
    router.refresh();
    onCreated?.();
  }

  async function handleCancel() {
    if (!viewBooking) return;
    setLoading(true);
    const res = await fetch(`/api/bookings/${viewBooking.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible d'annuler cette réservation.");
      return;
    }
    router.refresh();
    onCancelled?.();
  }

  const viewResource = viewBooking ? resources.find((r) => r.id === viewBooking.resource_id) : undefined;
  const selectedResource = resources.find((r) => r.id === resourceId);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {isViewMode && viewBooking ? (
          <>
            <h3 className="text-xl font-semibold text-ink mb-1">{viewBooking.title}</h3>
            <p className="text-sm text-muted mb-4">
              {formatTime(viewBooking.start_time)} – {formatTime(viewBooking.end_time)} ·{" "}
              {viewResource?.name}
            </p>
            <p className="text-sm text-ink mb-6">
              Organisé par <span className="font-medium">{viewBooking.organizer?.full_name ?? "—"}</span>
            </p>
            {error && <p className="text-sm text-occupied mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:bg-black/5 transition-colors"
              >
                Fermer
              </button>
              {canManage && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-occupied text-white hover:bg-occupied/90 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Annulation..." : "Annuler la réservation"}
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreate}>
            <h3 className="text-xl font-semibold text-ink mb-4">Réserver un créneau</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-ink">Ressource</label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.capacity ? ` (${r.capacity} pers.)` : ""}
                    </option>
                  ))}
                </select>
                {selectedResource && (
                  <p className="text-xs text-muted mt-1.5">
                    Disponible de {selectedResource.opening_time.slice(0, 5)} à{" "}
                    {selectedResource.closing_time.slice(0, 5)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-ink">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-ink">Heure de début</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-ink">Heure de fin</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-ink">Motif de la réunion</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Point équipe, entretien, atelier..."
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-occupied bg-occupied-light border border-occupied/20 rounded-lg px-3 py-2 mt-4">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-black/5 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-60 transition-colors"
              >
                {loading ? "Réservation..." : "Confirmer la réservation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
