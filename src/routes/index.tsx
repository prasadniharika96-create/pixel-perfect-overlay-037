import { createFileRoute, Link } from "@tanstack/react-router";
import { HandHeart, Store, Truck, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { useDonations } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MealLoop — From Surplus to Someone’s Next Meal" },
      { name: "description", content: "Hyperlocal surplus food redistribution connecting donors, NGOs and volunteers." },
      { property: "og:title", content: "MealLoop — From Surplus to Someone’s Next Meal" },
      { property: "og:description", content: "Connect restaurants, canteens and events with NGOs to rescue surplus food." },
    ],
  }),
  component: Index,
});

const roles = [
  { to: "/donor", icon: Store, title: "I have surplus food", body: "Restaurants, canteens and event organisers list food in under a minute." },
  { to: "/receiver", icon: HandHeart, title: "I feed people", body: "NGOs and community kitchens browse and claim nearby donations." },
  { to: "/volunteer", icon: Truck, title: "I can deliver", body: "Volunteers pick up claimed food and close the loop." },
] as const;

function Index() {
  const items = useDonations();
  const stats = [
    { n: items.filter((d) => d.status === "available").length, l: "Available now" },
    { n: items.filter((d) => d.status === "claimed" || d.status === "picked_up").length, l: "On the way" },
    { n: items.filter((d) => d.status === "completed").length, l: "Meals delivered" },
  ];
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground">Hyperlocal food rescue</span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">From Surplus to Someone’s <span className="italic text-primary">Next Meal.</span></h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">MealLoop connects kitchens with extra food to the NGOs and people who need it — before it goes to waste.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full"><Link to="/donor">Donate food <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/receiver">Find food</Link></Button>
          </div>
        </div>
        <img src={hero} alt="Restaurant staff handing meal boxes to volunteers" width={1280} height={896} className="rounded-3xl shadow-soft" />
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl bg-primary p-5 text-center text-primary-foreground">
            <div className="font-display text-3xl font-semibold md:text-4xl">{s.n}</div>
            <div className="text-xs opacity-80 md:text-sm">{s.l}</div>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold">Choose your role</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {roles.map((r) => (
            <Link key={r.to} to={r.to} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1">
              <r.icon className="h-10 w-10 rounded-xl bg-secondary p-2 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">Open dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
