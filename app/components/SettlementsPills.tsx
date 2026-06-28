"use client";

import { formatCurrency } from "../lib/calculations";
import type { MonthSummary } from "../lib/grouping";

export function SettlementsPills({ month }: { month: MonthSummary | null }) {
  if (!month) return null;

  return (
    <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
      {month.settlements.length === 0 ? (
        <span className="rounded-full bg-muted-bg px-2.5 py-0.5 text-muted">
          Settled
        </span>
      ) : (
        month.settlements.map((s, i) => (
          <span
            key={i}
            className="whitespace-nowrap rounded-full bg-primary-muted px-2.5 py-0.5"
          >
            <span className="font-medium text-danger">{s.from}</span>
            <span className="text-muted"> → </span>
            <span className="font-medium text-success">{s.to}</span>
            <span className="ml-1 font-semibold text-primary">
              {formatCurrency(s.amount)}
            </span>
          </span>
        ))
      )}
    </div>
  );
}
