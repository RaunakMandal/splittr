"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategoryColor } from "../lib/categories";
import { formatCurrency } from "../lib/calculations";
import { formatMonthLabel } from "../lib/grouping";
import type {
  MonthSummaryDetail,
  PersonCategorySpending,
} from "../lib/summary";
import type { PersonSummary, Settlement } from "../lib/types";
import {
  CARD,
  EMPTY_STATE,
  INPUT,
  ROW_STRIPE,
  SECTION_HEADER,
  TABLE,
  TABLE_TD,
  TABLE_TH_STICKY,
} from "../lib/ui";
import { ErrorAlert } from "./ErrorAlert";

function WhoPaysWhomSection({ settlements }: { settlements: Settlement[] }) {
  return (
    <section className={`${CARD} overflow-hidden`}>
      <div className={SECTION_HEADER}>
        <h3 className="text-sm font-semibold text-foreground">Who pays whom</h3>
      </div>
      <div className="p-4">
        {settlements.length === 0 ? (
          <p className="text-center text-sm text-muted">
            Everyone is settled up.
          </p>
        ) : (
          <ul className="space-y-2">
            {settlements.map((s, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border-muted bg-primary-muted/60 px-3 py-2.5 text-sm"
              >
                <span className="font-semibold text-danger">{s.from}</span>
                <span className="text-muted">→</span>
                <span className="font-semibold text-success">{s.to}</span>
                <span className="ml-auto text-base font-bold text-primary">
                  {formatCurrency(s.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function BalanceStatus({ s }: { s: PersonSummary }) {
  if (s.balance > 0.005) {
    return (
      <span className="font-semibold text-success">
        gets back {formatCurrency(s.balance)}
      </span>
    );
  }
  if (s.balance < -0.005) {
    return (
      <span className="font-semibold text-danger">
        owes {formatCurrency(-s.balance)}
      </span>
    );
  }
  return <span className="text-muted">settled</span>;
}

function PersonCategorySpendingSection({
  monthKey,
  breakdown,
}: {
  monthKey: string;
  breakdown: PersonCategorySpending[];
}) {
  const peopleWithSpending = useMemo(
    () => breakdown.filter((p) => p.categories.length > 0),
    [breakdown]
  );
  const [selectedPerson, setSelectedPerson] = useState(
    peopleWithSpending[0]?.person ?? ""
  );

  useEffect(() => {
    setSelectedPerson(peopleWithSpending[0]?.person ?? "");
  }, [monthKey, peopleWithSpending]);

  const selected =
    peopleWithSpending.find((p) => p.person === selectedPerson) ??
    peopleWithSpending[0];

  if (!selected) return null;

  return (
    <section className={`${CARD} overflow-hidden`}>
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${SECTION_HEADER}`}
      >
        <h3 className="text-sm font-semibold text-foreground">
          Spending by category
        </h3>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">Person</span>
          <select
            value={selected.person}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className={`${INPUT} min-w-[10rem]`}
          >
            {peopleWithSpending.map((p) => (
              <option key={p.person} value={p.person}>
                {p.person}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="divide-y divide-border-muted px-4 py-1">
        {selected.categories.map(({ category, amount }) => (
          <li
            key={category}
            className="flex items-center justify-between gap-2 py-2.5 text-sm"
          >
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: getCategoryColor(category) }}
            >
              {category}
            </span>
            <span className="font-medium text-primary">
              {formatCurrency(amount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MonthSummaryDetail({
  monthKey,
  summary,
  hasMonths,
  loading,
  error,
  onRetry,
  onDismissError,
}: {
  monthKey: string | null;
  summary: MonthSummaryDetail | null;
  hasMonths: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onDismissError: () => void;
}) {
  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-base text-primary">Loading summary…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <ErrorAlert
          message={error}
          onDismiss={onDismissError}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!hasMonths) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className={EMPTY_STATE}>
          No data yet.{" "}
          <a href="/" className="text-primary underline">
            Add entries
          </a>{" "}
          first.
        </p>
      </div>
    );
  }

  if (!monthKey || !summary) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className={EMPTY_STATE}>Select a month to view the summary.</p>
      </div>
    );
  }

  const hasCategorySpending = (summary.personCategoryBreakdown ?? []).some(
    (p) => p.categories.length > 0
  );

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-auto pb-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <h2 className="text-lg font-bold text-foreground">
          {formatMonthLabel(monthKey)}
        </h2>
        <p className="text-sm text-muted">
          {formatCurrency(summary.totalSpent)} · {summary.itemCount} item
          {summary.itemCount !== 1 ? "s" : ""}
        </p>
      </div>

      <WhoPaysWhomSection settlements={summary.settlements} />

      <section className={`${CARD} overflow-hidden`}>
        <div className={SECTION_HEADER}>
          <h3 className="text-sm font-semibold text-foreground">Balances</h3>
        </div>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={`${TABLE_TH_STICKY} text-left`}>Person</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.summaries.map((s, i) => (
              <tr
                key={s.person}
                className={i % 2 === 0 ? "bg-surface" : ROW_STRIPE}
              >
                <td className={`${TABLE_TD} font-medium`}>{s.person}</td>
                <td className={`${TABLE_TD} text-right`}>
                  <BalanceStatus s={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {hasCategorySpending && (
        <PersonCategorySpendingSection
          monthKey={monthKey}
          breakdown={summary.personCategoryBreakdown ?? []}
        />
      )}
    </div>
  );
}
