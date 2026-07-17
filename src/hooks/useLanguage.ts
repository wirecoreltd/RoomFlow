"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/components/AuthShell";

const STORAGE_KEY = "resourcesflow_lang";

export function usePersistedLanguage(defaultLang: Language = "fr") {
  const [language, setLanguageState] = useState<Language>(defaultLang);

  // Lu une seule fois au montage, côté client uniquement (évite les erreurs SSR)
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  return [language, setLanguage] as const;
}
