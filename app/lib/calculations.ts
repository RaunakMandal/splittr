import type {
  GroceryItem,
  PairwiseItemContribution,
  PairwiseRelationship,
  Person,
  PersonSummary,
  Settlement,
} from "./types";
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

function computeGrossDebt(
  from: Person,
  to: Person,
  items: GroceryItem[]
): number {
  return items.reduce((sum, item) => {
    if (item.paidBy === to && item.participants[from]) {
      return sum + getShare(item.price, item.participants, from);
    }
    return sum;
  }, 0);
}

function computeGrossDebtItems(
  from: Person,
  to: Person,
  items: GroceryItem[]
): PairwiseItemContribution[] {
  return items
    .filter((item) => item.paidBy === to && item.participants[from])
    .map((item) => ({
      item: item.item,
      purchaseDate: item.purchaseDate,
      price: item.price,
      share: getShare(item.price, item.participants, from),
      paidBy: item.paidBy,
    }))
    .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
}

export function computePairwiseRelationships(
  items: GroceryItem[]
): PairwiseRelationship[] {
  const relationships: PairwiseRelationship[] = [];

  for (let i = 0; i < PEOPLE.length; i++) {
    for (let j = i + 1; j < PEOPLE.length; j++) {
      const personA = PEOPLE[i];
      const personB = PEOPLE[j];
      const aOwesB = computeGrossDebt(personA, personB, items);
      const bOwesA = computeGrossDebt(personB, personA, items);
      const aOwesBItems = computeGrossDebtItems(personA, personB, items);
      const bOwesAItems = computeGrossDebtItems(personB, personA, items);
      const net = aOwesB - bOwesA;

      let netSettlement: Settlement | null = null;
      if (net > 0.005) {
        netSettlement = { from: personA, to: personB, amount: net };
      } else if (net < -0.005) {
        netSettlement = { from: personB, to: personA, amount: -net };
      }

      relationships.push({
        personA,
        personB,
        aOwesB,
        bOwesA,
        aOwesBItems,
        bOwesAItems,
        netSettlement,
      });
    }
  }

  return relationships;
}

export function computeSettlements(items: GroceryItem[]): Settlement[] {
  return computePairwiseRelationships(items)
    .map((relationship) => relationship.netSettlement)
    .filter((settlement): settlement is Settlement => settlement !== null)
    .sort((a, b) => b.amount - a.amount);
}
