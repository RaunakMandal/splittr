"use client";

import {
  AppShell,
  FullPageSection,
  SectionLabel,
} from "../components/AppShell";
import { MonthPicker } from "../components/MonthPicker";
import { MonthSummaryDetail } from "../components/MonthSummaryDetail";
import { useMonthSelection } from "../hooks/useMonthSelection";
import { useMonthSummaryDetail, useSummaries } from "../hooks/useSummaries";

export default function SummaryPage() {
  const {
    summaries,
    loading: summariesLoading,
    error: summariesError,
    clearError: clearSummariesError,
    refresh: refreshSummaries,
  } = useSummaries();
  const { selectedMonthKey, setSelectedMonthKey } =
    useMonthSelection(summaries);
  const {
    summary,
    loading: detailLoading,
    error: detailError,
    clearError: clearDetailError,
    refresh: refreshDetail,
  } = useMonthSummaryDetail(selectedMonthKey);

  const loading = summariesLoading || detailLoading;
  const error = summariesError ?? detailError;

  function clearError() {
    clearSummariesError();
    clearDetailError();
  }

  function retry() {
    refreshSummaries();
    refreshDetail();
  }

  return (
    <AppShell>
      <section className="shrink-0">
        <SectionLabel>Month</SectionLabel>
        <MonthPicker
          months={summaries}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={setSelectedMonthKey}
        />
      </section>

      <FullPageSection>
        <MonthSummaryDetail
          monthKey={selectedMonthKey}
          summary={summary}
          hasMonths={summaries.length > 0}
          loading={loading}
          error={error}
          onRetry={retry}
          onDismissError={clearError}
        />
      </FullPageSection>
    </AppShell>
  );
}
