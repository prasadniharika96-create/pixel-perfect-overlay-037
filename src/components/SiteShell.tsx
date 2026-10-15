import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { statusLabel, type Status } from "@/lib/store";

const nav = [
  { to: "/donor", label: "Donor" },
  { to: "/receiver", label: "Receiver" },
  { to: "/volunteer", label: "Volunteer" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold text-primary">MealLoop</span>
          </Link>
          <nav className="flex gap-1 text-sm font-semibold">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        MealLoop · From Surplus to Someone’s Next Meal
      </footer>
    </div>
  );
}

const badgeStyles: Record<Status, string> = {
  available: "bg-primary/15 text-primary",
  claimed: "bg-accent/40 text-accent-foreground",
  picked_up: "bg-info/15 text-info",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", badgeStyles[status])}>
      {statusLabel[status]}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// The locale is pinned: the server's default and each visitor's browser default
// differ, and a date that renders differently on the two sides makes React throw
// the page away.
export function fmt(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}
