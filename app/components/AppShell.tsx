import { Nav } from "./Nav";
import { PAGE_WIDTH } from "../lib/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden bg-[#f8faf8] ${PAGE_WIDTH}`}
    >
      <header className="shrink-0 px-4 py-3">
        <div className="rounded-2xl border border-green-200/80 bg-white px-4 py-3 shadow-sm">
          <h1 className="text-xl font-bold text-[#2d6a4f]">
            Grocery Cost Splitter
          </h1>
          <Nav />
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
        {children}
      </main>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 px-1 text-sm font-semibold uppercase tracking-wide text-green-800">
      {children}
    </h2>
  );
}

export function FullPageSection({ children }: { children: React.ReactNode }) {
  return <section className="flex min-h-0 flex-1 flex-col">{children}</section>;
}
