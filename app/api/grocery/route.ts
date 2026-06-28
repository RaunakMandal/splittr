import { jsonError, jsonOk, parseJsonBody } from "../../lib/api-utils";
import { getErrorMessage } from "../../lib/errors";
import {
  createItem,
  listItems,
  replaceAllItems,
} from "../../lib/grocery-service";
import type { GroceryItem } from "../../lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ?? undefined;
    const items = await listItems(month);
    return jsonOk({ items });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load items"), 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<
      { item?: Partial<GroceryItem> } & Partial<GroceryItem>
    >(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const input = body.item ?? body;
    const item = await createItem(input);
    return jsonOk({ item, success: true }, 201);
  } catch (error) {
    const message = getErrorMessage(error, "Failed to create item");
    const status = message.includes("already exists") ? 409 : 400;
    return jsonError(message, status);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await parseJsonBody<{ items?: unknown } | unknown>(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const raw =
      typeof body === "object" && body !== null && "items" in body
        ? (body as { items: unknown }).items
        : body;

    const items = await replaceAllItems(raw);
    return jsonOk({ items, success: true });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to save items"), 400);
  }
}
