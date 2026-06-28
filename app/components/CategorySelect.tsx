"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategoryColor } from "../lib/categories";
import { INPUT } from "../lib/ui";

const NEW_CATEGORY = "__new__";

export function CategorySelect({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: string[];
  onChange: (category: string) => void;
}) {
  const options = useMemo(() => {
    const set = new Set(categories);
    const trimmed = value.trim();
    if (trimmed) set.add(trimmed);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [categories, value]);

  const valueInList = options.includes(value);
  const [mode, setMode] = useState<"select" | "custom">(
    value.trim() && !valueInList ? "custom" : "select"
  );

  useEffect(() => {
    if (value.trim() && !options.includes(value)) {
      setMode("custom");
    }
  }, [value, options]);

  const fieldClass = `${INPUT} w-full min-w-[7rem]`;

  if (mode === "custom") {
    return (
      <div className="min-w-[7rem]">
        <input
          type="text"
          value={value}
          placeholder="Type category"
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          style={{ backgroundColor: getCategoryColor(value) }}
          className={fieldClass}
        />
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => setMode("select")}
            className="mt-1 cursor-pointer text-xs font-medium text-green-700 hover:underline"
          >
            Pick existing
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      value={valueInList ? value : options[0] ?? ""}
      onChange={(e) => {
        if (e.target.value === NEW_CATEGORY) {
          setMode("custom");
          onChange("");
          return;
        }
        onChange(e.target.value);
      }}
      style={{
        backgroundColor: getCategoryColor(
          valueInList ? value : options[0] ?? ""
        ),
      }}
      className={fieldClass}
    >
      {options.map((cat) => (
        <option
          key={cat}
          value={cat}
          style={{ backgroundColor: getCategoryColor(cat) }}
        >
          {cat}
        </option>
      ))}
      <option value={NEW_CATEGORY} className="bg-white font-medium">
        + Add category…
      </option>
    </select>
  );
}
