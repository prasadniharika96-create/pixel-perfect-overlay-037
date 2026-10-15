import { Clock, MapPin, Package, Store } from "lucide-react";
import type { ReactNode } from "react";
import type { Donation } from "@/lib/store";
import { StatusBadge, fmt } from "./SiteShell";

export function DonationCard({ d, children }: { d: Donation; children?: ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{d.foodName}</h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{d.category}</p>
        </div>
        <StatusBadge status={d.status} />
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex gap-2"><Package className="h-4 w-4 text-primary" />{d.quantity}</li>
        <li className="flex gap-2"><Store className="h-4 w-4 text-primary" />{d.donorName}</li>
        <li className="flex gap-2"><MapPin className="h-4 w-4 text-primary" />{d.location}</li>
        <li className="flex gap-2"><Clock className="h-4 w-4 text-primary" />Collect by {fmt(d.deadline)}</li>
      </ul>
      {d.description && <p className="mt-3 text-sm">{d.description}</p>}
      {d.claimedBy && <p className="mt-3 text-xs text-muted-foreground">Claimed by <b>{d.claimedBy}</b>{d.volunteer && <> · Volunteer <b>{d.volunteer}</b></>}</p>}
      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
