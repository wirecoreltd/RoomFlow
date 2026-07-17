"use client";

import { useEffect, useState } from "react";

const positiveMessages = [
  "Chaque ressource a sa place. Chaque équipe trouve la sienne.",
  "Salles, bureaux, parkings, véhicules, matériel : un seul endroit pour tout gérer.",
  "Moins de temps à chercher une ressource, plus de temps pour ce qui compte.",
];

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMessageIndex((i) => (i + 1) % positiveMessages.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand to-brand-dark text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* touches de couleur en fond, discrètes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <div className="text-sm tracking-widest uppercase text-white/60 mb-1">ResourcesFlow</div>
          <h1 className="font-display text-3xl italic leading-tight">
            Toutes vos ressources,
            <br />
            un seul planning,
            <br />
            zéro friction.
          </h1>
        </div>

        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-widest text-white/50">En un mot</div>
          <p
            key={messageIndex}
            className="text-lg font-medium text-white/95 leading-relaxed transition-opacity duration-500"
          >
            {positiveMessages[messageIndex]}
          </p>
          <div className="flex gap-1.5 pt-1">
            {positiveMessages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === messageIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          Multi-sociétés, multi-ressources · vos données restent isolées et confidentielles.
        </p>
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
