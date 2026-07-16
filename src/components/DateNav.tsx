"use client";

import { useRouter } from "next/navigation";
import { formatDateLong, toDateKey } from "@/lib/utils";

export default function DateNav({ dateKey }: { dateKey: string }) {
  const router = useRouter();
  const current = new Date(`${dateKey}T00:00:00`);

  function go(offsetDays: number) {
    const d = new Date(current);
    d.setDate(d.getDate() + offsetDays);
    router.push(`/planning?date=${toDateKey(d)}`);
  }

  function goToday() {
    router.push(`/planning?date=${toDateKey(new Date())}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(-1)}
        className="h-9 w-9 flex items-center justify-center rounded border border-line bg-surface hover:bg-black/5"
        aria-label="Jour précédent"
      >
        ←
      </button>
      <button
        onClick={goToday}
        className="px-3 h-9 rounded border border-line bg-surface text-sm font-medium hover:bg-black/5 capitalize"
      >
        {formatDateLong(current)}
      </button>
      <button
        onClick={() => go(1)}
        className="h-9 w-9 flex items-center justify-center rounded border border-line bg-surface hover:bg-black/5"
        aria-label="Jour suivant"
      >
        →
      </button>
    </div>
  );
}
