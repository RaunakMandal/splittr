"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface MonthSelectionContextValue {
  selectedMonthKey: string | null;
  setSelectedMonthKey: Dispatch<SetStateAction<string | null>>;
}

const MonthSelectionContext = createContext<MonthSelectionContextValue | null>(
  null
);

export function MonthSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  return (
    <MonthSelectionContext.Provider
      value={{ selectedMonthKey, setSelectedMonthKey }}
    >
      {children}
    </MonthSelectionContext.Provider>
  );
}

export function useMonthSelectionState() {
  const ctx = useContext(MonthSelectionContext);
  if (!ctx) {
    throw new Error(
      "useMonthSelectionState must be used within MonthSelectionProvider"
    );
  }
  return ctx;
}
