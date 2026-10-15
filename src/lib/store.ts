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

// Demo rows must be byte-identical on the server and in the browser: the server
// renders them first, and the browser must render the exact same text when it
// takes over. Stamping them with the current instant made the two disagree, which
// makes React discard the whole tree and leaves the screen blank. UTC midnight is
// the same value on both sides, so the times are anchored to it.
const anchor = Math.floor(Date.now() / 86_400_000) * 86_400_000;
const iso = (h: number) => new Date(anchor + h * 3600_000).toISOString().slice(0, 16);

export const demoDonations: Donation[] = [
  { id: "d1", foodName: "Veg Biryani", quantity: "40 plates", category: "Cooked meals", preparedAt: iso(9), deadline: iso(14), location: "Spice Route Restaurant, MG Road", donorName: "Spice Route", status: "available", createdAt: anchor + 8 * 3600_000 },
  { id: "d2", foodName: "Chapati & Dal", quantity: "60 servings", category: "Cooked meals", preparedAt: iso(8), deadline: iso(13), location: "North Campus Canteen", donorName: "College Canteen", status: "claimed", claimedBy: "Hope Kitchen NGO", createdAt: anchor + 7 * 3600_000 },
  { id: "d3", foodName: "Fresh Fruit Boxes", quantity: "25 boxes", category: "Fruits & vegetables", preparedAt: iso(7), deadline: iso(19), location: "City Convention Hall", donorName: "Bloom Events", status: "picked_up", claimedBy: "Annapurna Trust", volunteer: "Rahul", createdAt: anchor + 6 * 3600_000 },
  { id: "d4", foodName: "Bakery Assortment", quantity: "15 kg", category: "Bakery", preparedAt: iso(5), deadline: iso(11), location: "Daily Bread Café", donorName: "Daily Bread", status: "completed", claimedBy: "Hope Kitchen NGO", volunteer: "Ananya", createdAt: anchor + 4 * 3600_000 },
  { id: "d5", foodName: "Paneer Curry", quantity: "20 servings", category: "Cooked meals", preparedAt: iso(9), deadline: iso(15), location: "Spice Route Restaurant, MG Road", donorName: "Spice Route", status: "cancelled", claimedBy: undefined, createdAt: anchor + 8 * 3600_000 },
];

let state: Donation[] = demoDonations;
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
      try {
        state = JSON.parse(e.newValue);
      } catch {
        return;
      }
      listeners.forEach((l) => l());
    }
  });
}

function set(next: Donation[]) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  const before = state;
  load();
  listeners.add(listener);
  // Only re-render when loading saved data actually changed something; forcing a
  // render on every mount is what turned a hydration hiccup into a blank screen.
  if (state !== before) listener();
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => state;
const serverSnapshot = () => demoDonations;

export function useDonations() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
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
  load();
  set(state.map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

export function resetDemo() {
  set(demoDonations);
}

export const statusLabel: Record<Status, string> = {
  available: "Available",
  claimed: "Claimed",
  picked_up: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};
