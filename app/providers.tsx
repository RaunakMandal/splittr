"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "./components/AuthGate";
import { GroceryProvider } from "./context/GroceryContext";
import { MonthSelectionProvider } from "./context/MonthSelectionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AuthGate>
      {isLoginPage ? (
        children
      ) : (
        <GroceryProvider>
          <MonthSelectionProvider>{children}</MonthSelectionProvider>
        </GroceryProvider>
      )}
    </AuthGate>
  );
}
