"use client";

import { useEffect, useState } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const hours = now.getHours() + now.getMinutes() / 60;
  const dayStart = 8;
  const dayEnd = 19;
  const progress = Math.min(1, Math.max(0, (hours - dayStart) / (dayEnd - dayStart)));

  const slots = [
    { label: "9:00", room: "Atlas", busy: true },
    { label: "10:30", room: "Everest", busy: false },
    { label: "13:00", room: "Kilimandjaro", busy: true },
    { label: "15:00", room: "Atlas", busy: false },
    { label: "16:30", room: "Everest", busy: true },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ink text-white flex-col justify-between p-12 relative overflow-hidden">
        <div>
          <div className="text-sm tracking-widest uppercase text-white/50 mb-1">RoomFlow</div>
          <h1 className="font-display text-3xl italic leading-tight">
            Réserver une salle
            <br />
            ne devrait prendre
            <br />
            que dix secondes.
          </h1>
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Planning du jour</div>
          <div className="relative border-l border-white/15 pl-4 space-y-3">
            <div
              className="absolute -left-[3px] w-1.5 h-1.5 rounded-full bg-brand"
              style={{ top: `${progress * 100}%` }}
              aria-hidden
            />
            {slots.map((s) => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-white/50 w-12">{s.label}</span>
                <span
                  className={`h-2 w-2 rounded-full ${s.busy ? "bg-occupied" : "bg-brand"}`}
                  aria-hidden
                />
                <span className="text-white/80">{s.room}</span>
                <span className="text-white/40 text-xs ml-auto">{s.busy ? "occupée" : "libre"}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/30">Mise à jour en temps réel · toutes les salles, un seul planning.</p>
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
