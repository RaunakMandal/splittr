import type { Person } from "./config";

export type { Person } from "./config";
export { PEOPLE, createDefaultParticipants, isPerson } from "./config";

export type Participants = Record<Person, boolean>;

export interface GroceryItem {
  id: string;
  purchaseDate: string;
  item: string;
  category: string;
  price: number;
  participants: Participants;
  paidBy: Person;
}

export type NewGroceryItem = Omit<GroceryItem, "id">;

export interface PersonSummary {
  person: Person;
  totalShare: number;
  totalPaid: number;
  balance: number;
}

export interface Settlement {
  from: Person;
  to: Person;
  amount: number;
}

export interface PairwiseItemContribution {
  item: string;
  purchaseDate: string;
  price: number;
  share: number;
  paidBy: Person;
}

export interface PairwiseRelationship {
  personA: Person;
  personB: Person;
  aOwesB: number;
  bOwesA: number;
  aOwesBItems: PairwiseItemContribution[];
  bOwesAItems: PairwiseItemContribution[];
  netSettlement: Settlement | null;
}

export interface ParsedReceiptLine {
  item: string;
  price: number;
  category: string;
}

export interface ReceiptParseResult {
  purchaseDate: string | null;
  storeName: string | null;
  lines: ParsedReceiptLine[];
}

export interface ReceiptImportDefaults {
  paidBy: Person;
  participants: Participants;
  purchaseDate?: string;
}
