"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Resource, ResourceType } from "@/lib/types";

const typeLabels: Record<ResourceType, string> = {
  room: "Salle de réunion",
  desk: "Bureau (hot desk)",
  parking: "Parking",
  vehicle: "Véhicule",
  equipment: "Matériel",
  other: "Autre",
  customType: "",
};

const emptyForm = {
  type: "room" as ResourceType,
  name: "",
  capacity: "" as string | number,
  location: "",
  color: "#0E7C7B",
  opening_time: "08:00",
  closing_time: "23:00",
  equipment: "",
};

export default function ResourcesManager({ initialResources }: { initialResources: Resource[] }) {
  const router = useRouter();
  const [resources, setResources] = useState(initialResources);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        capacity: form.capacity === "" ? null : Number(form.capacity),
        custom_type: form.type === "other" ? form.customType.trim() || null : null,
        equipment: form.equipment.split(",").map((e) => e.trim()).filter(Boolean),
      }),  
    });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible de créer la ressource. Vérifiez que vous êtes bien administrateur.");
      return;
    }
    const { data } = await res.json();
    setResources((r) => [...r, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(emptyForm);
    setShowForm(false);
    router.refresh();
  }

  async function toggleActive(resource: Resource) {
    const res = await fetch(`/api/resources/${resource.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !resource.is_active }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setResources((rs) => rs.map((r) => (r.id === resource.id ? data : r)));
      router.refresh();
    }
  }

  const showCapacity = form.type === "room" || form.type === "desk" || form.type === "vehicle";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded bg-ink text-white text-sm font-medium hover:bg-black"
        >
          {showForm ? "Fermer" : "+ Ajouter une ressource"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
              >
                {(Object.keys(typeLabels) as ResourceType[]).map((t) => (
                  <option key={t} value={t}>
                    {typeLabels[t]}
                  </option>
                ))}
              </select>
            </div>
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
            {showCapacity && (
              <div>
                <label className="block text-sm font-medium mb-1">Capacité</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full rounded border border-line px-3 py-2 text-sm"
                />
              </div>
            )}
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
            {loading ? "Création..." : "Créer la ressource"}
          </button>
        </form>
      )}

      <div className="rounded-lg border border-line bg-surface divide-y divide-line">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: resource.color }} />
              <div>
                <div className="text-sm font-medium">
                  {resource.name}{" "}
                  <span className="text-xs text-muted font-normal">({typeLabels[resource.type]})</span>
                </div>
                <div className="text-xs text-muted">
                  {resource.capacity ? `${resource.capacity} pers. · ` : ""}
                  {resource.location || "—"} · {resource.opening_time.slice(0, 5)}–
                  {resource.closing_time.slice(0, 5)}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleActive(resource)}
              className={`text-xs font-medium px-3 py-1.5 rounded border ${
                resource.is_active
                  ? "border-line text-muted hover:border-occupied hover:text-occupied"
                  : "border-brand/30 text-brand hover:bg-brand-light"
              }`}
            >
              {resource.is_active ? "Désactiver" : "Réactiver"}
            </button>
          </div>
        ))}
        {resources.length === 0 && <p className="px-5 py-6 text-sm text-muted">Aucune ressource pour le moment.</p>}
      </div>
    </div>
  );
}
