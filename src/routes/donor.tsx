import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteShell, PageHeader } from "@/components/SiteShell";
import { DonationCard } from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { addDonation, updateDonation, useDonations, type Status } from "@/lib/store";

export const Route = createFileRoute("/donor")({
  head: () => ({
    meta: [
      { title: "Donor Dashboard — MealLoop" },
      { name: "description", content: "List surplus food and track your donations on MealLoop." },
      { property: "og:title", content: "Donor Dashboard — MealLoop" },
      { property: "og:description", content: "List surplus food and track your donations." },
    ],
  }),
  component: Donor,
});

const categories = ["Cooked meals", "Bakery", "Fruits & vegetables", "Packaged food", "Beverages"];
const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const tabs: { key: Status | "active"; label: string }[] = [
  { key: "available", label: "Available" },
  { key: "active", label: "Claimed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function Donor() {
  const items = useDonations();
  const [tab, setTab] = useState<Status | "active">("available");
  const shown = items.filter((d) => (tab === "active" ? d.status === "claimed" || d.status === "picked_up" : d.status === tab));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    if (new Date(g("deadline")) <= new Date()) { toast.error("Collection deadline must be in the future"); return; }
    addDonation({
      donorName: g("donorName"), foodName: g("foodName"), quantity: g("quantity"), category: g("category"),
      preparedAt: g("preparedAt"), deadline: g("deadline"), location: g("location"), description: g("description") || undefined,
    });
    e.currentTarget.reset();
    setTab("available");
    toast.success("Donation listed — nearby receivers can now claim it");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader title="Donor dashboard" subtitle="List surplus food and follow it until it reaches someone’s plate." />
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <form onSubmit={submit} className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-xl font-semibold">Add a donation</h2>
            <input required name="donorName" placeholder="Donor / organisation name" className={field} />
            <input required name="foodName" placeholder="Food name" className={field} />
            <div className="grid grid-cols-2 gap-3">
              <input required name="quantity" placeholder="Quantity (e.g. 30 plates)" className={field} />
              <select required name="category" className={field}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <label className="block text-xs font-semibold text-muted-foreground">Prepared at<input required type="datetime-local" name="preparedAt" className={field} /></label>
            <label className="block text-xs font-semibold text-muted-foreground">Safe collection deadline<input required type="datetime-local" name="deadline" className={field} /></label>
            <input required name="location" placeholder="Pickup location" className={field} />
            <textarea name="description" placeholder="Description (optional)" rows={2} className={field} />
            <Button type="submit" className="w-full rounded-full">List donation</Button>
          </form>
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <Button key={t.key} size="sm" variant={tab === t.key ? "default" : "outline"} className="rounded-full" onClick={() => setTab(t.key)}>{t.label}</Button>
              ))}
            </div>
            {shown.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Nothing here yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {shown.map((d) => (
                  <DonationCard key={d.id} d={d}>
                    {d.status === "cancelled" && (
                      <>
                        <span className="w-full text-xs text-muted-foreground">Is this food still safe to share?</span>
                        <Button size="sm" className="rounded-full" onClick={() => { updateDonation(d.id, { status: "available", claimedBy: undefined, volunteer: undefined }); toast.success("Listed again"); }}>Yes, list again</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => { updateDonation(d.id, { status: "completed", description: "Withdrawn by donor" }); toast("Donation closed"); }}>No, close it</Button>
                      </>
                    )}
                  </DonationCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
