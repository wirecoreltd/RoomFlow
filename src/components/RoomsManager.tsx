"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/types";

const emptyForm = {
  name: "",
  capacity: 4,
  location: "",
  color: "#0E7C7B",
  opening_time: "08:00",
  closing_time: "19:00",
  equipment: "",
};

export default function RoomsManager({ initialRooms }: { initialRooms: Room[] }) {
  const router = useRouter();
  const [rooms, setRooms] = useState(initialRooms);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        equipment: form.equipment
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible de créer la salle. Vérifiez que vous êtes bien administrateur.");
      return;
    }
    const { data } = await res.json();
    setRooms((r) => [...r, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(emptyForm);
    setShowForm(false);
    router.refresh();
  }

  async function toggleActive(room: Room) {
    const res = await fetch(`/api/rooms/${room.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !room.is_active }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setRooms((rs) => rs.map((r) => (r.id === room.id ? data : r)));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded bg-ink text-white text-sm font-medium hover:bg-black"
        >
          {showForm ? "Fermer" : "+ Ajouter une salle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
                placeholder="Salle Denali"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacité</label>
              <input
                type="number"
                min={1}
                required
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Localisation</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
                placeholder="3e étage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Couleur</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-9 rounded border border-line px-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ouverture</label>
              <input
                type="time"
                value={form.opening_time}
                onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fermeture</label>
              <input
                type="time"
                value={form.closing_time}
                onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Équipements (séparés par des virgules)</label>
              <input
                value={form.equipment}
                onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
                placeholder="Écran, Visioconférence, Paperboard"
              />
            </div>
          </div>
          {error && <p className="text-sm text-occupied">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer la salle"}
          </button>
        </form>
      )}

      <div className="rounded-lg border border-line bg-surface divide-y divide-line">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: room.color }} />
              <div>
                <div className="text-sm font-medium">{room.name}</div>
                <div className="text-xs text-muted">
                  {room.capacity} pers. · {room.location || "—"} · {room.opening_time.slice(0, 5)}–
                  {room.closing_time.slice(0, 5)}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleActive(room)}
              className={`text-xs font-medium px-3 py-1.5 rounded border ${
                room.is_active
                  ? "border-line text-muted hover:border-occupied hover:text-occupied"
                  : "border-brand/30 text-brand hover:bg-brand-light"
              }`}
            >
              {room.is_active ? "Désactiver" : "Réactiver"}
            </button>
          </div>
        ))}
        {rooms.length === 0 && <p className="px-5 py-6 text-sm text-muted">Aucune salle pour le moment.</p>}
      </div>
    </div>
  );
}
