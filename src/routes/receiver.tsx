import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell, PageHeader } from "@/components/SiteShell";
import { DonationCard } from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { claimDonation, updateDonation, useDonations } from "@/lib/store";

export const Route = createFileRoute("/receiver")({
  head: () => ({
    meta: [
      { title: "Receiver Dashboard — MealLoop" },
      { name: "description", content: "Browse and claim nearby surplus food donations." },
      { property: "og:title", content: "Receiver Dashboard — MealLoop" },
      { property: "og:description", content: "Browse and claim nearby surplus food donations." },
    ],
  }),
  component: Receiver,
});

function Receiver() {
  const items = useDonations();
  const [org, setOrg] = useState("Hope Kitchen NGO");
  const [q, setQ] = useState("");
  const available = items.filter((d) => d.status === "available" && (d.foodName + d.location + d.donorName).toLowerCase().includes(q.toLowerCase()));
  const mine = items.filter((d) => d.claimedBy === org && d.status !== "cancelled");

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader title="Receiver dashboard" subtitle="Find nearby surplus food and claim it for your community." />
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <label className="text-sm font-semibold">Your organisation
            <input value={org} onChange={(e) => setOrg(e.target.value)} className="mt-1 block w-full rounded-xl border border-input bg-card px-3 py-2 md:w-72" />
          </label>
          <label className="flex-1 text-sm font-semibold">Search
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Food, donor or area" className="mt-1 block w-full rounded-xl border border-input bg-card px-3 py-2" />
          </label>
        </div>
        <h2 className="mb-4 text-2xl font-semibold">Available near you</h2>
        {available.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No food available right now — check back soon.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {available.map((d) => (
              <DonationCard key={d.id} d={d}>
                <Button className="w-full rounded-full" disabled={!org.trim()} onClick={() => {
                  if (claimDonation(d.id, org.trim())) toast.success(`Claimed ${d.foodName}`);
                  else toast.error("Sorry, someone else already claimed this donation");
                }}>Claim Food</Button>
              </DonationCard>
            ))}
          </div>
        )}
        <h2 className="mb-4 mt-12 text-2xl font-semibold">Your claims</h2>
        {mine.length === 0 ? (
          <p className="text-muted-foreground">You haven’t claimed anything yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mine.map((d) => (
              <DonationCard key={d.id} d={d}>
                {d.status === "picked_up" && <Button size="sm" className="rounded-full" onClick={() => { updateDonation(d.id, { status: "completed" }); toast.success("Marked as received — thank you!"); }}>Confirm received</Button>}
                {d.status === "claimed" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => { updateDonation(d.id, { status: "cancelled", claimedBy: undefined }); toast("Claim cancelled — donor will be asked to relist"); }}>Cancel claim</Button>}
              </DonationCard>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
