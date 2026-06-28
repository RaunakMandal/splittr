import type { GroceryItem, PersonSummary, Settlement } from "./types";
import { computePersonSummaries, computeSettlements } from "./calculations";

import { getMonthKeyFromPurchaseDate } from "./purchase-date";

export function getMonthKey(date: string): string {
  return getMonthKeyFromPurchaseDate(date);
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function groupItemsByMonth(
  items: GroceryItem[]
): { monthKey: string; label: string; items: GroceryItem[] }[] {
  const groups = new Map<string, GroceryItem[]>();

  for (const item of items) {
    const key = getMonthKey(item.purchaseDate);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, monthItems]) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      items: monthItems.sort((a, b) =>
        a.purchaseDate.localeCompare(b.purchaseDate)
      ),
    }));
}

export function getAvailableMonths(items: GroceryItem[]): string[] {
  return [...new Set(items.map((item) => getMonthKey(item.purchaseDate)))].sort(
    (a, b) => a.localeCompare(b)
  );
}

export interface MonthSummary {
  monthKey: string;
  label: string;
  itemCount: number;
  totalSpent: number;
  summaries: PersonSummary[];
  settlements: Settlement[];
}

export function computeMonthSummaries(items: GroceryItem[]): MonthSummary[] {
  return groupItemsByMonth(items).map((group) => ({
    monthKey: group.monthKey,
    label: group.label,
    itemCount: group.items.length,
    totalSpent: group.items.reduce((sum, item) => sum + item.price, 0),
    summaries: computePersonSummaries(group.items),
    settlements: computeSettlements(group.items),
  }));
}
