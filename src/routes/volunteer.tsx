import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell, PageHeader } from "@/components/SiteShell";
import { DonationCard } from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { resetDemo, updateDonation, useDonations } from "@/lib/store";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer Dashboard — MealLoop" },
      { name: "description", content: "Pick up claimed food and deliver it to receivers." },
      { property: "og:title", content: "Volunteer Dashboard — MealLoop" },
      { property: "og:description", content: "Pick up claimed food and deliver it to receivers." },
    ],
  }),
  component: Volunteer,
});

function Volunteer() {
  const items = useDonations();
  const [name, setName] = useState("Rahul");
  const pickups = items.filter((d) => d.status === "claimed");
  const enRoute = items.filter((d) => d.status === "picked_up");

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader title="Volunteer dashboard" subtitle="Pick up claimed food and get it where it’s needed." />
        <label className="mb-8 block text-sm font-semibold">Your name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-xl border border-input bg-card px-3 py-2 md:w-72" />
        </label>
        <h2 className="mb-4 text-2xl font-semibold">Ready for pickup</h2>
        {pickups.length === 0 ? <p className="text-muted-foreground">No pickups waiting.</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pickups.map((d) => (
              <DonationCard key={d.id} d={d}>
                <Button className="w-full rounded-full" disabled={!name.trim()} onClick={() => { updateDonation(d.id, { status: "picked_up", volunteer: name.trim() }); toast.success("Picked up — on the way!"); }}>Mark picked up</Button>
              </DonationCard>
            ))}
          </div>
        )}
        <h2 className="mb-4 mt-12 text-2xl font-semibold">Out for delivery</h2>
        {enRoute.length === 0 ? <p className="text-muted-foreground">Nothing in transit.</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enRoute.map((d) => (
              <DonationCard key={d.id} d={d}>
                <Button size="sm" className="rounded-full" onClick={() => { updateDonation(d.id, { status: "completed" }); toast.success("Delivered!"); }}>Mark delivered</Button>
              </DonationCard>
            ))}
          </div>
        )}
        <div className="mt-16 text-center">
          <Button variant="ghost" size="sm" onClick={() => { resetDemo(); toast("Demo data reset"); }}>Reset demo data</Button>
        </div>
      </div>
    </SiteShell>
  );
}
