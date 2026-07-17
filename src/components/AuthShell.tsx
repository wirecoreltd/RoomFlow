"use client";

import { useEffect, useState } from "react";

export type Language = "fr" | "en";

const shellText: Record<Language, { headline: string[]; label: string; messages: string[]; footer: string }> = {
  fr: {
    headline: ["Toutes vos ressources,", "un seul planning,", "zéro friction."],
    label: "En un mot",
    messages: [
      "Chaque ressource a sa place. Chaque équipe trouve la sienne.",
      "Salles, bureaux, parkings, véhicules, matériel : un seul endroit pour tout gérer.",
      "Moins de temps à chercher une ressource, plus de temps pour ce qui compte.",
    ],
    footer: "Multi-sociétés, multi-ressources · vos données restent isolées et confidentielles.",
  },
  en: {
    headline: ["All your resources,", "one single planner,", "zero friction."],
    label: "In a word",
    messages: [
      "Every resource has its place. Every team finds theirs.",
      "Rooms, desks, parking, vehicles, equipment: one place to manage it all.",
      "Less time searching for a resource, more time for what matters.",
    ],
    footer: "Multi-company, multi-resource · your data stays isolated and private.",
  },
};

export default function AuthShell({
  title,
  subtitle,
  language,
  onLanguageChange,
  children,
}: {
  title: string;
  subtitle: string;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  children: React.ReactNode;
}) {
  const [internalLanguage, setInternalLanguage] = useState<Language>("fr");
  const lang = language ?? internalLanguage;
  const setLang = onLanguageChange ?? setInternalLanguage;

  const [messageIndex, setMessageIndex] = useState(0);
  const t = shellText[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % t.messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [t.messages.length]);

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute top-4 right-4 sm:right-6 z-20 flex gap-3">
        <button
          type="button"
          onClick={() => setLang("fr")}
          aria-label="Français"
          title="Français"
          className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 shadow-sm backdrop-blur-sm transition-all ${
            lang === "fr"
              ? "border-brand bg-white scale-105 shadow-md"
              : "border-line/50 bg-white/70 opacity-70 hover:opacity-100 hover:scale-105"
          }`}
        >
          <span className="text-3xl sm:text-4xl leading-none">🇫🇷</span>
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          aria-label="English"
          title="English"
          className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 shadow-sm backdrop-blur-sm transition-all ${
            lang === "en"
              ? "border-brand bg-white scale-105 shadow-md"
              : "border-line/50 bg-white/70 opacity-70 hover:opacity-100 hover:scale-105"
          }`}
        >
          <span className="text-3xl sm:text-4xl leading-none">🇬🇧</span>
        </button>
      </div>

      <div className="hidden lg:flex lg:w-[30%] bg-gradient-to-br from-brand to-brand-dark text-white flex-col justify-between p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <div className="text-sm tracking-widest uppercase text-white/60 mb-1">ResourcesFlow</div>
          <h1 className="font-display text-2xl italic leading-tight">
            {t.headline.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h1>
        </div>

        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-widest text-white/50">{t.label}</div>
          <p
            key={messageIndex}
            className="text-base font-medium text-white/95 leading-relaxed transition-opacity duration-500"
          >
            {t.messages[messageIndex]}
          </p>
          <div className="flex gap-1.5 pt-1">
            {t.messages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === messageIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">{t.footer}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-paper">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl mb-1">{title}</h2>
          <p className="text-sm text-muted mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
