"use client";

import { useMemo } from "react";
import { AppShell, FullPageSection, SectionLabel } from "./components/AppShell";
import { ErrorAlert } from "./components/ErrorAlert";
import { GroceryTable } from "./components/GroceryTable";
import { MonthOverviewTable } from "./components/MonthOverviewTable";
import { MonthPicker } from "./components/MonthPicker";
import { computeMonthSummaries } from "./lib/grouping";
import { useGrocery } from "./context/GroceryContext";
import { useMonthSelection } from "./hooks/useMonthSelection";

export default function Home() {
  const { items, error, clearError, reloadItems } = useGrocery();
  const monthSummaries = useMemo(() => computeMonthSummaries(items), [items]);
  const { selectedMonthKey, setSelectedMonthKey } =
    useMonthSelection(monthSummaries);

  const selectedMonth = useMemo(
    () => monthSummaries.find((m) => m.monthKey === selectedMonthKey) ?? null,
    [monthSummaries, selectedMonthKey]
  );

  return (
    <AppShell>
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={clearError}
          onRetry={() => reloadItems().catch(() => undefined)}
          className="shrink-0"
        />
      )}
      <section className="shrink-0">
        <SectionLabel>Month</SectionLabel>
        <MonthPicker
          months={monthSummaries}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={setSelectedMonthKey}
        />
        <MonthOverviewTable month={selectedMonth} />
      </section>

      <FullPageSection>
        <GroceryTable monthKey={selectedMonthKey} />
      </FullPageSection>
    </AppShell>
  );
}
