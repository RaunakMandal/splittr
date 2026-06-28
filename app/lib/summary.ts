import { getShare } from "./calculations";
import { PEOPLE } from "./config";
import {
  computeMonthSummaries,
  getMonthKey,
  type MonthSummary,
} from "./grouping";
import type { GroceryItem } from "./types";

export interface PersonCategorySpending {
  person: string;
  categories: { category: string; amount: number }[];
}

export interface MonthSummaryDetail extends MonthSummary {
  categoryBreakdown: { category: string; total: number }[];
  personCategoryBreakdown: PersonCategorySpending[];
}

function categoryBreakdown(items: GroceryItem[]) {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.price);
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function personCategoryBreakdown(
  items: GroceryItem[]
): PersonCategorySpending[] {
  return PEOPLE.map((person) => {
    const totals = new Map<string, number>();
    for (const item of items) {
      const share = getShare(item.price, item.participants, person);
      if (share > 0) {
        totals.set(item.category, (totals.get(item.category) ?? 0) + share);
      }
    }
    return {
      person,
      categories: [...totals.entries()]
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
    };
  });
}

export function computeMonthSummaryDetail(
  items: GroceryItem[],
  monthKey: string
): MonthSummaryDetail | null {
  const monthItems = items.filter(
    (item) => getMonthKey(item.purchaseDate) === monthKey
  );
  if (monthItems.length === 0) return null;

  const summary = computeMonthSummaries(monthItems)[0];
  if (!summary) return null;

  return {
    ...summary,
    categoryBreakdown: categoryBreakdown(monthItems),
    personCategoryBreakdown: personCategoryBreakdown(monthItems),
  };
}
