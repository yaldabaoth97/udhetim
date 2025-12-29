import { prisma } from "@/lib/prisma";

export interface SearchLogInput {
  originCity: string;
  destinationCity: string;
  searchDate: Date;
  userId?: string;
}

export async function logSearch(data: SearchLogInput): Promise<void> {
  // Don't await - fire and forget to not slow down search
  prisma.searchLog
    .create({
      data: {
        originCity: data.originCity,
        destinationCity: data.destinationCity,
        searchDate: data.searchDate,
        userId: data.userId || null,
      },
    })
    .catch((error) => {
      console.error("Failed to log search:", error);
    });
}

export interface CityWithCount {
  id: string;
  name: string;
  nameEn: string;
  nameSq: string;
  isPopular: boolean;
}

export async function searchCities(
  query: string,
  locale: string = "sq"
): Promise<CityWithCount[]> {
  if (!query || query.length < 2) {
    // Return popular cities if no query
    return prisma.city.findMany({
      where: { isPopular: true },
      orderBy: { name: "asc" },
      take: 10,
    });
  }

  const searchField = locale === "en" ? "nameEn" : "nameSq";

  return prisma.city.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { [searchField]: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    take: 10,
  });
}

export async function getCityByName(name: string): Promise<CityWithCount | null> {
  return prisma.city.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { nameEn: { equals: name, mode: "insensitive" } },
        { nameSq: { equals: name, mode: "insensitive" } },
      ],
    },
  });
}

export interface TopRoute {
  originCity: string;
  destinationCity: string;
  searchCount: number;
}

export async function getTopRoutes(
  days: number = 7,
  limit: number = 10
): Promise<TopRoute[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await prisma.searchLog.groupBy({
    by: ["originCity", "destinationCity"],
    where: {
      createdAt: { gte: since },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: limit,
  });

  return results.map((r) => ({
    originCity: r.originCity,
    destinationCity: r.destinationCity,
    searchCount: r._count.id,
  }));
}

export interface UnderservedRoute extends TopRoute {
  availableRides: number;
}

export async function getUnderservedRoutes(
  days: number = 7,
  limit: number = 10
): Promise<UnderservedRoute[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get popular search routes
  const searchedRoutes = await prisma.searchLog.groupBy({
    by: ["originCity", "destinationCity"],
    where: {
      createdAt: { gte: since },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 50, // Get more to filter
  });

  // For each route, count available rides
  const routesWithRides = await Promise.all(
    searchedRoutes.map(async (route) => {
      const rideCount = await prisma.ride.count({
        where: {
          originCity: { equals: route.originCity, mode: "insensitive" },
          destinationCity: { equals: route.destinationCity, mode: "insensitive" },
          status: "ACTIVE",
          availableSeats: { gt: 0 },
          departureTime: { gte: new Date() },
        },
      });

      return {
        originCity: route.originCity,
        destinationCity: route.destinationCity,
        searchCount: route._count.id,
        availableRides: rideCount,
      };
    })
  );

  // Return routes with few or no available rides
  return routesWithRides
    .filter((r) => r.availableRides < 3) // Underserved = less than 3 rides
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, limit);
}
