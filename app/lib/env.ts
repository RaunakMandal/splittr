import { CATEGORIES } from "./config";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function requiredEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function requiredFloatEnv(name: string): number {
  const raw = requiredEnv(name);
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a number`);
  }
  return value;
}

function buildReceiptSystemPrompt(): string {
  return `You extract grocery line items from receipt text for a household expense splitter.

Return ONLY valid JSON with this shape:
{
  "purchaseDate": "ISO-8601 UTC datetime or null if unknown, e.g. 2026-06-24T00:00:00.000Z",
  "storeName": "store name or null",
  "lines": [
    { "item": "product name", "price": 123.45, "category": "one of the allowed categories" }
  ]
}

Rules:
- Include only actual purchased products, not subtotals, order totals, delivery fees, platform fees, taxes-as-separate-lines, or payment lines.
- For each line item, price must be the final line total already calculated on the receipt — the amount actually charged for that product row after quantity, item-level discounts, and any per-line adjustments shown on the receipt.
- Prefer the rightmost or explicitly labelled final amount column (e.g. "Amount", "Total", "Net", "Final Price"). Do not use unit price, MRP, or pre-discount price when a lower final line amount is shown.
- If quantity and unit price are shown but a final line total is also shown, use the final line total. If only unit price and quantity are shown with no line total, use unit price × quantity.
- Prices must be positive numbers in the receipt currency (usually INR).
- Use concise product names.
- Pick the closest category from this list: ${CATEGORIES.join(", ")}.
- Find the purchase/order/delivery/invoice date on the receipt. Return it as purchaseDate in ISO-8601 UTC format (YYYY-MM-DDT00:00:00.000Z).
- Look for dates near labels like "Order Date", "Delivered on", "Invoice Date", or in the receipt header.
- If the receipt date is visible, use ISO-8601 UTC midnight format.
- If no items can be extracted, return { "purchaseDate": null, "storeName": null, "lines": [] }.`;
}

export function getOpenRouterConfig() {
  return {
    apiKey: requiredEnv("OPENROUTER_API_KEY"),
    url: requiredEnv("OPENROUTER_API_URL"),
    model: requiredEnv("OPENROUTER_MODEL"),
    temperature: requiredFloatEnv("OPENROUTER_TEMPERATURE"),
    appTitle: requiredEnv("OPENROUTER_APP_TITLE"),
    appUrl: requiredEnv("APP_URL"),
    systemPrompt: buildReceiptSystemPrompt(),
  };
}

export function getMongoUri(): string {
  return requiredEnv("MONGODB_URI");
}

export function getMongoCollectionName(): string {
  return requiredEnv("MONGODB_COLLECTION");
}

export function getMongoDbName(): string {
  return requiredEnv("MONGODB_DB_NAME");
}
