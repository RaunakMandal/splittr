import type { GroceryItem, Person, PersonSummary, Settlement } from "./types";
import { PEOPLE } from "./types";

export function getSplitWays(
  participants: GroceryItem["participants"]
): number {
  const count = PEOPLE.filter((p) => participants[p]).length;
  return Math.max(count, 1);
}

export function getShare(
  price: number,
  participants: GroceryItem["participants"],
  person: Person
): number {
  if (!participants[person]) return 0;
  return price / getSplitWays(participants);
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function computePersonSummaries(items: GroceryItem[]): PersonSummary[] {
  return PEOPLE.map((person) => {
    const totalShare = items.reduce(
      (sum, item) => sum + getShare(item.price, item.participants, person),
      0
    );
    const totalPaid = items.reduce(
      (sum, item) => sum + (item.paidBy === person ? item.price : 0),
      0
    );
    return {
      person,
      totalShare,
      totalPaid,
      balance: totalPaid - totalShare,
    };
  });
}

export function computeSettlements(items: GroceryItem[]): Settlement[] {
  const summaries = computePersonSummaries(items);
  const creditors = summaries
    .filter((s) => s.balance > 0.005)
    .map((s) => ({ person: s.person, amount: s.balance }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = summaries
    .filter((s) => s.balance < -0.005)
    .map((s) => ({ person: s.person, amount: -s.balance }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.005) {
      settlements.push({
        from: debtors[i].person,
        to: creditors[j].person,
        amount,
      });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
  }

  return settlements;
}
