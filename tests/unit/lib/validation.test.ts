import { describe, it, expect } from "vitest";
import {
  albanianPhoneRegex,
  registerSchema,
  loginSchema,
  rideSchema,
} from "@/lib/validation";

describe("Phone Validation", () => {
  it("validates correct Albanian phone format", () => {
    expect(albanianPhoneRegex.test("+355 69 123 4567")).toBe(true);
    expect(albanianPhoneRegex.test("+35569123456")).toBe(true);
    expect(albanianPhoneRegex.test("+355 68 456 789")).toBe(true);
  });

  it("rejects invalid phone formats", () => {
    expect(albanianPhoneRegex.test("069 123 4567")).toBe(false);
    expect(albanianPhoneRegex.test("+1 555 123 4567")).toBe(false);
    expect(albanianPhoneRegex.test("invalid")).toBe(false);
  });
});

describe("Register Schema", () => {
  it("validates correct registration data", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      phone: "+355 69 123 4567",
      locale: "sq" as const,
    };
    expect(() => registerSchema.parse(validData)).not.toThrow();
  });

  it("rejects invalid email", () => {
    const invalidData = {
      email: "invalid",
      password: "password123",
      name: "Test User",
    };
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });

  it("rejects short password", () => {
    const invalidData = {
      email: "test@example.com",
      password: "short",
      name: "Test User",
    };
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });
});

describe("Login Schema", () => {
  it("validates correct login data", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };
    expect(() => loginSchema.parse(validData)).not.toThrow();
  });
});

describe("Ride Schema", () => {
  it("validates correct ride data", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const validData = {
      originCity: "Tirana",
      destinationCity: "Durres",
      departureTime: futureDate,
      pricePerSeat: 500,
      totalSeats: 4,
    };
    expect(() => rideSchema.parse(validData)).not.toThrow();
  });

  it("rejects past departure time", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const invalidData = {
      originCity: "Tirana",
      destinationCity: "Durres",
      departureTime: pastDate,
      pricePerSeat: 500,
      totalSeats: 4,
    };
    expect(() => rideSchema.parse(invalidData)).toThrow();
  });

  it("rejects negative price", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const invalidData = {
      originCity: "Tirana",
      destinationCity: "Durres",
      departureTime: futureDate,
      pricePerSeat: -100,
      totalSeats: 4,
    };
    expect(() => rideSchema.parse(invalidData)).toThrow();
  });
});
