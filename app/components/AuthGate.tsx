"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../lib/site-auth-client";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();

    if (pathname === "/login") {
      if (loggedIn) {
        window.location.assign("/");
        return;
      }

      setReady(true);
      return;
    }

    if (!loggedIn) {
      const loginUrl =
        pathname === "/"
          ? "/login"
          : `/login?from=${encodeURIComponent(pathname)}`;
      window.location.assign(loginUrl);
      return;
    }

    setReady(true);
  }, [pathname]);

  if (!ready) {
    return null;
  }

  return children;
}
