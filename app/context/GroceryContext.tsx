"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { collectCategories } from "../lib/categories";
import {
  createItem as createItemApi,
  deleteItemApi,
  fetchItems,
  importReceiptItems,
  updateItemApi,
} from "../lib/api-client";
import { getErrorMessage } from "../lib/errors";
import { createEmptyItem } from "../lib/items";
import type { GroceryItem, NewGroceryItem } from "../lib/types";

interface GroceryContextValue {
  items: GroceryItem[];
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
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<GroceryItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const clearError = useCallback(() => setError(null), []);

  const reloadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchItems();
      setItems(fetched);
      itemsRef.current = fetched;
    } catch (err) {
      setItems([]);
      itemsRef.current = [];
      setError(getErrorMessage(err, "Failed to load items"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadItems().catch(() => undefined);
  }, [reloadItems]);

  const addItem = useCallback(async (item: NewGroceryItem) => {
    setSaving(true);
    setError(null);
    try {
      const saved = await createItemApi(item);
      const next = [...itemsRef.current, saved];
      setItems(next);
      itemsRef.current = next;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save item"));
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const addItems = useCallback(async (incoming: NewGroceryItem[]) => {
    setSaving(true);
    setError(null);
    try {
      const saved = await importReceiptItems(incoming);
      const next = [...itemsRef.current, ...saved];
      setItems(next);
      itemsRef.current = next;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to import items"));
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteItemApi(id);
      const next = itemsRef.current.filter((item) => item.id !== id);
      setItems(next);
      itemsRef.current = next;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete item"));
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateItem = useCallback(
    async (id: string, updates: Partial<GroceryItem>) => {
      setSaving(true);
      setError(null);
      try {
        const saved = await updateItemApi(id, updates);
        const next = itemsRef.current.map((item) =>
          item.id === id ? saved : item
        );
        setItems(next);
        itemsRef.current = next;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update item"));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const createDraftItem = useCallback(() => createEmptyItem(), []);

  const categories = useMemo(() => collectCategories(items), [items]);

  if (loading) {
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
