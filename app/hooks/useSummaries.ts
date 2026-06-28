"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMonthSummary, fetchSummaries } from "../lib/api-client";
import { getErrorMessage } from "../lib/errors";
import type { MonthSummary } from "../lib/grouping";
import type { MonthSummaryDetail } from "../lib/grocery-service";

export function useSummaries() {
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSummaries();
      setSummaries(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load summaries"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summaries, loading, error, clearError, refresh };
}

export function useMonthSummaryDetail(monthKey: string | null) {
  const [summary, setSummary] = useState<MonthSummaryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    if (!monthKey) {
      setSummary(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchMonthSummary(monthKey);
      setSummary(data);
      setError(null);
    } catch (err) {
      setSummary(null);
      setError(getErrorMessage(err, "Failed to load summary"));
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, clearError, refresh };
}
