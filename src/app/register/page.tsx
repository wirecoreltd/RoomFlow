"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message === "User already registered" ? "Un compte existe déjà avec cet email." : "Impossible de créer le compte. Réessayez.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title="Compte créé" subtitle="Vérifiez votre boîte mail pour confirmer votre adresse.">
        <div className="rounded border border-brand/20 bg-brand-light px-4 py-3 text-sm text-brand-dark">
          Un email de confirmation vient d&apos;être envoyé à <strong>{email}</strong>. Une fois confirmé,
          vous pourrez vous connecter.
        </div>
        <p className="text-sm text-muted mt-6 text-center">
          <Link href="/login" className="text-brand font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Créer un compte" subtitle="Réservez vos salles de réunion en quelques secondes.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="fullName">
            Nom complet
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder="Marie Dupont"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="email">
            Email professionnel
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder="prenom.nom@entreprise.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder="6 caractères minimum"
          />
        </div>

        {error && (
          <p className="text-sm text-occupied bg-occupied-light border border-occupied/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-ink text-white text-sm font-medium py-2.5 hover:bg-black transition-colors disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
