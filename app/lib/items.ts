import {
  DEFAULT_CATEGORY,
  DEFAULT_PAID_BY,
  PEOPLE,
  createDefaultParticipants,
  isPerson,
} from "./config";
import type { GroceryItem } from "./types";
import { isValidCategory, normalizeCategory } from "./categories";
import { toPurchaseDateIso, todayPurchaseDateIso } from "./purchase-date";

export function createEmptyItem(): Omit<GroceryItem, "id"> {
  return {
    purchaseDate: todayPurchaseDateIso(),
    item: "",
    category: DEFAULT_CATEGORY,
    price: 0,
    participants: createDefaultParticipants(),
    paidBy: DEFAULT_PAID_BY,
  };
}

export function isValidItem(item: Pick<GroceryItem, "item" | "price">): boolean {
  return item.item.trim().length > 0 && item.price > 0;
}

function isValidParticipants(
  participants: unknown
): participants is GroceryItem["participants"] {
  if (typeof participants !== "object" || participants === null) return false;
  return PEOPLE.every(
    (person) =>
      person in participants &&
      typeof (participants as Record<string, unknown>)[person] === "boolean"
  );
}

export function validateItemFields(data: unknown): Omit<GroceryItem, "id"> | null {
  if (typeof data !== "object" || data === null) return null;
  const item = data as Partial<GroceryItem>;
  if (
    typeof item.purchaseDate !== "string" ||
    typeof item.item !== "string" ||
    typeof item.price !== "number" ||
    typeof item.paidBy !== "string" ||
    !isPerson(item.paidBy) ||
    !isValidParticipants(item.participants) ||
    typeof item.category !== "string" ||
    !isValidCategory(item.category)
  ) {
    return null;
  }
  return {
    purchaseDate: toPurchaseDateIso(item.purchaseDate),
    item: item.item,
    price: item.price,
    paidBy: item.paidBy,
    participants: item.participants as GroceryItem["participants"],
    category: normalizeCategory(item.category),
  };
}

export function validateItem(data: unknown): GroceryItem | null {
  if (typeof data !== "object" || data === null) return null;
  const item = data as Partial<GroceryItem>;
  if (typeof item.id !== "string" || !item.id) return null;

  const fields = validateItemFields(item);
  if (!fields) return null;

  return { ...fields, id: item.id };
}

export function validateItems(data: unknown): GroceryItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => validateItem(item))
    .filter((item): item is GroceryItem => item !== null);
}
