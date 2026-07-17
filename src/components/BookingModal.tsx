"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Resource } from "@/lib/types";
import { formatTime } from "@/lib/utils";

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
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
  const [start, setStart] = useState(initialStart ? toLocalInput(initialStart) : "");
  const [end, setEnd] = useState(initialEnd ? toLocalInput(initialEnd) : "");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (new Date(end) <= new Date(start)) {
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
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {isViewMode && viewBooking ? (
          <>
            <h3 className="font-display text-xl mb-1">{viewBooking.title}</h3>
            <p className="text-sm text-muted mb-4">
              {formatTime(viewBooking.start_time)} – {formatTime(viewBooking.end_time)} ·{" "}
              {viewResource?.name}
            </p>
            <p className="text-sm text-text mb-6">
              Organisé par <strong>{viewBooking.organizer?.full_name ?? "—"}</strong>
            </p>
            {error && <p className="text-sm text-occupied mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm font-medium text-muted hover:bg-black/5"
              >
                Fermer
              </button>
              {canManage && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 rounded text-sm font-medium bg-occupied text-white hover:bg-occupied/90 disabled:opacity-60"
                >
                  {loading ? "Annulation..." : "Annuler la réservation"}
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreate}>
            <h3 className="font-display text-xl mb-4">Réserver un créneau</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Ressource</label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="w-full rounded border border-line px-3 py-2 text-sm"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.capacity ? ` (${r.capacity} pers.)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Début</label>
                  <input
                    type="datetime-local"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full rounded border border-line px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fin</label>
                  <input
                    type="datetime-local"
                    required
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full rounded border border-line px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motif de la réunion</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Point équipe, entretien, atelier..."
                  className="w-full rounded border border-line px-3 py-2 text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-occupied bg-occupied-light border border-occupied/20 rounded px-3 py-2 mt-4">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-sm font-medium text-muted hover:bg-black/5"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded text-sm font-medium bg-ink text-white hover:bg-black disabled:opacity-60"
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
