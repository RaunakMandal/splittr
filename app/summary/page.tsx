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
import { computeMonthSummaries } from "../lib/grouping";
import { computeMonthSummaryDetail } from "../lib/summary";

export default function SummaryPage() {
  const { items } = useGrocery();
  const monthSummaries = useMemo(() => computeMonthSummaries(items), [items]);
  const { selectedMonthKey, setSelectedMonthKey } =
    useMonthSelection(monthSummaries);

  const summary = useMemo(
    () =>
      selectedMonthKey
        ? computeMonthSummaryDetail(items, selectedMonthKey)
        : null,
    [items, selectedMonthKey]
  );

  const selectedMonth = useMemo(
    () => monthSummaries.find((m) => m.monthKey === selectedMonthKey) ?? null,
    [monthSummaries, selectedMonthKey]
  );

  return (
    <AppShell headerAside={<SettlementsPills month={selectedMonth} />}>
      <section className="shrink-0">
        <SectionLabel>Month</SectionLabel>
        <MonthPicker
          months={monthSummaries}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={setSelectedMonthKey}
        />
      </section>

      <FullPageSection>
        <MonthSummaryDetail
          monthKey={selectedMonthKey}
          summary={summary}
          hasMonths={monthSummaries.length > 0}
          loading={false}
          error={null}
          onRetry={() => undefined}
          onDismissError={() => undefined}
        />
      </FullPageSection>
    </AppShell>
  );
}
