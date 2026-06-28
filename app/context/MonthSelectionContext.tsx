"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { getCurrentMonthKey } from "../lib/purchase-date";

interface MonthSelectionContextValue {
  selectedMonthKey: string;
  setSelectedMonthKey: Dispatch<SetStateAction<string>>;
}

const MonthSelectionContext = createContext<MonthSelectionContextValue | null>(
  null
);

export function MonthSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(getCurrentMonthKey);

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
