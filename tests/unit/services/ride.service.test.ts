import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock prisma before importing the service
vi.mock("@/lib/prisma", () => ({
  prisma: {
    ride: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  createRide,
  getRideById,
  updateRide,
  cancelRide,
  getDriverRides,
  searchRides,
} from "@/services/ride.service";

describe("Ride Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRide", () => {
    it("should create a ride with correct data", async () => {
      const rideData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: new Date("2025-12-30T10:00:00Z"),
        pricePerSeat: 500,
        totalSeats: 3,
        notes: "Comfortable ride",
      };

      const mockCreatedRide = {
        id: "ride-1",
        ...rideData,
        driverId: "driver-1",
        availableSeats: 3,
        status: "ACTIVE",
        createdAt: new Date(),
        driver: {
          id: "driver-1",
          name: "John Driver",
          phone: "+355 69 123 4567",
        },
      };

      (prisma.ride.create as Mock).mockResolvedValue(mockCreatedRide);

      const result = await createRide("driver-1", rideData);

      expect(prisma.ride.create).toHaveBeenCalledWith({
        data: {
          driverId: "driver-1",
          originCity: "Tiranë",
          destinationCity: "Durrës",
          departureTime: rideData.departureTime,
          pricePerSeat: 500,
          totalSeats: 3,
          availableSeats: 3,
          notes: "Comfortable ride",
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
      expect(result.driverId).toBe("driver-1");
      expect(result.availableSeats).toBe(3);
    });

    it("should handle null notes", async () => {
      const rideData = {
        originCity: "Tiranë",
        destinationCity: "Shkodër",
        departureTime: new Date("2025-12-30T14:00:00Z"),
        pricePerSeat: 1000,
        totalSeats: 4,
      };

      const mockCreatedRide = {
        id: "ride-2",
        ...rideData,
        notes: null,
        driverId: "driver-1",
        availableSeats: 4,
        status: "ACTIVE",
        driver: { id: "driver-1", name: "John", phone: null },
      };

      (prisma.ride.create as Mock).mockResolvedValue(mockCreatedRide);

      const result = await createRide("driver-1", rideData);

      expect(result.notes).toBeNull();
    });
  });

  describe("getRideById", () => {
    it("should return ride with driver when exists", async () => {
      const mockRide = {
        id: "ride-1",
        originCity: "Tiranë",
        destinationCity: "Durrës",
        departureTime: new Date("2025-12-30T10:00:00Z"),
        pricePerSeat: 500,
        totalSeats: 3,
        availableSeats: 2,
        status: "ACTIVE",
        driverId: "driver-1",
        driver: {
          id: "driver-1",
          name: "John Driver",
          phone: "+355 69 123 4567",
        },
      };

      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);

      const result = await getRideById("ride-1");

      expect(prisma.ride.findUnique).toHaveBeenCalledWith({
        where: { id: "ride-1" },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
      expect(result).toEqual(mockRide);
    });

    it("should return null when ride does not exist", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(null);

      const result = await getRideById("nonexistent-ride");

      expect(result).toBeNull();
    });
  });

  describe("updateRide", () => {
    it("should update ride when user is the owner", async () => {
      const mockExistingRide = {
        id: "ride-1",
        driverId: "driver-1",
        totalSeats: 3,
        availableSeats: 3,
      };

      const mockUpdatedRide = {
        id: "ride-1",
        originCity: "Tiranë",
        destinationCity: "Durrës",
        pricePerSeat: 600,
        totalSeats: 3,
        availableSeats: 3,
        driverId: "driver-1",
        driver: { id: "driver-1", name: "John", phone: null },
      };

      (prisma.ride.findFirst as Mock).mockResolvedValue(mockExistingRide);
      (prisma.ride.update as Mock).mockResolvedValue(mockUpdatedRide);

      const result = await updateRide("ride-1", "driver-1", { pricePerSeat: 600 });

      expect(prisma.ride.findFirst).toHaveBeenCalledWith({
        where: { id: "ride-1", driverId: "driver-1" },
      });
      expect(prisma.ride.update).toHaveBeenCalled();
      expect(result?.pricePerSeat).toBe(600);
    });

    it("should return null when ride does not exist or user is not owner", async () => {
      (prisma.ride.findFirst as Mock).mockResolvedValue(null);

      const result = await updateRide("ride-1", "different-driver", { pricePerSeat: 600 });

      expect(prisma.ride.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should recalculate availableSeats when totalSeats changes", async () => {
      const mockExistingRide = {
        id: "ride-1",
        driverId: "driver-1",
        totalSeats: 4,
        availableSeats: 2, // 2 seats booked
      };

      const mockUpdatedRide = {
        id: "ride-1",
        totalSeats: 5,
        availableSeats: 3, // 5 - (4-2) = 3
        driverId: "driver-1",
        driver: { id: "driver-1", name: "John", phone: null },
      };

      (prisma.ride.findFirst as Mock).mockResolvedValue(mockExistingRide);
      (prisma.ride.update as Mock).mockResolvedValue(mockUpdatedRide);

      const result = await updateRide("ride-1", "driver-1", { totalSeats: 5 });

      expect(prisma.ride.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalSeats: 5,
            availableSeats: 3,
          }),
        })
      );
      expect(result?.availableSeats).toBe(3);
    });
  });

  describe("cancelRide", () => {
    it("should cancel ride when user is owner", async () => {
      const mockExistingRide = {
        id: "ride-1",
        driverId: "driver-1",
        status: "ACTIVE",
      };

      (prisma.ride.findFirst as Mock).mockResolvedValue(mockExistingRide);
      (prisma.ride.update as Mock).mockResolvedValue({ ...mockExistingRide, status: "CANCELLED" });

      const result = await cancelRide("ride-1", "driver-1");

      expect(prisma.ride.update).toHaveBeenCalledWith({
        where: { id: "ride-1" },
        data: { status: "CANCELLED" },
      });
      expect(result).toBe(true);
    });

    it("should return false when ride does not exist or user is not owner", async () => {
      (prisma.ride.findFirst as Mock).mockResolvedValue(null);

      const result = await cancelRide("ride-1", "different-driver");

      expect(prisma.ride.update).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("getDriverRides", () => {
    it("should return only active rides by default", async () => {
      const mockRides = [
        { id: "ride-1", status: "ACTIVE", driverId: "driver-1" },
      ];

      (prisma.ride.findMany as Mock).mockResolvedValue(mockRides);

      const result = await getDriverRides("driver-1");

      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            driverId: "driver-1",
            status: "ACTIVE",
          }),
        })
      );
      expect(result).toEqual(mockRides);
    });

    it("should include all rides when includeCompleted is true", async () => {
      const mockRides = [
        { id: "ride-1", status: "ACTIVE", driverId: "driver-1" },
        { id: "ride-2", status: "COMPLETED", driverId: "driver-1" },
        { id: "ride-3", status: "CANCELLED", driverId: "driver-1" },
      ];

      (prisma.ride.findMany as Mock).mockResolvedValue(mockRides);

      const result = await getDriverRides("driver-1", true);

      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            driverId: "driver-1",
          },
        })
      );
      expect(result).toHaveLength(3);
    });

    it("should return empty array when driver has no rides", async () => {
      (prisma.ride.findMany as Mock).mockResolvedValue([]);

      const result = await getDriverRides("driver-with-no-rides");

      expect(result).toEqual([]);
    });
  });

  describe("searchRides", () => {
    it("should return paginated results with defaults", async () => {
      const mockRides = [
        { id: "ride-1", originCity: "Tiranë", destinationCity: "Durrës" },
      ];

      (prisma.ride.findMany as Mock).mockResolvedValue(mockRides);
      (prisma.ride.count as Mock).mockResolvedValue(1);

      const result = await searchRides({});

      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { departureTime: "asc" },
        })
      );
      expect(result.rides).toEqual(mockRides);
      expect(result.total).toBe(1);
    });

    it("should filter by origin (case-insensitive)", async () => {
      (prisma.ride.findMany as Mock).mockResolvedValue([]);
      (prisma.ride.count as Mock).mockResolvedValue(0);

      await searchRides({ origin: "tirana" });

      const callArgs = (prisma.ride.findMany as Mock).mock.calls[0][0];
      expect(callArgs.where.originCity).toEqual({
        contains: "tirana",
        mode: "insensitive",
      });
    });

    it("should filter by destination (case-insensitive)", async () => {
      (prisma.ride.findMany as Mock).mockResolvedValue([]);
      (prisma.ride.count as Mock).mockResolvedValue(0);

      await searchRides({ destination: "Durres" });

      const callArgs = (prisma.ride.findMany as Mock).mock.calls[0][0];
      expect(callArgs.where.destinationCity).toEqual({
        contains: "Durres",
        mode: "insensitive",
      });
    });

    it("should apply pagination correctly", async () => {
      (prisma.ride.findMany as Mock).mockResolvedValue([]);
      (prisma.ride.count as Mock).mockResolvedValue(25);

      const result = await searchRides({ page: 2, limit: 5 });

      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
      expect(result.total).toBe(25);
    });

    it("should only return ACTIVE rides with available seats", async () => {
      (prisma.ride.findMany as Mock).mockResolvedValue([]);
      (prisma.ride.count as Mock).mockResolvedValue(0);

      await searchRides({});

      const callArgs = (prisma.ride.findMany as Mock).mock.calls[0][0];
      expect(callArgs.where.status).toBe("ACTIVE");
      expect(callArgs.where.availableSeats).toEqual({ gt: 0 });
    });

    it("should only return future rides", async () => {
      (prisma.ride.findMany as Mock).mockResolvedValue([]);
      (prisma.ride.count as Mock).mockResolvedValue(0);

      await searchRides({});

      const callArgs = (prisma.ride.findMany as Mock).mock.calls[0][0];
      expect(callArgs.where.departureTime.gte).toBeInstanceOf(Date);
    });
  });
});
