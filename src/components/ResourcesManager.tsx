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
        equipment: form.equipment
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
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
