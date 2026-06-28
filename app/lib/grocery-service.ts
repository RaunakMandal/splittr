import { computeMonthSummaries } from "./grouping";
import type { MonthSummary } from "./grouping";
import {
  createEmptyItem,
  isValidItem,
  validateItem,
  validateItemFields,
  validateItems,
} from "./items";
import {
  getGroceryCollection,
  isDuplicateKeyError,
  monthFilter,
  toGroceryItem,
  toObjectId,
} from "./mongodb";
import { ObjectId } from "mongodb";
import type { GroceryItem } from "./types";
import { collectCategories } from "./categories";

export interface MonthSummaryDetail extends MonthSummary {
  categoryBreakdown: { category: string; total: number }[];
}

function categoryBreakdown(items: GroceryItem[]) {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.price);
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export async function listItems(monthKey?: string): Promise<GroceryItem[]> {
  const collection = await getGroceryCollection();
  const docs = await collection
    .find(monthKey ? monthFilter(monthKey) : {})
    .sort({ purchaseDate: 1 })
    .toArray();

  return docs
    .map((doc) => toGroceryItem(doc))
    .filter((item): item is GroceryItem => item !== null);
}

export async function getItemById(id: string): Promise<GroceryItem | null> {
  const collection = await getGroceryCollection();
  if (ObjectId.isValid(id)) {
    const byObjectId = toGroceryItem(
      await collection.findOne({ _id: toObjectId(id) })
    );
    if (byObjectId) return byObjectId;
  }
  return toGroceryItem(await collection.findOne({ id }));
}

export async function createItem(
  input: Partial<GroceryItem>
): Promise<GroceryItem> {
  const draft = validateItemFields({ ...createEmptyItem(), ...input });
  if (!draft) throw new Error("Invalid item data");
  if (!isValidItem(draft)) throw new Error("Item name and price are required");

  const collection = await getGroceryCollection();
  try {
    const result = await collection.insertOne(draft);
    const item = toGroceryItem({
      _id: result.insertedId,
      ...draft,
    });
    if (!item) throw new Error("Failed to create item");
    return item;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new Error("An item with this id already exists");
    }
    throw error;
  }
}

export async function createItems(
  inputs: Partial<GroceryItem>[]
): Promise<GroceryItem[]> {
  if (inputs.length === 0) throw new Error("No items to create");

  const drafts = inputs.map((input, index) => {
    const draft = validateItemFields({ ...createEmptyItem(), ...input });
    if (!draft) throw new Error(`Invalid item data at index ${index}`);
    if (!isValidItem(draft)) {
      throw new Error(`Item name and price are required at index ${index}`);
    }
    return draft;
  });

  const collection = await getGroceryCollection();
  const result = await collection.insertMany(drafts);

  return drafts.map((draft, index) => {
    const item = toGroceryItem({ _id: result.insertedIds[index], ...draft });
    if (!item) throw new Error(`Failed to create item at index ${index}`);
    return item;
  });
}

export async function updateItem(
  id: string,
  updates: Partial<GroceryItem>
): Promise<GroceryItem> {
  const existing = await getItemById(id);
  if (!existing) throw new Error("Item not found");

  const merged = validateItemFields({ ...existing, ...updates });
  if (!merged) throw new Error("Invalid item data");
  if (!isValidItem(merged)) throw new Error("Item name and price are required");

  const collection = await getGroceryCollection();
  const filter = ObjectId.isValid(id) ? { _id: toObjectId(id) } : { id };
  const result = await collection.findOneAndReplace(filter, merged, {
    returnDocument: "after",
  });
  const saved = toGroceryItem(result);
  if (!saved) throw new Error("Item not found");
  return saved;
}

export async function deleteItem(id: string): Promise<GroceryItem> {
  const collection = await getGroceryCollection();
  const filter = ObjectId.isValid(id) ? { _id: toObjectId(id) } : { id };
  const deleted = await collection.findOneAndDelete(filter);
  const item = toGroceryItem(deleted);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function replaceAllItems(raw: unknown): Promise<GroceryItem[]> {
  if (!Array.isArray(raw)) throw new Error("Items must be an array");
  const items = validateItems(raw);
  const docs = items.map(({ id: _id, ...fields }) => fields);

  const collection = await getGroceryCollection();
  await collection.deleteMany({});
  if (docs.length > 0) {
    await collection.insertMany(docs);
  }
  return listItems();
}

export async function listSummaries(): Promise<MonthSummary[]> {
  const items = await listItems();
  return computeMonthSummaries(items);
}

export async function listCategories(): Promise<string[]> {
  const items = await listItems();
  return collectCategories(items);
}

export async function getMonthSummary(
  monthKey: string
): Promise<MonthSummaryDetail | null> {
  const monthItems = await listItems(monthKey);
  if (monthItems.length === 0) return null;

  const summary = computeMonthSummaries(monthItems)[0];
  if (!summary) return null;

  return {
    ...summary,
    categoryBreakdown: categoryBreakdown(monthItems),
  };
}
