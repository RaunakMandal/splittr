import { ObjectId, type Collection, type WithId } from "mongodb";
import { getMongoCollectionName, getMongoDbName, getMongoUri } from "./env";
import { validateItem } from "./items";
import { monthFilter as purchaseDateMonthFilter } from "./purchase-date";
import type { GroceryItem } from "./types";

export type GroceryItemDocument = Omit<GroceryItem, "id"> & { id?: string };

let collectionPromise: Promise<Collection<GroceryItemDocument>> | null = null;

export async function getGroceryCollection(): Promise<
  Collection<GroceryItemDocument>
> {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(getMongoUri());
      await client.connect();

      const collection = client
        .db(getMongoDbName())
        .collection<GroceryItemDocument>(getMongoCollectionName());

      await collection.createIndex({ purchaseDate: 1 });

      // Legacy unique index on `id` breaks bulk inserts when `id` is omitted.
      const indexes = await collection.indexes();
      if (indexes.some((index) => index.name === "id_1")) {
        await collection.dropIndex("id_1");
      }

      return collection;
    })();
  }
  return collectionPromise;
}

export function monthFilter(monthKey: string) {
  return purchaseDateMonthFilter(monthKey);
}

export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid item id");
  }
  return new ObjectId(id);
}

export function toGroceryItem(
  doc: (WithId<GroceryItemDocument> & { id?: string }) | null
): GroceryItem | null {
  if (!doc) return null;
  const { _id, id: legacyId, ...fields } = doc;
  const id = _id?.toHexString() ?? legacyId;
  if (!id) return null;
  return validateItem({ ...fields, id });
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}
