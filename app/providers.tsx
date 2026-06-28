"use client";

import { GroceryProvider } from "./context/GroceryContext";
import { MonthSelectionProvider } from "./context/MonthSelectionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GroceryProvider>
      <MonthSelectionProvider>{children}</MonthSelectionProvider>
    </GroceryProvider>
  );
}
