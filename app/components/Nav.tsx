"use client";

import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors no-underline ${
      pathname === href
        ? "bg-primary text-white shadow-sm"
        : "text-foreground hover:bg-primary-muted"
    }`;

  return (
    <nav className="mt-2 flex items-center gap-2">
      <a href="/upload" className={linkClass("/upload")}>
        Upload
      </a>
      <a href="/" className={linkClass("/")}>
        Entries
      </a>
      <a href="/summary" className={linkClass("/summary")}>
        Summary
      </a>
    </nav>
  );
}
