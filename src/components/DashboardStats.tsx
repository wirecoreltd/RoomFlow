type DashboardData = {
  total_bookings: number;
  active_rooms: number;
  total_hours: number;
  top_room: { name: string; count: number } | null;
  by_day: { day: string; count: number }[];
  by_room: { name: string; count: number }[];
};

export default function DashboardStats({ stats }: { stats: DashboardData }) {
  const maxDay = Math.max(1, ...stats.by_day.map((d) => d.count));
  const maxRoom = Math.max(1, ...stats.by_room.map((r) => r.count));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Réservations" value={stats.total_bookings} />
        <KpiCard label="Salles actives" value={stats.active_rooms} />
        <KpiCard label="Heures réservées" value={stats.total_hours} />
        <KpiCard
          label="Salle la + demandée"
          value={stats.top_room?.name ?? "—"}
          sub={stats.top_room ? `${stats.top_room.count} résa.` : undefined}
        />
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-medium text-sm mb-4">Réservations par jour</h2>
        {stats.by_day.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Aucune réservation sur cette période.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {stats.by_day.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand rounded-t hover:brightness-90 transition-all"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  title={`${d.day} : ${d.count} résa.`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-medium text-sm mb-4">Réservations par salle</h2>
        <div className="space-y-3">
          {stats.by_room.map((r) => (
            <div key={r.name} className="flex items-center gap-3">
              <span className="w-32 text-sm truncate">{r.name}</span>
              <div className="flex-1 h-3 bg-line rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${(r.count / maxRoom) * 100}%` }} />
              </div>
              <span className="text-sm text-muted w-8 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-2xl font-display mt-1">{value}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  );
}
