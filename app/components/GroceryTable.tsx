"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategoryColor, isValidCategory } from "../lib/categories";
import { formatCurrency, getShare, getSplitWays } from "../lib/calculations";
import { formatMonthLabel, getMonthKey } from "../lib/grouping";
import { isValidItem } from "../lib/items";
import {
  formatPurchaseDateDisplay,
  monthStartIso,
  toPurchaseDateInput,
  toPurchaseDateIso,
} from "../lib/purchase-date";
import { useGrocery, PEOPLE } from "../context/GroceryContext";
import type { GroceryItem, Person } from "../lib/types";
import { CategorySelect } from "./CategorySelect";
import { ErrorAlert } from "./ErrorAlert";
import {
  CancelIcon,
  DeleteIcon,
  EditIcon,
  IconButton,
  SaveIcon,
} from "./Icons";
import {
  BTN_PRIMARY,
  CARD,
  INPUT,
  PILL,
  TABLE,
  TABLE_TD,
  TABLE_TH_STICKY,
} from "../lib/ui";

const inputClass = INPUT;

function ReadOnlyCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`${TABLE_TD} ${className}`}>{children}</td>;
}

function GroceryRow({
  item,
  isEditing,
  draft,
  rowIndex,
  editLocked,
  categories,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onDraftChange,
  onToggleParticipant,
}: {
  item: GroceryItem;
  isEditing: boolean;
  draft: GroceryItem | null;
  rowIndex: number;
  editLocked: boolean;
  categories: string[];
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onDraftChange: (updates: Partial<GroceryItem>) => void;
  onToggleParticipant: (person: Person) => void;
}) {
  const splitWays = getSplitWays(
    isEditing && draft ? draft.participants : item.participants
  );
  const rowClass = rowIndex % 2 === 0 ? "bg-white" : "bg-green-50/40";

  if (isEditing && draft) {
    return (
      <tr className={rowClass}>
        <td className={TABLE_TD}>
          <input
            type="date"
            value={toPurchaseDateInput(draft.purchaseDate)}
            onChange={(e) =>
              onDraftChange({ purchaseDate: toPurchaseDateIso(e.target.value) })
            }
            className={`w-[7.5rem] ${inputClass}`}
          />
        </td>
        <td className={TABLE_TD}>
          <input
            type="text"
            value={draft.item}
            placeholder="Item"
            onChange={(e) => onDraftChange({ item: e.target.value })}
            className={`w-full min-w-[5.5rem] ${inputClass}`}
          />
        </td>
        <td className={TABLE_TD}>
          <CategorySelect
            value={draft.category}
            categories={categories}
            onChange={(category) => onDraftChange({ category })}
          />
        </td>
        <td className={TABLE_TD}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.price || ""}
            onChange={(e) =>
              onDraftChange({ price: parseFloat(e.target.value) || 0 })
            }
            className={`w-16 ${inputClass} text-right`}
          />
        </td>
        {PEOPLE.map((person) => (
          <td key={person} className={`${TABLE_TD} text-center`}>
            <input
              type="checkbox"
              checked={draft.participants[person]}
              onChange={() => onToggleParticipant(person)}
              className="h-4 w-4 cursor-pointer accent-[#2d6a4f]"
            />
          </td>
        ))}
        <td className={`${TABLE_TD} text-center font-medium text-green-800`}>
          {splitWays}
        </td>
        {PEOPLE.map((person) => {
          const share = getShare(draft.price, draft.participants, person);
          return (
            <td
              key={`share-${person}`}
              className={`${TABLE_TD} text-right whitespace-nowrap`}
            >
              {share > 0 ? formatCurrency(share) : "—"}
            </td>
          );
        })}
        <td className={TABLE_TD}>
          <select
            value={draft.paidBy}
            onChange={(e) =>
              onDraftChange({ paidBy: e.target.value as Person })
            }
            className={`w-full min-w-[5.5rem] ${inputClass}`}
          >
            {PEOPLE.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </td>
        <td className={TABLE_TD}>
          <div className="flex items-center justify-center gap-0.5">
            <IconButton
              onClick={onSave}
              title="Save"
              className="text-green-700 hover:bg-green-100"
            >
              <SaveIcon />
            </IconButton>
            <IconButton
              onClick={onCancel}
              title="Cancel"
              className="text-gray-500 hover:bg-gray-100"
            >
              <CancelIcon />
            </IconButton>
            <IconButton
              onClick={onDelete}
              title="Delete"
              className="text-red-500 hover:bg-red-50"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={rowClass}>
      <ReadOnlyCell className="whitespace-nowrap">
        {formatPurchaseDateDisplay(item.purchaseDate)}
      </ReadOnlyCell>
      <ReadOnlyCell>{item.item}</ReadOnlyCell>
      <ReadOnlyCell>
        <span
          className={PILL}
          style={{ backgroundColor: getCategoryColor(item.category) }}
        >
          {item.category}
        </span>
      </ReadOnlyCell>
      <ReadOnlyCell className="text-right whitespace-nowrap">
        {formatCurrency(item.price)}
      </ReadOnlyCell>
      {PEOPLE.map((person) => (
        <ReadOnlyCell key={person} className="text-center">
          {item.participants[person] ? "✓" : "—"}
        </ReadOnlyCell>
      ))}
      <ReadOnlyCell className="text-center font-medium text-green-800">
        {splitWays}
      </ReadOnlyCell>
      {PEOPLE.map((person) => {
        const share = getShare(item.price, item.participants, person);
        return (
          <ReadOnlyCell
            key={`share-${person}`}
            className="text-right whitespace-nowrap"
          >
            {share > 0 ? formatCurrency(share) : "—"}
          </ReadOnlyCell>
        );
      })}
      <ReadOnlyCell className="whitespace-nowrap">{item.paidBy}</ReadOnlyCell>
      <ReadOnlyCell>
        <div className="flex justify-center">
          <IconButton
            onClick={onStartEdit}
            title="Edit"
            disabled={editLocked}
            className="text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <EditIcon />
          </IconButton>
        </div>
      </ReadOnlyCell>
    </tr>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr>
        <th className={`${TABLE_TH_STICKY} text-left`}>Date</th>
        <th className={`${TABLE_TH_STICKY} text-left`}>Item</th>
        <th className={`${TABLE_TH_STICKY} text-left`}>Category</th>
        <th className={`${TABLE_TH_STICKY} text-right`}>Price</th>
        {PEOPLE.map((person) => (
          <th key={person} className={`${TABLE_TH_STICKY} text-center`}>
            {person.slice(0, 3)}
          </th>
        ))}
        <th className={`${TABLE_TH_STICKY} text-center`}>Split</th>
        {PEOPLE.map((person) => (
          <th
            key={`share-${person}`}
            className={`${TABLE_TH_STICKY} text-right`}
          >
            {person.slice(0, 3)}
          </th>
        ))}
        <th className={`${TABLE_TH_STICKY} text-left`}>Paid</th>
        <th className={`${TABLE_TH_STICKY} w-12 text-center`} />
      </tr>
    </thead>
  );
}

const NEW_ROW_ID = "__new__";

export function GroceryTable({ monthKey }: { monthKey: string | null }) {
  const {
    items,
    categories,
    saving,
    addItem,
    removeItem,
    updateItem,
    createDraftItem,
  } = useGrocery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GroceryItem | null>(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthItems = useMemo(() => {
    const filtered = monthKey
      ? items.filter((item) => getMonthKey(item.purchaseDate) === monthKey)
      : [];
    const sorted = [...filtered].sort((a, b) =>
      a.purchaseDate.localeCompare(b.purchaseDate)
    );
    if (isNewRow && draft && monthKey === getMonthKey(draft.purchaseDate)) {
      return [...sorted, { ...draft, id: NEW_ROW_ID }];
    }
    return sorted;
  }, [items, monthKey, isNewRow, draft]);

  useEffect(() => {
    setEditingId(null);
    setDraft(null);
    setIsNewRow(false);
    setError(null);
  }, [monthKey]);

  function startEdit(item: GroceryItem) {
    if (editingId !== null) return;
    setEditingId(item.id);
    setDraft({ ...item });
    setIsNewRow(false);
    setError(null);
  }

  function startAddRow() {
    if (!monthKey) return;
    const newItem = createDraftItem();
    newItem.purchaseDate = monthStartIso(monthKey);
    setEditingId(NEW_ROW_ID);
    setDraft({ ...newItem, id: NEW_ROW_ID });
    setIsNewRow(true);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setIsNewRow(false);
    setError(null);
  }

  async function saveEdit() {
    if (!draft) return;
    if (!isValidItem(draft)) {
      setError("Item name and price are required.");
      return;
    }
    if (!isValidCategory(draft.category)) {
      setError("Category is required.");
      return;
    }
    if (monthKey && getMonthKey(draft.purchaseDate) !== monthKey) {
      setError(`Date must fall within ${formatMonthLabel(monthKey)}.`);
      return;
    }

    try {
      if (isNewRow) {
        const { id: _id, ...item } = draft;
        await addItem(item);
      } else {
        await updateItem(draft.id, draft);
      }
      cancelEdit();
    } catch {
      // API error is shown via context alert.
    }
  }

  async function deleteRow(id: string) {
    if (isNewRow || id === NEW_ROW_ID) {
      cancelEdit();
      return;
    }
    try {
      await removeItem(id);
      cancelEdit();
    } catch {
      // API error is shown via context alert.
    }
  }

  function updateDraft(updates: Partial<GroceryItem>) {
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  function toggleDraftParticipant(person: Person) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev.participants,
        [person]: !prev.participants[person],
      };
      if (!PEOPLE.some((p) => next[p])) return prev;
      return { ...prev, participants: next };
    });
  }

  if (!monthKey) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className="rounded-2xl border border-dashed border-green-200 bg-white/60 px-4 py-8 text-center text-base text-gray-500">
          Select a month above to view and edit entries.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-1">
        <h2 className="text-base font-semibold text-green-800">
          {formatMonthLabel(monthKey)}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({monthItems.length} item{monthItems.length !== 1 ? "s" : ""})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-gray-500">
            {saving ? "Saving…" : "Saved"}
          </span>
          <button
            type="button"
            onClick={startAddRow}
            disabled={editingId !== null}
            className={BTN_PRIMARY}
          >
            + Add Row
          </button>
        </div>
      </div>
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError(null)}
          className="mb-2 shrink-0"
        />
      )}
      <div className={`${CARD} flex min-h-0 flex-1 flex-col overflow-hidden`}>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className={TABLE}>
            <TableHeader />
            <tbody>
              {monthItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + PEOPLE.length * 2 + 2}
                    className="px-4 py-8 text-center text-base text-gray-500"
                  >
                    No items for this month. Click &quot;+ Add Row&quot; to add
                    one.
                  </td>
                </tr>
              ) : (
                monthItems.map((item, index) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    isEditing={editingId === item.id}
                    draft={editingId === item.id ? draft : null}
                    rowIndex={index}
                    editLocked={editingId !== null && editingId !== item.id}
                    categories={categories}
                    onStartEdit={() => startEdit(item)}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    onDelete={() => deleteRow(item.id)}
                    onDraftChange={updateDraft}
                    onToggleParticipant={toggleDraftParticipant}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
