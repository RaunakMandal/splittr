import { PDFParse } from "pdf-parse";
import { CATEGORIES, DEFAULT_CATEGORY, RECEIPT_MAX_PDF_BYTES } from "./config";
import { extractReceiptFromImage, extractReceiptFromText } from "./openrouter";
import { type ReceiptMimeType, resolveReceiptMimeType } from "./receipt-upload";
import { createEmptyItem } from "./items";
import { normalizeCategory } from "./categories";
import { tryToPurchaseDateIso } from "./purchase-date";
import type {
  GroceryItem,
  ParsedReceiptLine,
  ReceiptImportDefaults,
  ReceiptParseResult,
} from "./types";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

function normalizeCategoryFromAi(category: unknown): string {
  if (typeof category !== "string" || !category.trim()) {
    return DEFAULT_CATEGORY;
  }

  const trimmed = normalizeCategory(category);
  const exact = CATEGORIES.find(
    (value) => value.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  const partial = CATEGORIES.find(
    (value) =>
      trimmed.toLowerCase().includes(value.toLowerCase()) ||
      value.toLowerCase().includes(trimmed.toLowerCase())
  );
  return partial ?? trimmed;
}

export function normalizePurchaseDate(value: unknown): string | null {
  return tryToPurchaseDateIso(value);
}

const RECEIPT_DATE_PATTERNS = [
  /(?:order|invoice|delivery|delivered|purchase|bill|date)[:\s]+(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})/gi,
  /(?:order|invoice|delivery|delivered|purchase|bill|date)[:\s]+(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/gi,
  /\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})\b/g,
  /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi,
];

export function extractPurchaseDateFromText(text: string): string | null {
  for (const pattern of RECEIPT_DATE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const candidate = normalizePurchaseDate(match[1] ?? match[0]);
      if (candidate) return candidate;
    }
  }
  return null;
}

function normalizeLine(raw: unknown): ParsedReceiptLine | null {
  if (typeof raw !== "object" || raw === null) return null;
  const line = raw as Record<string, unknown>;
  if (typeof line.item !== "string" || typeof line.price !== "number") {
    return null;
  }

  const item = line.item.trim();
  const price = line.price;
  if (!item || !Number.isFinite(price) || price <= 0) return null;

  return {
    item,
    price: Math.round(price * 100) / 100,
    category: normalizeCategoryFromAi(line.category),
  };
}

export function normalizeReceiptParseResult(raw: unknown): ReceiptParseResult {
  if (typeof raw !== "object" || raw === null) {
    return { purchaseDate: null, storeName: null, lines: [] };
  }

  const data = raw as Record<string, unknown>;
  const purchaseDate = normalizePurchaseDate(data.purchaseDate);
  const storeName =
    typeof data.storeName === "string" && data.storeName.trim()
      ? data.storeName.trim()
      : null;

  const lines = Array.isArray(data.lines)
    ? data.lines
        .map((line) => normalizeLine(line))
        .filter((line): line is ParsedReceiptLine => line !== null)
    : [];

  return { purchaseDate, storeName, lines };
}

export async function parseReceiptFile(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<ReceiptParseResult> {
  const maxBytes = RECEIPT_MAX_PDF_BYTES;
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  if (buffer.byteLength === 0) {
    throw new Error("Uploaded file is empty");
  }
  if (buffer.byteLength > maxBytes) {
    throw new Error(`Receipt must be ${maxMb} MB or smaller`);
  }

  const mimeType = resolveReceiptMimeType(fileName, fileType);
  if (!mimeType) {
    throw new Error("Only PDF, JPG, and PNG receipts are supported");
  }

  return parseReceiptByMime(buffer, mimeType);
}

async function parseReceiptByMime(
  buffer: Buffer,
  mimeType: ReceiptMimeType
): Promise<ReceiptParseResult> {
  let raw: unknown;
  let receiptText = "";

  if (mimeType === "application/pdf") {
    receiptText = await extractPdfText(buffer);
    if (!receiptText) {
      throw new Error(
        "Could not extract text from this PDF. Try a text-based receipt PDF or upload a photo."
      );
    }
    raw = await extractReceiptFromText(receiptText);
  } else {
    raw = await extractReceiptFromImage(buffer, mimeType);
  }

  const parsed = normalizeReceiptParseResult(raw);
  const purchaseDate =
    parsed.purchaseDate ??
    (receiptText ? extractPurchaseDateFromText(receiptText) : null);

  if (parsed.lines.length === 0) {
    throw new Error("No grocery items were found in this receipt");
  }

  return { ...parsed, purchaseDate };
}

/** @deprecated Use parseReceiptFile */
export async function parseReceiptPdf(
  buffer: Buffer
): Promise<ReceiptParseResult> {
  return parseReceiptFile(buffer, "receipt.pdf", "application/pdf");
}

export function mapReceiptToItems(
  parsed: ReceiptParseResult,
  defaults: ReceiptImportDefaults
): Omit<GroceryItem, "id">[] {
  const purchaseDate =
    defaults.purchaseDate ??
    parsed.purchaseDate ??
    createEmptyItem().purchaseDate;

  return parsed.lines.map((line) => ({
    purchaseDate,
    item: line.item,
    category: line.category,
    price: line.price,
    participants: { ...defaults.participants },
    paidBy: defaults.paidBy,
  }));
}
