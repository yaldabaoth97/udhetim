import { describe, it, expect } from "vitest";
import { formatALL, formatDate, isRidePast } from "@/lib/utils";

describe("Currency Formatting", () => {
  it("formats Albanian Lek correctly", () => {
    const formatted = formatALL(1500);
    expect(formatted).toContain("1");
    expect(formatted).toContain("500");
  });

  it("handles zero", () => {
    const formatted = formatALL(0);
    expect(formatted).toContain("0");
  });

  it("handles large numbers", () => {
    const formatted = formatALL(10000);
    expect(formatted).toContain("10");
  });
});

describe("Date Formatting", () => {
  it("formats date in Albanian locale", () => {
    const date = new Date("2024-06-15T14:30:00");
    const formatted = formatDate(date, "sq");
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("formats date in English locale", () => {
    const date = new Date("2024-06-15T14:30:00");
    const formatted = formatDate(date, "en");
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe("Ride Past Check", () => {
  it("returns true for past dates", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(isRidePast(pastDate)).toBe(true);
  });

  it("returns false for future dates", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    expect(isRidePast(futureDate)).toBe(false);
  });
});
