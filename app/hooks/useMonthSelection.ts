"use client";

import { useEffect } from "react";
import type { MonthSummary } from "../lib/grouping";
import { useMonthSelectionState } from "../context/MonthSelectionContext";

export function useMonthSelection(monthSummaries: MonthSummary[]) {
  const { selectedMonthKey, setSelectedMonthKey } = useMonthSelectionState();

  useEffect(() => {
    if (monthSummaries.length === 0) {
      setSelectedMonthKey(null);
      return;
    }
    if (
      !selectedMonthKey ||
      !monthSummaries.some((m) => m.monthKey === selectedMonthKey)
    ) {
      setSelectedMonthKey(monthSummaries[monthSummaries.length - 1].monthKey);
    }
  }, [monthSummaries, selectedMonthKey, setSelectedMonthKey]);

  return { selectedMonthKey, setSelectedMonthKey };
}
