import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_FALLBACK_PALETTE,
} from "./config";

export function normalizeCategory(category: string): string {
  return category.trim();
}

export function isValidCategory(category: string): boolean {
  return normalizeCategory(category).length > 0;
}

export function collectCategories(items: { category: string }[]): string[] {
  const set = new Set<string>(CATEGORIES);
  for (const item of items) {
    const trimmed = normalizeCategory(item.category);
    if (trimmed) set.add(trimmed);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getCategoryColor(category: string): string {
  const normalized = normalizeCategory(category);
  if (normalized in CATEGORY_COLORS) {
    return CATEGORY_COLORS[normalized];
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_FALLBACK_PALETTE[
    Math.abs(hash) % CATEGORY_FALLBACK_PALETTE.length
  ];
}
