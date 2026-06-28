import { jsonError, jsonOk, parseJsonBody } from "../../../lib/api-utils";
import { getErrorMessage } from "../../../lib/errors";
import { createItems } from "../../../lib/grocery-service";
import {
  mapReceiptToItems,
  normalizeReceiptParseResult,
} from "../../../lib/receipt-parser";
import type {
  GroceryItem,
  ReceiptImportDefaults,
  ReceiptParseResult,
} from "../../../lib/types";
import { isPerson, PEOPLE } from "../../../lib/config";

function isValidDefaults(value: unknown): value is ReceiptImportDefaults {
  if (typeof value !== "object" || value === null) return false;
  const defaults = value as Partial<ReceiptImportDefaults>;
  if (typeof defaults.paidBy !== "string" || !isPerson(defaults.paidBy)) {
    return false;
  }
  if (
    typeof defaults.participants !== "object" ||
    defaults.participants === null
  ) {
    return false;
  }
  return PEOPLE.every(
    (person) =>
      person in defaults.participants! &&
      typeof defaults.participants![person] === "boolean"
  );
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{
      result?: unknown;
      defaults?: unknown;
      items?: Partial<GroceryItem>[];
    }>(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    if (Array.isArray(body.items) && body.items.length > 0) {
      const items = await createItems(body.items);
      return jsonOk({ items, success: true }, 201);
    }

    if (!body.result || !isValidDefaults(body.defaults)) {
      return jsonError("Receipt result and import defaults are required", 400);
    }

    const parsed = normalizeReceiptParseResult(body.result);
    if (parsed.lines.length === 0) {
      return jsonError("No items to import", 400);
    }

    const drafts = mapReceiptToItems(parsed, body.defaults);
    const items = await createItems(drafts);

    return jsonOk({ items, success: true }, 201);
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to import receipt"), 400);
  }
}
