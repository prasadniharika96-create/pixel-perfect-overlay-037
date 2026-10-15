import { useSyncExternalStore } from "react";

export type Status = "available" | "claimed" | "picked_up" | "completed" | "cancelled";

export interface Donation {
  id: string;
  foodName: string;
  quantity: string;
  category: string;
  preparedAt: string;
  deadline: string;
  location: string;
  description?: string | undefined;
  donorName: string;
  status: Status;
  claimedBy?: string | undefined;
  volunteer?: string | undefined;
  createdAt: number;
}

const KEY = "mealloop-donations-v1";

const now = Date.now();
const iso = (h: number) => new Date(now + h * 3600_000).toISOString().slice(0, 16);

const seed: Donation[] = [
  { id: "d1", foodName: "Veg Biryani", quantity: "40 plates", category: "Cooked meals", preparedAt: iso(-1), deadline: iso(3), location: "Spice Route Restaurant, MG Road", donorName: "Spice Route", status: "available", createdAt: now - 3600_000 },
  { id: "d2", foodName: "Chapati & Dal", quantity: "60 servings", category: "Cooked meals", preparedAt: iso(-2), deadline: iso(2), location: "North Campus Canteen", donorName: "College Canteen", status: "claimed", claimedBy: "Hope Kitchen NGO", createdAt: now - 7200_000 },
  { id: "d3", foodName: "Fresh Fruit Boxes", quantity: "25 boxes", category: "Fruits & vegetables", preparedAt: iso(-3), deadline: iso(8), location: "City Convention Hall", donorName: "Bloom Events", status: "picked_up", claimedBy: "Annapurna Trust", volunteer: "Rahul", createdAt: now - 10800_000 },
  { id: "d4", foodName: "Bakery Assortment", quantity: "15 kg", category: "Bakery", preparedAt: iso(-5), deadline: iso(-1), location: "Daily Bread Café", donorName: "Daily Bread", status: "completed", claimedBy: "Hope Kitchen NGO", volunteer: "Ananya", createdAt: now - 20000_000 },
  { id: "d5", foodName: "Paneer Curry", quantity: "20 servings", category: "Cooked meals", preparedAt: iso(-1), deadline: iso(4), location: "Spice Route Restaurant, MG Road", donorName: "Spice Route", status: "cancelled", claimedBy: undefined, createdAt: now - 5000_000 },
];

let state: Donation[] = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      state = JSON.parse(e.newValue);
      listeners.forEach((l) => l());
    }
  });
}

function set(next: Donation[]) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useDonations() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => state,
    () => seed,
  );
}

export function addDonation(d: Omit<Donation, "id" | "status" | "createdAt">) {
  set([{ ...d, id: crypto.randomUUID(), status: "available", createdAt: Date.now() }, ...state]);
}

/** Atomic claim: only succeeds if still available. Returns false otherwise. */
export function claimDonation(id: string, receiver: string): boolean {
  load();
  const d = state.find((x) => x.id === id);
  if (!d || d.status !== "available") return false;
  set(state.map((x) => (x.id === id ? { ...x, status: "claimed", claimedBy: receiver } : x)));
  return true;
}

export function updateDonation(id: string, patch: Partial<Donation>) {
  set(state.map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

export function resetDemo() {
  set(seed);
}

export const statusLabel: Record<Status, string> = {
  available: "Available",
  claimed: "Claimed",
  picked_up: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};
