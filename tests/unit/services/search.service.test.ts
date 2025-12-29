import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock prisma before importing the service
vi.mock("@/lib/prisma", () => ({
  prisma: {
    searchLog: {
      create: vi.fn(),
      groupBy: vi.fn(),
    },
    city: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    ride: {
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  logSearch,
  searchCities,
  getCityByName,
  getTopRoutes,
  getUnderservedRoutes,
} from "@/services/search.service";

describe("Search Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logSearch", () => {
    it("should log a search with all fields", async () => {
      const searchData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        searchDate: new Date("2025-12-30"),
        userId: "user-1",
      };

      (prisma.searchLog.create as Mock).mockResolvedValue({ id: "log-1" });

      await logSearch(searchData);

      // Give it time to fire (async)
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(prisma.searchLog.create).toHaveBeenCalledWith({
        data: {
          originCity: "Tiranë",
          destinationCity: "Durrës",
          searchDate: searchData.searchDate,
          userId: "user-1",
        },
      });
    });

    it("should log search without userId (anonymous)", async () => {
      const searchData = {
        originCity: "Tiranë",
        destinationCity: "Shkodër",
        searchDate: new Date(),
      };

      (prisma.searchLog.create as Mock).mockResolvedValue({ id: "log-2" });

      await logSearch(searchData);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(prisma.searchLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: null,
        }),
      });
    });

    it("should not throw on error (fire and forget)", async () => {
      const searchData = {
        originCity: "Tiranë",
        destinationCity: "Durrës",
        searchDate: new Date(),
      };

      (prisma.searchLog.create as Mock).mockRejectedValue(new Error("DB error"));

      // Should not throw
      await expect(logSearch(searchData)).resolves.not.toThrow();
    });
  });

  describe("searchCities", () => {
    it("should return popular cities when query is empty", async () => {
      const mockCities = [
        { id: "1", name: "Tiranë", nameEn: "Tirana", nameSq: "Tiranë", isPopular: true },
        { id: "2", name: "Durrës", nameEn: "Durres", nameSq: "Durrës", isPopular: true },
      ];

      (prisma.city.findMany as Mock).mockResolvedValue(mockCities);

      const result = await searchCities("");

      expect(prisma.city.findMany).toHaveBeenCalledWith({
        where: { isPopular: true },
        orderBy: { name: "asc" },
        take: 10,
      });
      expect(result).toEqual(mockCities);
    });

    it("should return popular cities when query is too short", async () => {
      const mockCities = [
        { id: "1", name: "Tiranë", nameEn: "Tirana", nameSq: "Tiranë", isPopular: true },
      ];

      (prisma.city.findMany as Mock).mockResolvedValue(mockCities);

      const result = await searchCities("T");

      expect(prisma.city.findMany).toHaveBeenCalledWith({
        where: { isPopular: true },
        orderBy: { name: "asc" },
        take: 10,
      });
      expect(result).toEqual(mockCities);
    });

    it("should search cities by name", async () => {
      const mockCities = [
        { id: "1", name: "Tiranë", nameEn: "Tirana", nameSq: "Tiranë", isPopular: true },
      ];

      (prisma.city.findMany as Mock).mockResolvedValue(mockCities);

      await searchCities("Tir", "sq");

      expect(prisma.city.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "Tir", mode: "insensitive" } },
            { nameSq: { contains: "Tir", mode: "insensitive" } },
          ],
        },
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        take: 10,
      });
    });

    it("should use English names when locale is en", async () => {
      (prisma.city.findMany as Mock).mockResolvedValue([]);

      await searchCities("Tir", "en");

      expect(prisma.city.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "Tir", mode: "insensitive" } },
            { nameEn: { contains: "Tir", mode: "insensitive" } },
          ],
        },
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        take: 10,
      });
    });
  });

  describe("getCityByName", () => {
    it("should find city by exact name", async () => {
      const mockCity = { id: "1", name: "Tiranë", nameEn: "Tirana", nameSq: "Tiranë", isPopular: true };

      (prisma.city.findFirst as Mock).mockResolvedValue(mockCity);

      const result = await getCityByName("Tiranë");

      expect(prisma.city.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { equals: "Tiranë", mode: "insensitive" } },
            { nameEn: { equals: "Tiranë", mode: "insensitive" } },
            { nameSq: { equals: "Tiranë", mode: "insensitive" } },
          ],
        },
      });
      expect(result).toEqual(mockCity);
    });

    it("should return null when city not found", async () => {
      (prisma.city.findFirst as Mock).mockResolvedValue(null);

      const result = await getCityByName("NonexistentCity");

      expect(result).toBeNull();
    });
  });

  describe("getTopRoutes", () => {
    it("should return top searched routes", async () => {
      const mockResults = [
        { originCity: "Tiranë", destinationCity: "Durrës", _count: { id: 50 } },
        { originCity: "Tiranë", destinationCity: "Shkodër", _count: { id: 30 } },
      ];

      (prisma.searchLog.groupBy as Mock).mockResolvedValue(mockResults);

      const result = await getTopRoutes(7, 10);

      expect(prisma.searchLog.groupBy).toHaveBeenCalledWith({
        by: ["originCity", "destinationCity"],
        where: {
          createdAt: { gte: expect.any(Date) },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });

      expect(result).toEqual([
        { originCity: "Tiranë", destinationCity: "Durrës", searchCount: 50 },
        { originCity: "Tiranë", destinationCity: "Shkodër", searchCount: 30 },
      ]);
    });

    it("should use custom days parameter", async () => {
      (prisma.searchLog.groupBy as Mock).mockResolvedValue([]);

      await getTopRoutes(30, 5);

      const callArgs = (prisma.searchLog.groupBy as Mock).mock.calls[0][0];
      expect(callArgs.take).toBe(5);
    });
  });

  describe("getUnderservedRoutes", () => {
    it("should return routes with few available rides", async () => {
      const mockSearchResults = [
        { originCity: "Tiranë", destinationCity: "Korçë", _count: { id: 100 } },
        { originCity: "Tiranë", destinationCity: "Durrës", _count: { id: 50 } },
      ];

      (prisma.searchLog.groupBy as Mock).mockResolvedValue(mockSearchResults);
      // First route has 0 rides, second has 5 rides
      (prisma.ride.count as Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(5);

      const result = await getUnderservedRoutes(7, 10);

      // Only the first route should be returned (< 3 rides)
      expect(result).toEqual([
        { originCity: "Tiranë", destinationCity: "Korçë", searchCount: 100, availableRides: 0 },
      ]);
    });

    it("should filter out routes with enough rides", async () => {
      const mockSearchResults = [
        { originCity: "Tiranë", destinationCity: "Durrës", _count: { id: 50 } },
      ];

      (prisma.searchLog.groupBy as Mock).mockResolvedValue(mockSearchResults);
      (prisma.ride.count as Mock).mockResolvedValue(10); // Has enough rides

      const result = await getUnderservedRoutes();

      expect(result).toEqual([]);
    });
  });
});
