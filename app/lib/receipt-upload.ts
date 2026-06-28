export const RECEIPT_ACCEPT =
  "application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png";

export const RECEIPT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type ReceiptMimeType = (typeof RECEIPT_MIME_TYPES)[number];

const EXTENSION_MIME: Record<string, ReceiptMimeType> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export function resolveReceiptMimeType(
  fileName: string,
  fileType: string
): ReceiptMimeType | null {
  const normalizedType = fileType.trim().toLowerCase();
  if (RECEIPT_MIME_TYPES.includes(normalizedType as ReceiptMimeType)) {
    return normalizedType as ReceiptMimeType;
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[extension] ?? null;
}

export function isAllowedReceiptFile(file: File): boolean {
  return resolveReceiptMimeType(file.name, file.type) !== null;
}

export function receiptFileLabel(): string {
  return "PDF, JPG, or PNG";
}
