import { describe, expect, it } from "vitest";

import { demoDonations } from "@/lib/store";

// The server renders the demo rows first and the browser must then render the
// exact same text. Times built from the moment the code was read differ between
// the two, and React blanks the screen while recovering. Anchoring the demo rows
// to UTC midnight keeps them identical, so every time must sit on a whole hour
// of the current UTC day.
describe("Demo donation data", () => {
  const utcDay = new Date(Math.floor(Date.now() / 86_400_000) * 86_400_000)
    .toISOString()
    .slice(0, 10);

  it("puts the first donation's deadline on the hour it was written for", () => {
    expect(demoDonations[0].deadline).toBe(`${utcDay}T14:00`);
  });

  it("keeps every time on the same UTC day", () => {
    for (const d of demoDonations) {
      expect(d.preparedAt.startsWith(utcDay), d.foodName).toBe(true);
      expect(d.deadline.startsWith(utcDay), d.foodName).toBe(true);
    }
  });
});
