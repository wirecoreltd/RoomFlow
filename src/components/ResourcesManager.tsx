"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Resource, ResourceType, CustomType } from "@/lib/types";

type TypeConfig = {
  label: string;
  namePlaceholder: string;
  hasSchedule: boolean;
  hasCapacity: boolean;
};

const typeConfig: Record<ResourceType, TypeConfig> = {
  room: { label: "Salle de réunion", namePlaceholder: "Salle Denali", hasSchedule: true, hasCapacity: true },
  desk: { label: "Bureau (hot desk)", namePlaceholder: "Bureau 12", hasSchedule: true, hasCapacity: true },
  parking: { label: "Parking", namePlaceholder: "Place P3", hasSchedule: true, hasCapacity: false },
  vehicle: {
    label: "Véhicule",
    namePlaceholder: "Renault Clio – AB-123-CD",
    hasSchedule: true,
    hasCapacity: true,
  },
  equipment: {
    label: "Matériel",
    namePlaceholder: "Vidéoprojecteur portable",
    hasSchedule: false,
    hasCapacity: false,
  },
  printer: { label: "Imprimante", namePlaceholder: "Imprimante 2e étage", hasSchedule: false, hasCapacity: false },
  tv: { label: "Télévision / Écran", namePlaceholder: "Écran salle de pause", hasSchedule: false, hasCapacity: false },
  projector: { label: "Projecteur", namePlaceholder: "Projecteur mobile", hasSchedule: false, hasCapacity: false },
  other: { label: "Autre", namePlaceholder: "Nom de la ressource", hasSchedule: false, hasCapacity: false },
};

const baseTypeOrder: ResourceType[] = [
  "room",
  "desk",
  "parking",
  "vehicle",
  "equipment",
  "printer",
  "tv",
  "projector",
  "other",
];

const CUSTOM_PREFIX = "custom:";

const emptyFieldForm = {
  name: "",
  capacity: "" as string | number,
  location: "",
  color: "#0E7C7B",
  opening_time: "08:00",
  closing_time: "23:00",
  equipment: "",
};

