"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
      return;
    }
    router.refresh();
    router.push("/planning");
  }

  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous pour consulter le planning et réserver une salle."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder="••••••••"
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
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
