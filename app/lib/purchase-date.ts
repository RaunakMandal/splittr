/** Normalize any supported date value to UTC midnight ISO string for storage. */
export function toPurchaseDateIso(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Purchase date is required");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid purchase date");
  }

  const date = new Date(parsed);
  const dateOnly = `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  return `${dateOnly}T00:00:00.000Z`;
}

export function tryToPurchaseDateIso(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return toPurchaseDateIso(value);
  } catch {
    return null;
  }
}

export function todayPurchaseDateIso(): string {
  return toPurchaseDateIso(new Date().toISOString());
}

/** YYYY-MM-DD for `<input type="date">`. */
export function toPurchaseDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function formatPurchaseDateDisplay(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso.slice(0, 10);
  return `${day}-${month}-${year}`;
}

export function getMonthKeyFromPurchaseDate(iso: string): string {
  return iso.slice(0, 7);
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function monthStartIso(monthKey: string): string {
  return `${monthKey}-01T00:00:00.000Z`;
}

export function monthEndIsoExclusive(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  return `${next[0]}-${String(next[1]).padStart(2, "0")}-01T00:00:00.000Z`;
}

export function monthFilter(monthKey: string) {
  return {
    purchaseDate: {
      $gte: monthStartIso(monthKey),
      $lt: monthEndIsoExclusive(monthKey),
    },
  };
}
