"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../lib/site-auth-client";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();

    if (pathname === "/login") {
      if (loggedIn) {
        router.replace("/");
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
      router.replace(loginUrl);
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  return children;
}
