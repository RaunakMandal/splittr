"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createItem as createItemApi,
  deleteItemApi,
  fetchCategories,
  fetchItems,
  fetchSummaries,
  importReceiptItems,
  updateItemApi,
} from "../lib/api-client";
import { getErrorMessage } from "../lib/errors";
import { createEmptyItem } from "../lib/items";
import type { MonthSummary } from "../lib/grouping";
import type { GroceryItem, NewGroceryItem } from "../lib/types";
import { useMonthSelectionState } from "./MonthSelectionContext";

interface GroceryContextValue {
  items: GroceryItem[];
  monthSummaries: MonthSummary[];
  categories: string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  clearError: () => void;
  reloadItems: () => Promise<void>;
  addItem: (item: NewGroceryItem) => Promise<void>;
  addItems: (items: NewGroceryItem[]) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
  createDraftItem: () => NewGroceryItem;
}

const GroceryContext = createContext<GroceryContextValue | null>(null);

export function GroceryProvider({ children }: { children: ReactNode }) {
  const { selectedMonthKey } = useMonthSelectionState();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [monthSummaries, setMonthSummaries] = useState<MonthSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const reloadMonthSummaries = useCallback(async () => {
    const summaries = await fetchSummaries();
    setMonthSummaries(summaries);
  }, []);

  const reloadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchItems(selectedMonthKey);
      setItems(fetched);
    } catch (err) {
      setItems([]);
      setError(getErrorMessage(err, "Failed to load items"));
      throw err;
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [selectedMonthKey]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    reloadItems().catch(() => undefined);
  }, [reloadItems]);

  useEffect(() => {
    reloadMonthSummaries().catch(() => undefined);
  }, [reloadMonthSummaries]);

  const refreshAfterMutation = useCallback(async () => {
    await reloadMonthSummaries().catch(() => undefined);
  }, [reloadMonthSummaries]);

  const addItem = useCallback(
    async (item: NewGroceryItem) => {
      setSaving(true);
      setError(null);
      try {
        await createItemApi(item);
        await Promise.all([reloadItems(), refreshAfterMutation()]);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to save item"));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [reloadItems, refreshAfterMutation]
  );

  const addItems = useCallback(
    async (incoming: NewGroceryItem[]) => {
      setSaving(true);
      setError(null);
      try {
        await importReceiptItems(incoming);
        await Promise.all([reloadItems(), refreshAfterMutation()]);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to import items"));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [reloadItems, refreshAfterMutation]
  );

  const removeItem = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);
      try {
        await deleteItemApi(id);
        await Promise.all([reloadItems(), refreshAfterMutation()]);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to delete item"));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [reloadItems, refreshAfterMutation]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<GroceryItem>) => {
      setSaving(true);
      setError(null);
      try {
        await updateItemApi(id, updates);
        await Promise.all([reloadItems(), refreshAfterMutation()]);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update item"));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [reloadItems, refreshAfterMutation]
  );

  const createDraftItem = useCallback(() => createEmptyItem(), []);

  if (initialLoad && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-base text-primary">
        Loading…
      </div>
    );
  }

  return (
    <GroceryContext.Provider
      value={{
        items,
        monthSummaries,
        categories,
        loading,
        saving,
        error,
        clearError,
        reloadItems,
        addItem,
        addItems,
        removeItem,
        updateItem,
        createDraftItem,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error("useGrocery must be used within GroceryProvider");
  return ctx;
}

export { PEOPLE } from "../lib/config";
