"use client";

import { formatMonthLabel } from "../lib/grouping";
import type { MonthSummary } from "../lib/grouping";
import { INPUT } from "../lib/ui";

export function MonthPicker({
  months,
  selectedMonthKey,
  onSelectMonth,
}: {
  months: MonthSummary[];
  selectedMonthKey: string | null;
  onSelectMonth: (monthKey: string) => void;
}) {
  if (months.length === 0) return null;

  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <label
        htmlFor="month-picker"
        className="text-sm font-medium text-green-800"
      >
        Month
      </label>
      <select
        id="month-picker"
        value={selectedMonthKey ?? ""}
        onChange={(e) => onSelectMonth(e.target.value)}
        className={`${INPUT} min-w-[10rem]`}
      >
        {months.map((month) => (
          <option key={month.monthKey} value={month.monthKey}>
            {formatMonthLabel(month.monthKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
