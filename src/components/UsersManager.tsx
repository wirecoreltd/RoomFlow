"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function UsersManager({
  initialProfiles,
  currentUserId,
}: {
  initialProfiles: Profile[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole(profile: Profile) {
    if (profile.id === currentUserId) {
      setError("Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    const newRole = profile.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profile.id);
    if (error) {
      setError("Impossible de modifier ce rôle.");
      return;
    }
    setProfiles((ps) => ps.map((p) => (p.id === profile.id ? { ...p, role: newRole } : p)));
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-occupied bg-occupied-light border border-occupied/20 rounded px-3 py-2">
          {error}
        </p>
      )}
      <div className="rounded-lg border border-line bg-surface divide-y divide-line">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center text-xs font-semibold">
                {initials(p.full_name)}
              </span>
              <div>
                <div className="text-sm font-medium">
                  {p.full_name} {p.id === currentUserId && <span className="text-muted">(vous)</span>}
                </div>
                <div className="text-xs text-muted">{p.email}</div>
              </div>
            </div>
            <button
              onClick={() => toggleRole(p)}
              disabled={p.id === currentUserId}
              className={`text-xs font-medium px-3 py-1.5 rounded border disabled:opacity-40 ${
                p.role === "admin"
                  ? "border-brand/30 text-brand bg-brand-light"
                  : "border-line text-muted hover:bg-black/5"
              }`}
            >
              {p.role === "admin" ? "Administrateur" : "Utilisateur"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
