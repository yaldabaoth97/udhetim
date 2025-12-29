import { describe, it, expect } from "vitest";
import { rideSchema, bookingSchema, searchSchema } from "@/lib/validation";

describe("Ride Validation Schema", () => {
  describe("rideSchema - valid data", () => {
    it("should validate correct ride data with all fields", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
        notes: "Comfortable ride with AC",
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate ride data without optional notes", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Shkodër",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 1000,
        totalSeats: 4,
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should coerce string date to Date object", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.departureTime).toBeInstanceOf(Date);
      }
    });
  });

  describe("rideSchema - required fields", () => {
    it("should reject when originCity is missing", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty originCity", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject when destinationCity is missing", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("rideSchema - departureTime validation", () => {
    it("should reject departure time in the past", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: pastDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const timeError = result.error.issues.find((i) =>
          i.path.includes("departureTime")
        );
        expect(timeError?.message).toBe("Departure time must be in the future");
      }
    });

    it("should reject invalid date string", () => {
      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: "not-a-date",
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept date far in the future", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("rideSchema - pricePerSeat validation", () => {
    it("should reject negative price", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: -100,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject zero price", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 0,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer price", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 99.99,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept positive integer price", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 3,
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("rideSchema - totalSeats validation", () => {
    it("should reject zero seats", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 0,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative seats", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: -2,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject more than 8 seats", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 10,
      };

      const result = rideSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept 1 seat (minimum)", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 1,
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept 8 seats (maximum)", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const validData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: futureDate.toISOString(),
        pricePerSeat: 500,
        totalSeats: 8,
      };

      const result = rideSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe("Booking Validation Schema", () => {
  it("should validate correct booking data", () => {
    const validData = {
      rideId: "clxyz123456789abcdefghij",
      seatsRequested: 2,
      message: "Pick me up at the main square",
    };

    const result = bookingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate booking without optional message", () => {
    const validData = {
      rideId: "clxyz123456789abcdefghij",
      seatsRequested: 1,
    };

    const result = bookingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject zero seats", () => {
    const invalidData = {
      rideId: "clxyz123456789abcdefghij",
      seatsRequested: 0,
    };

    const result = bookingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject negative seats", () => {
    const invalidData = {
      rideId: "clxyz123456789abcdefghij",
      seatsRequested: -1,
    };

    const result = bookingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Search Validation Schema", () => {
  it("should validate empty search params with defaults", () => {
    const result = searchSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should validate search with origin only", () => {
    const validData = {
      origin: "Tiranë",
    };

    const result = searchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate search with destination only", () => {
    const validData = {
      destination: "Durrës",
    };

    const result = searchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate search with date", () => {
    const validData = {
      date: "2025-12-30",
    };

    const result = searchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate search with pagination", () => {
    const validData = {
      page: "2",
      limit: "20",
    };

    const result = searchSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should reject limit over 50", () => {
    const invalidData = {
      limit: 100,
    };

    const result = searchSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
