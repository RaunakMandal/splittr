import { jsonError, jsonOk, parseJsonBody } from "../../../lib/api-utils";
import { getErrorMessage } from "../../../lib/errors";
import {
  deleteItem,
  getItemById,
  updateItem,
} from "../../../lib/grocery-service";
import type { GroceryItem } from "../../../lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await getItemById(id);
    if (!item) return jsonError("Item not found", 404);
    return jsonOk({ item });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load item"), 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await parseJsonBody<
      { item?: Partial<GroceryItem> } & Partial<GroceryItem>
    >(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const updates = body.item ?? body;
    const item = await updateItem(id, updates);
    return jsonOk({ item, success: true });
  } catch (error) {
    const message = getErrorMessage(error, "Failed to update item");
    const status = message === "Item not found" ? 404 : 400;
    return jsonError(message, status);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await deleteItem(id);
    return jsonOk({ item, success: true });
  } catch (error) {
    const message = getErrorMessage(error, "Failed to delete item");
    const status = message === "Item not found" ? 404 : 500;
    return jsonError(message, status);
  }
}
