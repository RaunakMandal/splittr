"use client";

import { useMemo } from "react";
import {
  AppShell,
  FullPageSection,
  SectionLabel,
} from "../components/AppShell";
import { MonthPicker } from "../components/MonthPicker";
import { MonthSummaryDetail } from "../components/MonthSummaryDetail";
import { SettlementsPills } from "../components/SettlementsPills";
import { useGrocery } from "../context/GroceryContext";
import { useMonthSelection } from "../hooks/useMonthSelection";
import { getSelectedMonthSummary } from "../lib/month-selection";
import { computeMonthSummaryDetail } from "../lib/summary";

export default function SummaryPage() {
  const { items, monthSummaries, loading } = useGrocery();
  const { selectedMonthKey, setSelectedMonthKey, monthOptions } =
    useMonthSelection();

  const summary = useMemo(
    () =>
      selectedMonthKey
        ? computeMonthSummaryDetail(items, selectedMonthKey)
        : null,
    [items, selectedMonthKey]
  );

  const selectedMonth = useMemo(
    () => getSelectedMonthSummary(monthSummaries, selectedMonthKey, items),
    [monthSummaries, selectedMonthKey, items]
  );

  return (
    <AppShell headerAside={<SettlementsPills month={selectedMonth} />}>
      <section className="shrink-0">
        <SectionLabel>Month</SectionLabel>
        <MonthPicker
          months={monthOptions}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={setSelectedMonthKey}
        />
      </section>

      <FullPageSection>
        <MonthSummaryDetail
          monthKey={selectedMonthKey}
          summary={summary}
          loading={loading}
          error={null}
          onRetry={() => undefined}
          onDismissError={() => undefined}
        />
      </FullPageSection>
    </AppShell>
  );
}
