"use client";

import { formatCurrency } from "../lib/calculations";
import type { MonthSummary } from "../lib/grouping";
import { CARD, TABLE, TABLE_TD, TABLE_TH } from "../lib/ui";

function SettlementsCell({ month }: { month: MonthSummary }) {
  if (month.settlements.length === 0) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-500">
        Settled
      </span>
    );
  }

  return (
    <ul className="space-y-1">
      {month.settlements.map((s, i) => (
        <li
          key={i}
          className="whitespace-nowrap rounded-full bg-green-50 px-2.5 py-1 text-sm"
        >
          <span className="font-medium text-red-700">{s.from}</span>
          <span className="text-gray-400"> → </span>
          <span className="font-medium text-green-700">{s.to}</span>
          <span className="ml-1 font-medium text-[#2d6a4f]">
            {formatCurrency(s.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function MonthOverviewTable({ month }: { month: MonthSummary | null }) {
  if (!month) {
    return (
      <p className="px-1 text-base text-gray-500">
        Select a month to view its overview.
      </p>
    );
  }

  return (
    <div className={`${CARD} shrink-0 overflow-x-auto`}>
      <table className={TABLE}>
        <thead>
          <tr>
            <th className={`${TABLE_TH} rounded-tl-2xl text-left`}>Month</th>
            <th className={`${TABLE_TH} text-left`}>Who Pays Whom</th>
            <th className={`${TABLE_TH} text-center`}>Items</th>
            <th className={`${TABLE_TH} rounded-tr-2xl text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td
              className={`${TABLE_TD} rounded-bl-2xl font-medium text-green-900`}
            >
              {month.label}
            </td>
            <td className={`${TABLE_TD} align-top`}>
              <SettlementsCell month={month} />
            </td>
            <td className={`${TABLE_TD} text-center`}>{month.itemCount}</td>
            <td className={`${TABLE_TD} rounded-br-2xl text-right font-medium`}>
              {formatCurrency(month.totalSpent)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
