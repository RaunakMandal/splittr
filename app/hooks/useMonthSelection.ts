"use client";

import { useMemo } from "react";
import { useGrocery } from "../context/GroceryContext";
import { useMonthSelectionState } from "../context/MonthSelectionContext";
import { buildMonthPickerOptions } from "../lib/month-selection";

export function useMonthSelection() {
  const { monthSummaries } = useGrocery();
  const { selectedMonthKey, setSelectedMonthKey } = useMonthSelectionState();

  const monthOptions = useMemo(
    () => buildMonthPickerOptions(monthSummaries, selectedMonthKey),
    [monthSummaries, selectedMonthKey]
  );

  return { selectedMonthKey, setSelectedMonthKey, monthOptions };
}
