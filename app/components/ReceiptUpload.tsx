"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { AppShell, FullPageSection, SectionLabel } from "./AppShell";
import { CategorySelect } from "./CategorySelect";
import { ErrorAlert } from "./ErrorAlert";
import { useGrocery, PEOPLE } from "../context/GroceryContext";
import { formatCurrency } from "../lib/calculations";
import { DEFAULT_PAID_BY, RECEIPT_MAX_PDF_BYTES } from "../lib/config";
import { createEmptyItem } from "../lib/items";
import { parseReceiptFile } from "../lib/api-client";
import { getErrorMessage } from "../lib/errors";
import {
  isAllowedReceiptFile,
  RECEIPT_ACCEPT,
  receiptFileLabel,
} from "../lib/receipt-upload";
import { toPurchaseDateInput, toPurchaseDateIso } from "../lib/purchase-date";
import type {
  GroceryItem,
  NewGroceryItem,
  Person,
  ReceiptParseResult,
} from "../lib/types";
import {
  BTN_PRIMARY,
  CARD,
  INPUT,
  TABLE,
  TABLE_TD,
  TABLE_TH_STICKY,
} from "../lib/ui";

type Step = "upload" | "review";

type ReviewItem = NewGroceryItem & { clientKey: string };

export function ReceiptUpload() {
  const router = useRouter();
  const { categories, addItems } = useGrocery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ReceiptParseResult | null>(
    null
  );
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [paidBy, setPaidBy] = useState<Person>(DEFAULT_PAID_BY);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );

  const reset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setParseResult(null);
    setItems([]);
    setError(null);
    setParsing(false);
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    (nextFile: File | null) => {
      if (parsing) return;
      setError(null);
      if (!nextFile) {
        setFile(null);
        return;
      }
      if (!isAllowedReceiptFile(nextFile)) {
        setError(`Please upload a ${receiptFileLabel()} receipt`);
        return;
      }
      setFile(nextFile);
    },
    [parsing]
  );

  const handleParse = useCallback(async () => {
    if (!file) {
      setError(`Choose a ${receiptFileLabel()} receipt first`);
      return;
    }

    setParsing(true);
    setError(null);
    try {
      const result = await parseReceiptFile(file);
      const defaults = createEmptyItem();
      const purchaseDate = result.purchaseDate ?? defaults.purchaseDate;
      const mapped = result.lines.map((line, index) => ({
        clientKey: `row-${index}`,
        purchaseDate,
        item: line.item,
        category: line.category,
        price: line.price,
        participants: { ...defaults.participants },
        paidBy,
      }));

      setParseResult(result);
      setItems(mapped);
      setStep("review");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to parse receipt"));
    } finally {
      setParsing(false);
    }
  }, [file, paidBy]);

  const setAllPurchaseDates = useCallback((dateInput: string) => {
    const purchaseDate = toPurchaseDateIso(dateInput);
    setItems((current) => current.map((item) => ({ ...item, purchaseDate })));
  }, []);

  const updateItem = useCallback(
    (clientKey: string, updates: Partial<NewGroceryItem>) => {
      setItems((current) =>
        current.map((item) =>
          item.clientKey === clientKey ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  const removeItem = useCallback((clientKey: string) => {
    setItems((current) =>
      current.filter((item) => item.clientKey !== clientKey)
    );
  }, []);

  const toggleItemParticipant = useCallback(
    (clientKey: string, person: Person) => {
      setItems((current) =>
        current.map((item) => {
          if (item.clientKey !== clientKey) return item;
          const next = {
            ...item.participants,
            [person]: !item.participants[person],
          };
          if (!PEOPLE.some((p) => next[p])) return item;
          return { ...item, participants: next };
        })
      );
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (items.length === 0) {
      setError("Add at least one item before saving");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addItems(items.map(({ clientKey: _clientKey, ...item }) => item));
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save items"));
    } finally {
      setSaving(false);
    }
  }, [addItems, items, router]);

  return (
    <AppShell>
      <FullPageSection>
        <SectionLabel>Receipt upload</SectionLabel>

        {error && (
          <ErrorAlert
            message={error}
            onDismiss={() => setError(null)}
            className="mb-3 shrink-0"
          />
        )}

        {step === "upload" && (
          <div className={`${CARD} p-5`}>
            <p className="mb-4 text-sm text-green-800">
              Upload a grocery receipt ({receiptFileLabel()}). The app extracts
              line items with OpenRouter, then lets you set the split per item
              before saving.
            </p>

            <div
              onDragOver={(event) => {
                if (parsing) return;
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                if (parsing) return;
                event.preventDefault();
                setDragOver(false);
                handleFile(event.dataTransfer.files[0] ?? null);
              }}
              className={`mb-4 flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                parsing
                  ? "cursor-not-allowed border-green-200 bg-green-50/20 opacity-60"
                  : dragOver
                  ? "cursor-pointer border-[#2d6a4f] bg-green-50"
                  : "cursor-pointer border-green-200 bg-green-50/40"
              }`}
              onClick={() => {
                if (!parsing) fileInputRef.current?.click();
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={RECEIPT_ACCEPT}
                disabled={parsing}
                className="hidden"
                onChange={(event) =>
                  handleFile(event.target.files?.[0] ?? null)
                }
              />
              <p className="text-sm font-medium text-green-900">
                {parsing
                  ? "Parsing receipt…"
                  : file
                  ? file.name
                  : `Drop a receipt here or click to browse`}
              </p>
              <p className="mt-1 text-xs text-green-700">
                {receiptFileLabel()}, up to{" "}
                {Math.round(RECEIPT_MAX_PDF_BYTES / (1024 * 1024))} MB
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-green-900">
                  Paid by
                </span>
                <select
                  value={paidBy}
                  onChange={(event) => setPaidBy(event.target.value as Person)}
                  disabled={parsing}
                  className={`${INPUT} w-full max-w-xs disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {PEOPLE.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={handleParse}
              disabled={!file || parsing}
              className={`${BTN_PRIMARY} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {parsing ? "Parsing receipt…" : "Parse receipt"}
            </button>
          </div>
        )}

        {step === "review" && parseResult && (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className={`${CARD} shrink-0 p-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {parseResult.storeName ?? "Parsed receipt"}
                  </p>
                  <p className="text-xs text-green-700">
                    {items.length} items · {formatCurrency(total)}
                  </p>
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <span className="font-medium text-green-900">Date</span>
                    <input
                      type="date"
                      value={toPurchaseDateInput(items[0]?.purchaseDate ?? "")}
                      onChange={(event) =>
                        setAllPurchaseDates(event.target.value)
                      }
                      className={`${INPUT} w-[9.5rem]`}
                    />
                    {!parseResult.purchaseDate && (
                      <span className="text-xs text-amber-700">
                        Not found on receipt — set manually
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={reset} className={BTN_PRIMARY}>
                    Upload another
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || items.length === 0}
                    className={BTN_PRIMARY}
                  >
                    {saving ? "Saving…" : "Save to database"}
                  </button>
                </div>
              </div>
            </div>

            <div className={`${CARD} min-h-0 flex-1 overflow-auto`}>
              <table className={TABLE}>
                <thead>
                  <tr>
                    <th className={TABLE_TH_STICKY}>Date</th>
                    <th className={TABLE_TH_STICKY}>Item</th>
                    <th className={TABLE_TH_STICKY}>Category</th>
                    <th className={TABLE_TH_STICKY}>Price</th>
                    <th className={TABLE_TH_STICKY}>Paid by</th>
                    {PEOPLE.map((person) => (
                      <th
                        key={person}
                        className={`${TABLE_TH_STICKY} text-center`}
                      >
                        {person}
                      </th>
                    ))}
                    <th className={TABLE_TH_STICKY} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.clientKey}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-green-50/40"
                      }
                    >
                      <td className={TABLE_TD}>
                        <input
                          type="date"
                          value={toPurchaseDateInput(item.purchaseDate)}
                          onChange={(event) =>
                            updateItem(item.clientKey, {
                              purchaseDate: toPurchaseDateIso(
                                event.target.value
                              ),
                            })
                          }
                          className={`${INPUT} w-[7.5rem]`}
                        />
                      </td>
                      <td className={TABLE_TD}>
                        <input
                          type="text"
                          value={item.item}
                          onChange={(event) =>
                            updateItem(item.clientKey, {
                              item: event.target.value,
                            })
                          }
                          className={`${INPUT} min-w-[10rem]`}
                        />
                      </td>
                      <td className={TABLE_TD}>
                        <CategorySelect
                          value={item.category}
                          categories={categories}
                          onChange={(category) =>
                            updateItem(item.clientKey, { category })
                          }
                        />
                      </td>
                      <td className={TABLE_TD}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price || ""}
                          onChange={(event) =>
                            updateItem(item.clientKey, {
                              price: Number(event.target.value) || 0,
                            })
                          }
                          className={`${INPUT} w-24`}
                        />
                      </td>
                      <td className={TABLE_TD}>
                        <select
                          value={item.paidBy}
                          onChange={(event) =>
                            updateItem(item.clientKey, {
                              paidBy: event.target.value as Person,
                            })
                          }
                          className={`${INPUT} min-w-[7rem]`}
                        >
                          {PEOPLE.map((person) => (
                            <option key={person} value={person}>
                              {person}
                            </option>
                          ))}
                        </select>
                      </td>
                      {PEOPLE.map((person) => (
                        <td key={person} className={`${TABLE_TD} text-center`}>
                          <input
                            type="checkbox"
                            checked={item.participants[person]}
                            onChange={() =>
                              toggleItemParticipant(item.clientKey, person)
                            }
                            className="h-4 w-4 cursor-pointer accent-[#2d6a4f]"
                          />
                        </td>
                      ))}
                      <td className={TABLE_TD}>
                        <button
                          type="button"
                          onClick={() => removeItem(item.clientKey)}
                          className="cursor-pointer text-xs font-medium text-red-700 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </FullPageSection>
    </AppShell>
  );
}