export default function ResourcesManager({
  initialResources,
  initialCustomTypes,
}: {
  initialResources: Resource[];
  initialCustomTypes: CustomType[];
}) {
  const router = useRouter();
  const [resources, setResources] = useState(initialResources);
  const [customTypes, setCustomTypes] = useState(initialCustomTypes);

  const [typeChoice, setTypeChoice] = useState<string>("room"); // ResourceType | `custom:<name>`
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [saveCustomType, setSaveCustomType] = useState(true);
  const [fields, setFields] = useState(emptyFieldForm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isGenericOther = typeChoice === "other";
  const isSavedCustom = typeChoice.startsWith(CUSTOM_PREFIX);
  const resourceType: ResourceType = isSavedCustom ? "other" : (typeChoice as ResourceType);
  const config = typeConfig[resourceType];
  const resolvedCustomTypeName = isSavedCustom
    ? typeChoice.slice(CUSTOM_PREFIX.length)
    : isGenericOther
    ? customTypeInput.trim()
    : null;

  const sortedCustomTypes = useMemo(
    () => [...customTypes].sort((a, b) => a.name.localeCompare(b.name)),
    [customTypes]
  );

  function resetForm() {
    setTypeChoice("room");
    setCustomTypeInput("");
    setSaveCustomType(true);
    setFields(emptyFieldForm);
    setEditingId(null);
    setError(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(resource: Resource) {
    setEditingId(resource.id);
    setTypeChoice(
      resource.type === "other" && resource.custom_type ? `${CUSTOM_PREFIX}${resource.custom_type}` : resource.type
    );
    setCustomTypeInput("");
    setSaveCustomType(false); // déjà connu si on édite une ressource existante
    setFields({
      name: resource.name,
      capacity: resource.capacity ?? "",
      location: resource.location ?? "",
      color: resource.color,
      opening_time: resource.opening_time.slice(0, 5),
      closing_time: resource.closing_time.slice(0, 5),
      equipment: resource.equipment.join(", "),
    });
    setError(null);
    setShowForm(true);
  }

  async function ensureCustomTypeSaved(name: string) {
    if (customTypes.some((c) => c.name === name)) return;
    const res = await fetch("/api/custom-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setCustomTypes((c) => [...c, data]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isGenericOther && !customTypeInput.trim()) {
      setError("Veuillez préciser le type.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      type: resourceType,
      custom_type: resolvedCustomTypeName || null,
      name: fields.name,
      capacity: config.hasCapacity && fields.capacity !== "" ? Number(fields.capacity) : null,
      location: fields.location,
      color: fields.color,
      opening_time: config.hasSchedule ? fields.opening_time : "00:00",
      closing_time: config.hasSchedule ? fields.closing_time : "23:59",
      equipment: fields.equipment
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    };

    const res = await fetch(editingId ? `/api/resources/${editingId}` : "/api/resources", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Échec de l'enregistrement. Vérifiez que vous êtes bien administrateur.");
      return;
    }
    const { data } = await res.json();

    setResources((rs) => {
      const next = editingId ? rs.map((r) => (r.id === editingId ? data : r)) : [...rs, data];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });

    if (isGenericOther && saveCustomType && resolvedCustomTypeName) {
      await ensureCustomTypeSaved(resolvedCustomTypeName);
    }

    resetForm();
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
          className="px-4 py-2 rounded bg-ink text-white text-sm font-medium hover:bg-black"
        >
          {showForm ? "Fermer" : "+ Ajouter une ressource"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-surface p-5 space-y-3">
          {editingId && <p className="text-xs font-medium text-brand">Modification d&apos;une ressource existante</p>}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={typeChoice}
                onChange={(e) => setTypeChoice(e.target.value)}
                className="w-full rounded border border-line px-3 py-2 text-sm"
              >
                {baseTypeOrder.map((t) => (
                  <option key={t} value={t}>
                    {typeConfig[t].label}
                  </option>
                ))}
                {sortedCustomTypes.length > 0 && (
                  <optgroup label="Types personnalisés enregistrés">
                    {sortedCustomTypes.map((ct) => (
                      <option key={ct.id} value={`${CUSTOM_PREFIX}${ct.name}`}>
                        {ct.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {isGenericOther && (
              <div>
                <label className="block text-sm font-medium mb-1">Préciser le type</label>
                <input
                  required
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  className="w-full rounded border border-line px-3 py-2 text-sm"
                  placeholder="Ex : Casier, Badge, Salle de sport"
                />
                <label className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={saveCustomType}
                    onChange={(e) => setSaveCustomType(e.target.checked)}
                  />
                  Enregistrer ce type pour la prochaine fois
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                required
                value={fields.name}
                onChange={(e) => setFields({ ...fields, name: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
                placeholder={config.namePlaceholder}
              />
            </div>

            {config.hasCapacity && (
              <div>
                <label className="block text-sm font-medium mb-1">Capacité</label>
                <input
                  type="number"
                  min={1}
                  value={fields.capacity}
                  onChange={(e) => setFields({ ...fields, capacity: e.target.value })}
                  className="w-full rounded border border-line px-3 py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Localisation</label>
              <input
                value={fields.location}
                onChange={(e) => setFields({ ...fields, location: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
                placeholder="3e étage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Couleur</label>
              <input
                type="color"
                value={fields.color}
                onChange={(e) => setFields({ ...fields, color: e.target.value })}
                className="w-full h-9 rounded border border-line px-1"
              />
            </div>

            {config.hasSchedule && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Ouverture</label>
                  <input
                    type="time"
                    value={fields.opening_time}
                    onChange={(e) => setFields({ ...fields, opening_time: e.target.value })}
                    className="w-full rounded border border-line px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fermeture</label>
                  <input
                    type="time"
                    value={fields.closing_time}
                    onChange={(e) => setFields({ ...fields, closing_time: e.target.value })}
                    className="w-full rounded border border-line px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Équipements (séparés par des virgules)</label>
              <input
                value={fields.equipment}
                onChange={(e) => setFields({ ...fields, equipment: e.target.value })}
                className="w-full rounded border border-line px-3 py-2 text-sm"
                placeholder="Écran, Visioconférence, Paperboard"
              />
            </div>
          </div>

          {error && <p className="text-sm text-occupied">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Créer la ressource"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 rounded border border-line text-sm font-medium text-muted hover:bg-black/5"
              >
                Annuler
              </button>
            )}
          </div>
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
                  <span className="text-xs text-muted font-normal">
                    ({resource.type === "other" ? resource.custom_type || "Autre" : typeConfig[resource.type].label})
                  </span>
                </div>
                <div className="text-xs text-muted">
                  {resource.capacity ? `${resource.capacity} pers. · ` : ""}
                  {resource.location || "—"}
                  {typeConfig[resource.type].hasSchedule
                    ? ` · ${resource.opening_time.slice(0, 5)}–${resource.closing_time.slice(0, 5)}`
                    : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditForm(resource)}
                className="text-xs font-medium px-3 py-1.5 rounded border border-line text-muted hover:border-brand hover:text-brand"
              >
                Modifier
              </button>
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
          </div>
        ))}
        {resources.length === 0 && <p className="px-5 py-6 text-sm text-muted">Aucune ressource pour le moment.</p>}
      </div>
    </div>
  );
}
