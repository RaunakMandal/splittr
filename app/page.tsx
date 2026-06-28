"use client";

import { useMemo } from "react";
import { AppShell, FullPageSection } from "./components/AppShell";
import { ErrorAlert } from "./components/ErrorAlert";
import { GroceryTable } from "./components/GroceryTable";
import { MonthPicker } from "./components/MonthPicker";
import { SettlementsPills } from "./components/SettlementsPills";
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
    <AppShell headerAside={<SettlementsPills month={selectedMonth} />}>
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={clearError}
          onRetry={() => reloadItems().catch(() => undefined)}
          className="shrink-0"
        />
      )}
      <section className="shrink-0">
        <MonthPicker
          months={monthSummaries}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={setSelectedMonthKey}
        />
      </section>

      <FullPageSection>
        <GroceryTable monthKey={selectedMonthKey} />
      </FullPageSection>
    </AppShell>
  );
}
