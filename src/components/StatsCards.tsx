export default function StatsCards({
  totalRooms,
  totalBookings,
  occupancyRate,
  userCount,
  topRoomName,
}: {
  totalRooms: number;
  totalBookings: number;
  occupancyRate: number;
  userCount: number;
  topRoomName: string;
}) {
  const cards = [
    { label: "Salles actives", value: totalRooms },
    { label: "Réservations (30j)", value: totalBookings },
    { label: "Taux d'occupation", value: `${occupancyRate}%` },
    { label: "Utilisateurs", value: userCount },
    { label: "Salle la plus demandée", value: topRoomName },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-line bg-surface p-4">
          <div className="text-2xl font-display">{c.value}</div>
          <div className="text-xs text-muted mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
