"use client";

import { useRouter } from "next/navigation";
import { formatDateLong, formatMonthLong, toDateKey, addDays, addMonths, startOfWeek } from "@/lib/utils";

export type PlanningView = "day" | "week" | "month";

export default function DateNav({ dateKey, view }: { dateKey: string; view: PlanningView }) {
  const router = useRouter();
  const current = new Date(`${dateKey}T00:00:00`);

  function navigate(date: Date, nextView: PlanningView) {
    router.push(`/planning?date=${toDateKey(date)}&view=${nextView}`);
  }

  function goPrev() {
    if (view === "day") navigate(addDays(current, -1), view);
    else if (view === "week") navigate(addDays(current, -7), view);
    else navigate(addMonths(current, -1), view);
  }

  function goNext() {
    if (view === "day") navigate(addDays(current, 1), view);
    else if (view === "week") navigate(addDays(current, 7), view);
    else navigate(addMonths(current, 1), view);
  }

  function goToday() {
    navigate(new Date(), view);
  }

  function label() {
    if (view === "month") return formatMonthLong(current);
    if (view === "week") {
      const start = startOfWeek(current);
      const end = addDays(start, 6);
      return start.getDate() + " - " + end.getDate() + " " + formatMonthLong(end);
    }
    return formatDateLong(current);
  }

  const views: PlanningView[] = ["day", "week", "month"];
  const viewLabels: Record<PlanningView, string> = { day: "Jour", week: "Semaine", month: "Mois" };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={goPrev}
          className="h-9 w-9 flex items-center justify-center rounded border border-line bg-surface hover:bg-black/5"
          aria-label="Precedent"
        >
          ←
        </button>
        <button
          onClick={goToday}
          className="px-3 h-9 rounded border border-line bg-surface text-sm font-medium hover:bg-black/5 capitalize"
        >
          {label()}
        </button>
        <button
          onClick={goNext}
          className="h-9 w-9 flex items-center justify-center rounded border border-line bg-surface hover:bg-black/5"
          aria-label="Suivant"
        >
          →
        </button>
      </div>

      <div className="flex rounded border border-line overflow-hidden text-sm">
        {views.map((v) => {
          const active = view === v;
          const btnClass = active
            ? "px-3 h-9 bg-ink text-white"
            : "px-3 h-9 bg-surface text-muted hover:bg-black/5";
          return (
            <button key={v} onClick={() => navigate(current, v)} className={btnClass}>
              {viewLabels[v]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
