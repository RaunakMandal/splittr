"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategoryColor } from "../lib/categories";
import { formatCurrency } from "../lib/calculations";
import { formatMonthLabel } from "../lib/grouping";
import { formatPurchaseDateDisplay } from "../lib/purchase-date";
import type {
  MonthSummaryDetail,
  PersonCategorySpending,
} from "../lib/summary";
import type {
  PairwiseItemContribution,
  PairwiseRelationship,
  PersonSummary,
  Settlement,
} from "../lib/types";
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
        <p className="mt-0.5 text-xs text-muted">
          Net settlement for each pair
        </p>
      </div>
      <div className="p-4">
        {settlements.length === 0 ? (
          <p className="text-center text-sm text-muted">
            Everyone is settled up across all pairs.
          </p>
        ) : (
          <ul className="space-y-2">
            {settlements.map((s) => (
              <li
                key={`${s.from}-${s.to}`}
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

function PairwiseItemList({
  from,
  to,
  items,
}: {
  from: string;
  to: string;
  items: PairwiseItemContribution[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-muted">
        {from} owes {to} nothing from shared items.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted">
            <th className="pb-1 pr-2 font-medium">Date</th>
            <th className="pb-1 pr-2 font-medium">Item</th>
            <th className="pb-1 pr-2 text-right font-medium">Price</th>
            <th className="pb-1 text-right font-medium">{from}&apos;s share</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entry, index) => (
            <tr
              key={`${entry.purchaseDate}-${entry.item}-${index}`}
              className={index % 2 === 0 ? "bg-surface/60" : undefined}
            >
              <td className="py-1 pr-2 whitespace-nowrap">
                {formatPurchaseDateDisplay(entry.purchaseDate)}
              </td>
              <td className="py-1 pr-2">{entry.item}</td>
              <td className="py-1 pr-2 text-right whitespace-nowrap">
                {formatCurrency(entry.price)}
              </td>
              <td className="py-1 text-right whitespace-nowrap font-medium text-primary">
                {formatCurrency(entry.share)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PairwiseBreakdownSection({
  pairwise,
}: {
  pairwise: PairwiseRelationship[];
}) {
  return (
    <section className={`${CARD} overflow-hidden`}>
      <div className={SECTION_HEADER}>
        <h3 className="text-sm font-semibold text-foreground">
          Pairwise breakdown
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Gross debts both ways and net who pays whom for every pair
        </p>
      </div>
      <div className="divide-y divide-border-muted">
        {pairwise.map((pair) => (
          <div
            key={`${pair.personA}-${pair.personB}`}
            className="space-y-3 p-4"
          >
            <h4 className="text-sm font-semibold text-foreground">
              {pair.personA} ↔ {pair.personB}
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border-muted bg-surface/80 p-3">
                <p className="mb-2 text-sm">
                  <span className="font-semibold text-danger">
                    {pair.personA}
                  </span>
                  <span className="text-muted"> owes </span>
                  <span className="font-semibold text-success">
                    {pair.personB}
                  </span>
                  <span className="ml-1 font-bold text-primary">
                    {formatCurrency(pair.aOwesB)}
                  </span>
                </p>
                <PairwiseItemList
                  from={pair.personA}
                  to={pair.personB}
                  items={pair.aOwesBItems}
                />
              </div>

              <div className="rounded-xl border border-border-muted bg-surface/80 p-3">
                <p className="mb-2 text-sm">
                  <span className="font-semibold text-danger">
                    {pair.personB}
                  </span>
                  <span className="text-muted"> owes </span>
                  <span className="font-semibold text-success">
                    {pair.personA}
                  </span>
                  <span className="ml-1 font-bold text-primary">
                    {formatCurrency(pair.bOwesA)}
                  </span>
                </p>
                <PairwiseItemList
                  from={pair.personB}
                  to={pair.personA}
                  items={pair.bOwesAItems}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border-muted bg-primary-muted/40 px-3 py-2.5 text-sm">
              <span className="font-medium text-foreground">Net: </span>
              {pair.netSettlement ? (
                <>
                  <span className="font-semibold text-danger">
                    {pair.netSettlement.from}
                  </span>
                  <span className="text-muted"> → </span>
                  <span className="font-semibold text-success">
                    {pair.netSettlement.to}
                  </span>
                  <span className="ml-1 font-bold text-primary">
                    {formatCurrency(pair.netSettlement.amount)}
                  </span>
                </>
              ) : (
                <span className="text-muted">Settled between this pair</span>
              )}
            </div>
          </div>
        ))}
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
  loading,
  error,
  onRetry,
  onDismissError,
}: {
  monthKey: string;
  summary: MonthSummaryDetail | null;
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

  if (!summary) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className={EMPTY_STATE}>
          No items for {formatMonthLabel(monthKey)}.
        </p>
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
          <p className="mt-0.5 text-xs text-muted">
            Total paid vs total share for the month
          </p>
        </div>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={`${TABLE_TH_STICKY} text-left`}>Person</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Paid</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Share</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Net</th>
            </tr>
          </thead>
          <tbody>
            {summary.summaries.map((s, i) => (
              <tr
                key={s.person}
                className={i % 2 === 0 ? "bg-surface" : ROW_STRIPE}
              >
                <td className={`${TABLE_TD} font-medium`}>{s.person}</td>
                <td className={`${TABLE_TD} text-right whitespace-nowrap`}>
                  {formatCurrency(s.totalPaid)}
                </td>
                <td className={`${TABLE_TD} text-right whitespace-nowrap`}>
                  {formatCurrency(s.totalShare)}
                </td>
                <td className={`${TABLE_TD} text-right`}>
                  <BalanceStatus s={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PairwiseBreakdownSection pairwise={summary.pairwise} />

      {hasCategorySpending && (
        <PersonCategorySpendingSection
          monthKey={monthKey}
          breakdown={summary.personCategoryBreakdown ?? []}
        />
      )}
    </div>
  );
}
