export const PEOPLE = ["Kabirul", "Shubhangi", "Raunak"] as const;

export const CATEGORIES = [
  "Essentials/spreads",
  "Snacks",
  "Sweet/Icecream",
  "Eggs",
  "Dairy",
  "Vegetables",
  "Meat",
  "Rice",
] as const;

export const DEFAULT_PAID_BY = "Raunak";
export const DEFAULT_CATEGORY = CATEGORIES[0];

export const CATEGORY_COLORS: Record<string, string> = {
  "Essentials/spreads": "#f5d0a9",
  Snacks: "#f0c9a0",
  "Sweet/Icecream": "#d4b8e0",
  Eggs: "#f5e6a3",
  Dairy: "#a8d4e6",
  Vegetables: "#b8e0b0",
  Meat: "#e8a8a8",
  Rice: "#d0d0d0",
};

export const CATEGORY_FALLBACK_PALETTE = [
  "#f5d0a9",
  "#f0c9a0",
  "#d4b8e0",
  "#f5e6a3",
  "#a8d4e6",
  "#b8e0b0",
  "#e8a8a8",
  "#d0d0d0",
  "#c9e4ca",
  "#ffe0b2",
];

export const RECEIPT_MAX_PDF_BYTES = 10 * 1024 * 1024;

export type Person = (typeof PEOPLE)[number];

export function createDefaultParticipants(): Record<Person, boolean> {
  return Object.fromEntries(PEOPLE.map((person) => [person, true])) as Record<
    Person,
    boolean
  >;
}

export function isPerson(value: string): value is Person {
  return (PEOPLE as readonly string[]).includes(value);
}
