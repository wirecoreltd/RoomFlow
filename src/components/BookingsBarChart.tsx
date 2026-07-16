"use client";

export default function BookingsBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.date} className="flex-1 group relative flex flex-col items-center justify-end h-full">
          <div
            className="w-full bg-brand/80 rounded-t hover:bg-brand transition-colors"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 3 : 0 }}
          />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-ink text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} · {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}
