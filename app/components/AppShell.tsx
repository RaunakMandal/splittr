import { Nav } from "./Nav";
import { PAGE_WIDTH } from "../lib/ui";

export function AppShell({
  children,
  headerAside,
}: {
  children: React.ReactNode;
  headerAside?: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-background ${PAGE_WIDTH}`}
    >
      <header className="shrink-0 px-4 py-3">
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-primary">
              Grocery Cost Splitter
            </h1>
            {headerAside}
          </div>
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
    <h2 className="mb-1.5 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
      {children}
    </h2>
  );
}

export function FullPageSection({ children }: { children: React.ReactNode }) {
  return <section className="flex min-h-0 flex-1 flex-col">{children}</section>;
}
