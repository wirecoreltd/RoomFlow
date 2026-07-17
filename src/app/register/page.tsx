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
    companyNameLabel: string;
    companyNamePlaceholder: string;
    companyNameHint: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submit: string;
    submitLoading: string;
    alreadyRegistered: string;
    loginLink: string;
    errorExists: string;
    errorGeneric: string;
    doneTitle: string;
    doneSubtitle: string;
    doneMessagePrefix: string;
    doneMessageSuffix: string;
    backToLogin: string;
  }
> = {
  fr: {
    title: "Créer un compte",
    subtitle: "Réservez vos ressources en quelques secondes.",
    companyNameLabel: "Nom de la société",
    companyNamePlaceholder: "Acme SARL",
    companyNameHint:
      "Un espace privé sera créé pour votre société. Vos données ne seront jamais visibles par les autres sociétés.",
    fullNameLabel: "Nom complet",
    fullNamePlaceholder: "Marie Dupont",
    emailLabel: "Email professionnel",
    emailPlaceholder: "prenom.nom@entreprise.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "6 caractères minimum",
    submit: "Créer mon compte",
    submitLoading: "Création...",
    alreadyRegistered: "Déjà inscrit ?",
    loginLink: "Se connecter",
    errorExists: "Un compte existe déjà avec cet email.",
    errorGeneric: "Impossible de créer le compte. Réessayez.",
    doneTitle: "Compte créé",
    doneSubtitle: "Vérifiez votre boîte mail pour confirmer votre adresse.",
    doneMessagePrefix: "Un email de confirmation vient d'être envoyé à",
    doneMessageSuffix: "Une fois confirmé, vous pourrez vous connecter.",
    backToLogin: "Retour à la connexion",
  },
  en: {
    title: "Create an account",
    subtitle: "Book your resources in seconds.",
    companyNameLabel: "Company name",
    companyNamePlaceholder: "Acme Ltd",
    companyNameHint: "A private workspace will be created for your company. Your data is never visible to other companies.",
    fullNameLabel: "Full name",
    fullNamePlaceholder: "Jane Smith",
    emailLabel: "Work email",
    emailPlaceholder: "firstname.lastname@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "6 characters minimum",
    submit: "Create my account",
    submitLoading: "Creating...",
    alreadyRegistered: "Already have an account?",
    loginLink: "Sign in",
    errorExists: "An account already exists with this email.",
    errorGeneric: "Could not create the account. Please try again.",
    doneTitle: "Account created",
    doneSubtitle: "Check your inbox to confirm your address.",
    doneMessagePrefix: "A confirmation email was just sent to",
    doneMessageSuffix: "Once confirmed, you'll be able to sign in.",
    backToLogin: "Back to sign in",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("fr");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = pageText[language];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          language,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message === "User already registered" ? t.errorExists : t.errorGeneric);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title={t.doneTitle} subtitle={t.doneSubtitle} language={language} onLanguageChange={setLanguage}>
        <div className="rounded border border-brand/20 bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {t.doneMessagePrefix} <strong>{email}</strong>. {t.doneMessageSuffix}
        </div>
        <p className="text-sm text-muted mt-6 text-center">
          <Link href="/login" className="text-brand font-medium hover:underline">
            {t.backToLogin}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} language={language} onLanguageChange={setLanguage}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="companyName">
            {t.companyNameLabel}
          </label>
          <input
            id="companyName"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder={t.companyNamePlaceholder}
          />
          <p className="text-xs text-muted mt-1">{t.companyNameHint}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1" htmlFor="fullName">
            {t.fullNameLabel}
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brand outline-none"
            placeholder={t.fullNamePlaceholder}
          />
        </div>

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
            minLength={6}
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
        {t.alreadyRegistered}{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          {t.loginLink}
        </Link>
      </p>
    </AuthShell>
  );
}
