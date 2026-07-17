"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Armchair,
  ParkingSquare,
  Car,
  Wrench,
  Printer,
  Tv,
  Projector,
  Package,
  Plus,
  X,
  Pencil,
  Ban,
  RotateCcw,
} from "lucide-react";
import type { Resource, ResourceType, CustomType } from "@/lib/types";
import { usePersistedLanguage } from "@/hooks/useLanguage";

type Language = "fr" | "en";

type TypeConfig = {
  label: Record<Language, string>;
  namePlaceholder: Record<Language, string>;
  hasSchedule: boolean;
  hasCapacity: boolean;
  color: string;
  Icon: typeof Building2;
};

const typeConfig: Record<ResourceType, TypeConfig> = {
  room: {
    label: { fr: "Salle de réunion", en: "Meeting room" },
    namePlaceholder: { fr: "Salle Denali", en: "Denali Room" },
    hasSchedule: true,
    hasCapacity: true,
    color: "#4F46E5",
    Icon: Building2,
  },
  desk: {
    label: { fr: "Bureau (hot desk)", en: "Desk (hot desk)" },
    namePlaceholder: { fr: "Bureau 12", en: "Desk 12" },
    hasSchedule: true,
    hasCapacity: true,
    color: "#0D9488",
    Icon: Armchair,
  },
  parking: {
    label: { fr: "Parking", en: "Parking" },
    namePlaceholder: { fr: "Place P3", en: "Spot P3" },
    hasSchedule: true,
    hasCapacity: false,
    color: "#D97706",
    Icon: ParkingSquare,
  },
  vehicle: {
    label: { fr: "Véhicule", en: "Vehicle" },
    namePlaceholder: { fr: "Renault Clio – AB-123-CD", en: "Toyota Corolla – AB-123-CD" },
    hasSchedule: true,
    hasCapacity: true,
    color: "#E11D48",
    Icon: Car,
  },
  equipment: {
    label: { fr: "Matériel", en: "Equipment" },
    namePlaceholder: { fr: "Vidéoprojecteur portable", en: "Portable projector kit" },
    hasSchedule: false,
    hasCapacity: false,
    color: "#475569",
    Icon: Wrench,
  },
  printer: {
    label: { fr: "Imprimante", en: "Printer" },
    namePlaceholder: { fr: "Imprimante 2e étage", en: "2nd floor printer" },
    hasSchedule: false,
    hasCapacity: false,
    color: "#0284C7",
    Icon: Printer,
  },
  tv: {
    label: { fr: "Télévision / Écran", en: "TV / Screen" },
    namePlaceholder: { fr: "Écran salle de pause", en: "Break room screen" },
    hasSchedule: false,
    hasCapacity: false,
    color: "#7C3AED",
    Icon: Tv,
  },
  projector: {
    label: { fr: "Projecteur", en: "Projector" },
    namePlaceholder: { fr: "Projecteur mobile", en: "Mobile projector" },
    hasSchedule: false,
    hasCapacity: false,
    color: "#EA580C",
    Icon: Projector,
  },
  other: {
    label: { fr: "Autre", en: "Other" },
    namePlaceholder: { fr: "Nom de la ressource", en: "Resource name" },
    hasSchedule: false,
    hasCapacity: false,
    color: "#78716C",
    Icon: Package,
  },
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

const uiText: Record<
  Language,
  {
    pageTitle: string;
    pageSubtitle: string;
    addButton: string;
    closeButton: string;
    editingBadge: string;
    typeLabel: string;
    customTypeLabel: string;
    customTypePlaceholder: string;
    saveCustomType: string;
    savedTypesGroup: string;
    nameLabel: string;
    capacityLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    colorLabel: string;
    openingLabel: string;
    closingLabel: string;
    equipmentLabel: string;
    equipmentPlaceholder: string;
    errorPrecise: string;
    errorSubmit: string;
    submitCreate: string;
    submitSaving: string;
    submitEdit: string;
    cancel: string;
    edit: string;
    deactivate: string;
    reactivate: string;
    empty: string;
    filterAll: string;
    people: string;
    statActive: (n: number) => string;
  }
> = {
  fr: {
    pageTitle: "Gestion des ressources",
    pageSubtitle: "Salles, bureaux, parkings, véhicules, matériel — un seul endroit pour tout gérer.",
    addButton: "Ajouter une ressource",
    closeButton: "Fermer",
    editingBadge: "Modification d'une ressource existante",
    typeLabel: "Type",
    customTypeLabel: "Préciser le type",
    customTypePlaceholder: "Ex : Casier, Badge, Salle de sport",
    saveCustomType: "Enregistrer ce type pour la prochaine fois",
    savedTypesGroup: "Types personnalisés enregistrés",
    nameLabel: "Nom",
    capacityLabel: "Capacité",
    locationLabel: "Localisation",
    locationPlaceholder: "3e étage",
    colorLabel: "Couleur",
    openingLabel: "Ouverture",
    closingLabel: "Fermeture",
    equipmentLabel: "Équipements (séparés par des virgules)",
    equipmentPlaceholder: "Écran, Visioconférence, Paperboard",
    errorPrecise: "Veuillez préciser le type.",
    errorSubmit: "Échec de l'enregistrement. Vérifiez que vous êtes bien administrateur.",
    submitCreate: "Créer la ressource",
    submitSaving: "Enregistrement...",
    submitEdit: "Enregistrer les modifications",
    cancel: "Annuler",
    edit: "Modifier",
    deactivate: "Désactiver",
    reactivate: "Réactiver",
    empty: "Aucune ressource pour le moment.",
    filterAll: "Toutes",
    people: "pers.",
    statActive: (n) => `${n} ressource${n > 1 ? "s" : ""} active${n > 1 ? "s" : ""}`,
  },
  en: {
    pageTitle: "Resource management",
    pageSubtitle: "Rooms, desks, parking, vehicles, equipment — one place to manage it all.",
    addButton: "Add a resource",
    closeButton: "Close",
    editingBadge: "Editing an existing resource",
    typeLabel: "Type",
    customTypeLabel: "Specify the type",
    customTypePlaceholder: "e.g. Locker, Badge, Gym",
    saveCustomType: "Save this type for next time",
    savedTypesGroup: "Saved custom types",
    nameLabel: "Name",
    capacityLabel: "Capacity",
    locationLabel: "Location",
    locationPlaceholder: "3rd floor",
    colorLabel: "Color",
    openingLabel: "Opens",
    closingLabel: "Closes",
    equipmentLabel: "Amenities (comma-separated)",
    equipmentPlaceholder: "Screen, Video conferencing, Whiteboard",
    errorPrecise: "Please specify the type.",
    errorSubmit: "Save failed. Make sure you're signed in as an administrator.",
    submitCreate: "Create resource",
    submitSaving: "Saving...",
    submitEdit: "Save changes",
    cancel: "Cancel",
    edit: "Edit",
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    empty: "No resources yet.",
    filterAll: "All",
    people: "people",
    statActive: (n) => `${n} active resource${n > 1 ? "s" : ""}`,
  },
};

const emptyFieldForm = {
  name: "",
  capacity: "" as string | number,
  location: "",
  color: "#4F46E5",
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
  const [language] = usePersistedLanguage();
  const t = uiText[language];

  const [resources, setResources] = useState(initialResources);
  const [customTypes, setCustomTypes] = useState(initialCustomTypes);
  const [activeFilter, setActiveFilter] = useState<ResourceType | "all">("all");

  const [typeChoice, setTypeChoice] = useState<string>("room");
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

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<ResourceType, number>> = {};
    for (const r of resources) counts[r.type] = (counts[r.type] ?? 0) + 1;
    return counts;
  }, [resources]);

  const presentTypes = baseTypeOrder.filter((ty) => typeCounts[ty]);

  const filteredResources = useMemo(
    () => (activeFilter === "all" ? resources : resources.filter((r) => r.type === activeFilter)),
    [resources, activeFilter]
  );

  const activeCount = resources.filter((r) => r.is_active).length;

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
    setSaveCustomType(false);
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
      setError(t.errorPrecise);
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
      setError(t.errorSubmit);
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">{t.pageTitle}</h1>
          <p className="text-sm text-muted mt-1">{t.pageSubtitle}</p>
          <p className="text-xs text-brand font-medium mt-2">{t.statActive(activeCount)}</p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand/20 hover:bg-brand-dark transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? t.closeButton : t.addButton}
        </button>
      </div>

      {/* Filtres colorés = légende des types */}
      {presentTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              activeFilter === "all"
                ? "bg-ink text-white border-ink"
                : "bg-surface text-muted border-line hover:border-ink/30"
            }`}
          >
            {t.filterAll} · {resources.length}
          </button>
          {presentTypes.map((ty) => {
            const cfg = typeConfig[ty];
            const isActive = activeFilter === ty;
            return (
              <button
                key={ty}
                onClick={() => setActiveFilter(isActive ? "all" : ty)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all flex items-center gap-1.5"
                style={
                  isActive
                    ? { backgroundColor: cfg.color, borderColor: cfg.color, color: "white" }
                    : { backgroundColor: `${cfg.color}14`, borderColor: `${cfg.color}33`, color: cfg.color }
                }
              >
                <cfg.Icon size={13} />
                {cfg.label[language]} · {typeCounts[ty]}
              </button>
            );
          })}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-sm"
        >
          {editingId && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand bg-brand-light rounded-full px-3 py-1">
              <Pencil size={12} /> {t.editingBadge}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">{t.typeLabel}</label>
              <select
                value={typeChoice}
                onChange={(e) => setTypeChoice(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
              >
                {baseTypeOrder.map((ty) => (
                  <option key={ty} value={ty}>
                    {typeConfig[ty].label[language]}
                  </option>
                ))}
                {sortedCustomTypes.length > 0 && (
                  <optgroup label={t.savedTypesGroup}>
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
                <label className="block text-sm font-medium mb-1.5 text-ink">{t.customTypeLabel}</label>
                <input
                  required
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                  placeholder={t.customTypePlaceholder}
                />
                <label className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={saveCustomType}
                    onChange={(e) => setSaveCustomType(e.target.checked)}
                    className="accent-brand"
                  />
                  {t.saveCustomType}
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">{t.nameLabel}</label>
              <input
                required
                value={fields.name}
                onChange={(e) => setFields({ ...fields, name: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                placeholder={config.namePlaceholder[language]}
              />
            </div>

            {config.hasCapacity && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-ink">{t.capacityLabel}</label>
                <input
                  type="number"
                  min={1}
                  value={fields.capacity}
                  onChange={(e) => setFields({ ...fields, capacity: e.target.value })}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">{t.locationLabel}</label>
              <input
                value={fields.location}
                onChange={(e) => setFields({ ...fields, location: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                placeholder={t.locationPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">{t.colorLabel}</label>
              <input
                type="color"
                value={fields.color}
                onChange={(e) => setFields({ ...fields, color: e.target.value })}
                className="w-full h-10 rounded-lg border border-line px-1"
              />
            </div>

            {config.hasSchedule && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-ink">{t.openingLabel}</label>
                  <input
                    type="time"
                    value={fields.opening_time}
                    onChange={(e) => setFields({ ...fields, opening_time: e.target.value })}
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-ink">{t.closingLabel}</label>
                  <input
                    type="time"
                    value={fields.closing_time}
                    onChange={(e) => setFields({ ...fields, closing_time: e.target.value })}
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-ink">{t.equipmentLabel}</label>
              <input
                value={fields.equipment}
                onChange={(e) => setFields({ ...fields, equipment: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper focus:border-brand outline-none transition-colors"
                placeholder={t.equipmentPlaceholder}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-occupied bg-occupied-light border border-occupied/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium shadow-sm shadow-brand/20 hover:bg-brand-dark disabled:opacity-60 transition-colors"
            >
              {loading ? t.submitSaving : editingId ? t.submitEdit : t.submitCreate}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-muted hover:bg-black/5 transition-colors"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      )}

      {/* Grille de cartes */}
      {filteredResources.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const cfg = typeConfig[resource.type];
            const Icon = cfg.Icon;
            const typeLabel = resource.type === "other" ? resource.custom_type || cfg.label[language] : cfg.label[language];
            return (
              <div
                key={resource.id}
                className={`relative rounded-2xl border bg-surface p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                  resource.is_active ? "border-line" : "border-line opacity-60"
                }`}
              >
                <span
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ backgroundColor: resource.color || cfg.color }}
                />
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${(resource.color || cfg.color)}18`, color: resource.color || cfg.color }}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink truncate">{resource.name}</h3>
                      {!resource.is_active && (
                        <span className="text-[10px] uppercase tracking-wide text-muted bg-black/5 rounded px-1.5 py-0.5 shrink-0">
                          {language === "fr" ? "Inactif" : "Inactive"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{typeLabel}</p>
                    <p className="text-xs text-muted mt-2 leading-relaxed">
                      {resource.capacity ? `${resource.capacity} ${t.people} · ` : ""}
                      {resource.location || "—"}
                      {cfg.hasSchedule
                        ? ` · ${resource.opening_time.slice(0, 5)}–${resource.closing_time.slice(0, 5)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line">
                  <button
                    onClick={() => openEditForm(resource)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-muted hover:bg-brand-light hover:text-brand transition-colors"
                  >
                    <Pencil size={13} /> {t.edit}
                  </button>
                  <button
                    onClick={() => toggleActive(resource)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ml-auto ${
                      resource.is_active
                        ? "text-muted hover:bg-occupied-light hover:text-occupied"
                        : "text-brand hover:bg-brand-light"
                    }`}
                  >
                    {resource.is_active ? <Ban size={13} /> : <RotateCcw size={13} />}
                    {resource.is_active ? t.deactivate : t.reactivate}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface/50 py-14 text-center">
          <p className="text-sm text-muted">{t.empty}</p>
        </div>
      )}
    </div>
  );
}
