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
  "Essentials/spreads": "#ddd6fe",
  Snacks: "#fde68a",
  "Sweet/Icecream": "#fbcfe8",
  Eggs: "#fef9c3",
  Dairy: "#bae6fd",
  Vegetables: "#bbf7d0",
  Meat: "#fecaca",
  Rice: "#e7e5e4",
};

export const CATEGORY_FALLBACK_PALETTE = [
  "#ddd6fe",
  "#fde68a",
  "#fbcfe8",
  "#fef9c3",
  "#bae6fd",
  "#bbf7d0",
  "#fecaca",
  "#e7e5e4",
  "#c7d2fe",
  "#fed7aa",
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
