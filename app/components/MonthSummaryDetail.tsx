"use client";

import { getCategoryColor } from "../lib/categories";
import { formatCurrency } from "../lib/calculations";
import { formatMonthLabel } from "../lib/grouping";
import type { MonthSummaryDetail } from "../lib/grocery-service";
import type { PersonSummary, Settlement } from "../lib/types";
import { CARD, TABLE, TABLE_TD, TABLE_TH_STICKY } from "../lib/ui";
import { ErrorAlert } from "./ErrorAlert";

function describeBalance(s: PersonSummary): string {
  if (s.balance > 0.005) {
    return `${s.person} paid ${formatCurrency(
      s.totalPaid
    )} upfront but consumed ${formatCurrency(
      s.totalShare
    )} worth — others owe them ${formatCurrency(s.balance)}.`;
  }
  if (s.balance < -0.005) {
    return `${s.person} consumed ${formatCurrency(
      s.totalShare
    )} worth but only paid ${formatCurrency(
      s.totalPaid
    )} — they owe ${formatCurrency(-s.balance)}.`;
  }
  return `${s.person} paid exactly what they consumed (${formatCurrency(
    s.totalShare
  )}).`;
}

function WhoPaysWhomSection({
  monthKey,
  settlements,
}: {
  monthKey: string;
  settlements: Settlement[];
}) {
  return (
    <section className={`${CARD} overflow-hidden`}>
      <div className="border-b border-green-100 bg-green-50/50 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">
          Who pays whom
        </h3>
        <p className="mt-0.5 text-sm text-gray-500">
          Minimum payments to settle all balances for{" "}
          {formatMonthLabel(monthKey)}.
        </p>
      </div>
      <div className="p-4">
        {settlements.length === 0 ? (
          <p className="text-center text-base text-gray-500">
            No payments needed — everyone is settled up for this month!
          </p>
        ) : (
          <ul className="space-y-3">
            {settlements.map((s, i) => (
              <li
                key={i}
                className="rounded-2xl border border-green-100 bg-green-50 px-4 py-4"
              >
                <p className="flex flex-wrap items-center gap-2 text-base">
                  <span className="font-semibold text-red-700">{s.from}</span>
                  <span className="text-gray-500">should pay</span>
                  <span className="text-xl font-bold text-[#2d6a4f]">
                    {formatCurrency(s.amount)}
                  </span>
                  <span className="text-gray-500">to</span>
                  <span className="font-semibold text-green-700">{s.to}</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {s.from} owes {s.to} {formatCurrency(s.amount)} to cover the
                  difference between what {s.from} consumed and what they paid
                  upfront.
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[#2d6a4f]">{value}</p>
      {hint && <p className="mt-0.5 text-sm text-gray-500">{hint}</p>}
    </div>
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
        <p className="text-base text-green-800">Loading summary…</p>
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
        <p className="rounded-2xl border border-dashed border-green-200 bg-white/60 px-4 py-8 text-center text-base text-gray-500">
          No data yet.{" "}
          <a href="/" className="text-green-700 underline">
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
        <p className="rounded-2xl border border-dashed border-green-200 bg-white/60 px-4 py-8 text-center text-base text-gray-500">
          Select a month to view the full breakdown.
        </p>
      </div>
    );
  }

  const avgShare =
    summary.summaries.reduce((sum, s) => sum + s.totalShare, 0) /
    summary.summaries.length;

  return (
    <div className="min-h-0 flex-1 overflow-auto pb-2">
      <div className="mb-3 px-1">
        <h2 className="text-lg font-bold text-green-900">
          {formatMonthLabel(monthKey)}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          A full breakdown of grocery spending for this month — how costs were
          split and exactly who needs to settle up with whom.
        </p>
      </div>

      <section className={`${CARD} mb-4 overflow-hidden`}>
        <div className="border-b border-green-100 bg-green-50/50 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">
            Per-person breakdown
          </h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Share = fair cost based on items they ate. Paid = what they spent
            upfront. Balance = difference.
          </p>
        </div>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={`${TABLE_TH_STICKY} text-left`}>Person</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Share</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Paid</th>
              <th className={`${TABLE_TH_STICKY} text-right`}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {summary.summaries.map((s, i) => (
              <tr
                key={s.person}
                className={i % 2 === 0 ? "bg-white" : "bg-green-50/40"}
              >
                <td className={`${TABLE_TD} font-medium`}>{s.person}</td>
                <td className={`${TABLE_TD} text-right`}>
                  {formatCurrency(s.totalShare)}
                </td>
                <td className={`${TABLE_TD} text-right`}>
                  {formatCurrency(s.totalPaid)}
                </td>
                <td
                  className={`${TABLE_TD} text-right font-semibold ${
                    s.balance > 0.005
                      ? "text-green-700"
                      : s.balance < -0.005
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {s.balance > 0.005
                    ? `+${formatCurrency(s.balance)}`
                    : s.balance < -0.005
                    ? formatCurrency(s.balance)
                    : "Settled"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mb-4">
        <WhoPaysWhomSection
          monthKey={monthKey}
          settlements={summary.settlements}
        />
      </div>

      <section className={`${CARD} mb-4 px-4 py-3`}>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-800">
          What this means
        </h3>
        <ul className="space-y-2">
          {summary.summaries.map((s) => (
            <li
              key={s.person}
              className="rounded-xl bg-green-50/80 px-3 py-2.5 text-sm leading-relaxed text-gray-700"
            >
              {describeBalance(s)}
            </li>
          ))}
        </ul>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total spent"
          value={formatCurrency(summary.totalSpent)}
          hint={`${summary.itemCount} item${
            summary.itemCount !== 1 ? "s" : ""
          }`}
        />
        <StatCard
          label="Avg share"
          value={formatCurrency(avgShare)}
          hint="Per person"
        />
        <StatCard
          label="Settlements"
          value={String(summary.settlements.length)}
          hint={
            summary.settlements.length === 0
              ? "Everyone settled"
              : "Payment(s) needed"
          }
        />
        <StatCard
          label="Categories"
          value={String(summary.categoryBreakdown.length)}
          hint="Types of groceries"
        />
      </div>

      {summary.categoryBreakdown.length > 0 && (
        <section className={`${CARD} px-4 py-3`}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-800">
            Spending by category
          </h3>
          <ul className="flex flex-wrap gap-2">
            {summary.categoryBreakdown.map(({ category, total }) => (
              <li
                key={category}
                className="rounded-full px-3 py-1.5 text-sm"
                style={{
                  backgroundColor: getCategoryColor(category),
                }}
              >
                <span className="font-medium">{category}</span>
                <span className="ml-2 text-[#2d6a4f]">
                  {formatCurrency(total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
