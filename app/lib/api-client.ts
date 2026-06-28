import type { MonthSummary } from "./grouping";
import type { MonthSummaryDetail } from "./grocery-service";
import type { GroceryItem, NewGroceryItem, ReceiptParseResult } from "./types";

import { getErrorMessage } from "./errors";
import { clearAuthToken, getAuthToken } from "./site-auth-client";

function authHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    headers: authHeaders(init),
  });

  if (response.status === 401 && typeof window !== "undefined") {
    clearAuthToken();
    window.location.assign("/login");
  }

  return response;
}

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      res.ok
        ? "Server returned an unexpected response"
        : `Request failed (${res.status}). Check server logs or env configuration.`
    );
  }

  let data: T & { error?: string };
  try {
    data = JSON.parse(raw) as T & { error?: string };
  } catch {
    throw new Error(
      `Request failed (${res.status}) with invalid JSON response`
    );
  }

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data.error, `Request failed (${res.status})`)
    );
  }

  return data;
}

export async function fetchItems(month?: string): Promise<GroceryItem[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const data = await parseJson<{ items: GroceryItem[] }>(
    await authFetch(`/api/grocery${query}`)
  );
  return data.items;
}

export async function fetchItem(id: string): Promise<GroceryItem> {
  const data = await parseJson<{ item: GroceryItem }>(
    await authFetch(`/api/grocery/${id}`)
  );
  return data.item;
}

export async function createItem(item: NewGroceryItem): Promise<GroceryItem> {
  const data = await parseJson<{ item: GroceryItem }>(
    await authFetch("/api/grocery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item }),
    })
  );
  return data.item;
}

export async function updateItemApi(
  id: string,
  updates: Partial<GroceryItem>
): Promise<GroceryItem> {
  const data = await parseJson<{ item: GroceryItem }>(
    await authFetch(`/api/grocery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: updates }),
    })
  );
  return data.item;
}

export async function deleteItemApi(id: string): Promise<GroceryItem> {
  const data = await parseJson<{ item: GroceryItem }>(
    await authFetch(`/api/grocery/${id}`, { method: "DELETE" })
  );
  return data.item;
}

export async function fetchCategories(): Promise<string[]> {
  const data = await parseJson<{ categories: string[] }>(
    await authFetch("/api/categories")
  );
  return data.categories;
}

export async function fetchSummaries(): Promise<MonthSummary[]> {
  const data = await parseJson<{ summaries: MonthSummary[] }>(
    await authFetch("/api/summary")
  );
  return data.summaries;
}

export async function fetchMonthSummary(
  monthKey: string
): Promise<MonthSummaryDetail> {
  const data = await parseJson<{ summary: MonthSummaryDetail }>(
    await authFetch(`/api/summary/${monthKey}`)
  );
  return data.summary;
}

export async function parseReceiptFile(
  file: File
): Promise<ReceiptParseResult> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await parseJson<{ result: ReceiptParseResult }>(
    await authFetch("/api/receipt/parse", {
      method: "POST",
      body: formData,
    })
  );
  return data.result;
}

/** @deprecated Use parseReceiptFile */
export async function parseReceiptPdf(file: File): Promise<ReceiptParseResult> {
  return parseReceiptFile(file);
}

export async function importReceiptItems(
  items: NewGroceryItem[]
): Promise<GroceryItem[]> {
  const data = await parseJson<{ items: GroceryItem[] }>(
    await authFetch("/api/receipt/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
  );
  return data.items;
}
