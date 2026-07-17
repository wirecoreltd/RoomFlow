"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell, { type Language } from "@/components/AuthShell";

const pageText: Record<
  Language,
  {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submit: string;
    submitLoading: string;
    errorInvalid: string;
    noAccount: string;
    registerLink: string;
  }
> = {
  fr: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour consulter le planning et réserver une ressource.",
    emailLabel: "Email professionnel",
    emailPlaceholder: "prenom.nom@entreprise.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "••••••••",
    submit: "Se connecter",
    submitLoading: "Connexion...",
    errorInvalid: "Identifiants incorrects. Vérifiez votre email et mot de passe.",
    noAccount: "Pas encore de compte ?",
    registerLink: "Créer un compte",
  },
  en: {
    title: "Welcome back",
    subtitle: "Sign in to view the schedule and book a resource.",
    emailLabel: "Work email",
    emailPlaceholder: "firstname.lastname@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    submit: "Sign in",
    submitLoading: "Signing in...",
    errorInvalid: "Incorrect credentials. Check your email and password.",
    noAccount: "Don't have an account yet?",
    registerLink: "Create an account",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("fr");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = pageText[language];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(t.errorInvalid);
      return;
    }
    router.refresh();
    router.push("/planning");
  }

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} language={language} onLanguageChange={setLanguage}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="email">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder={t.emailPlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="password">
            {t.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder={t.passwordPlaceholder}
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
          {loading ? t.submitLoading : t.submit}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        {t.noAccount}{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          {t.registerLink}
        </Link>
      </p>
    </AuthShell>
  );
}
