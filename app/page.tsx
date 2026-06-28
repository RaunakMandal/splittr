"use client";

import { useMemo } from "react";
import { AppShell, FullPageSection } from "./components/AppShell";
import { ErrorAlert } from "./components/ErrorAlert";
import { GroceryTable } from "./components/GroceryTable";
import { MonthPicker } from "./components/MonthPicker";
import { SettlementsPills } from "./components/SettlementsPills";
import { useGrocery } from "./context/GroceryContext";
import { useMonthSelection } from "./hooks/useMonthSelection";
import { getSelectedMonthSummary } from "./lib/month-selection";

export default function Home() {
  const { items, monthSummaries, error, clearError, reloadItems } = useGrocery();
  const { selectedMonthKey, setSelectedMonthKey, monthOptions } =
    useMonthSelection();

  const selectedMonth = useMemo(
    () => getSelectedMonthSummary(monthSummaries, selectedMonthKey, items),
    [monthSummaries, selectedMonthKey, items]
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
          months={monthOptions}
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
