import {
  computePairwiseRelationships,
  computePersonSummaries,
} from "./calculations";
import {
  computeMonthSummaries,
  formatMonthLabel,
  type MonthSummary,
} from "./grouping";
import type { GroceryItem } from "./types";

export function buildMonthPickerOptions(
  monthSummaries: MonthSummary[],
  selectedMonthKey: string
): MonthSummary[] {
  const byKey = new Map(monthSummaries.map((m) => [m.monthKey, m]));

  if (!byKey.has(selectedMonthKey)) {
    byKey.set(selectedMonthKey, emptyMonthSummary(selectedMonthKey));
  }

  return [...byKey.values()].sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );
}

export function emptyMonthSummary(monthKey: string): MonthSummary {
  return {
    monthKey,
    label: formatMonthLabel(monthKey),
    itemCount: 0,
    totalSpent: 0,
    summaries: computePersonSummaries([]),
    settlements: [],
    pairwise: computePairwiseRelationships([]),
  };
}

export function getSelectedMonthSummary(
  monthSummaries: MonthSummary[],
  selectedMonthKey: string,
  items: GroceryItem[]
): MonthSummary {
  return (
    monthSummaries.find((m) => m.monthKey === selectedMonthKey) ??
    computeMonthSummaries(items).find((m) => m.monthKey === selectedMonthKey) ??
    emptyMonthSummary(selectedMonthKey)
  );
}
