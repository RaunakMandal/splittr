"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-[#2d6a4f] text-white shadow-sm"
        : "text-green-800 hover:bg-green-100"
    }`;

  return (
    <nav className="mt-2 flex items-center gap-2">
      <Link href="/upload" className={linkClass("/upload")}>
        Upload
      </Link>
      <Link href="/" className={linkClass("/")}>
        Entries
      </Link>
      <Link href="/summary" className={linkClass("/summary")}>
        Summary
      </Link>
    </nav>
  );
}
