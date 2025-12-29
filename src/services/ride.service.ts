import { prisma } from "@/lib/prisma";
import { RideStatus } from "@prisma/client";
import { RideInput } from "@/lib/validation";

export interface RideWithDriver {
  id: string;
  driverId: string;
  originCity: string;
  destinationCity: string;
  departureTime: Date;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  notes: string | null;
  status: string;
  createdAt: Date;
  driver: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export async function createRide(
  driverId: string,
  data: RideInput
): Promise<RideWithDriver> {
  const ride = await prisma.ride.create({
    data: {
      driverId,
      originCity: data.originCity,
      destinationCity: data.destinationCity,
      departureTime: data.departureTime,
      pricePerSeat: data.pricePerSeat,
      totalSeats: data.totalSeats,
      availableSeats: data.totalSeats,
      notes: data.notes || null,
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

  return ride as RideWithDriver;
}

export async function getRideById(
  id: string
): Promise<RideWithDriver | null> {
  const ride = await prisma.ride.findUnique({
    where: { id },
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

  return ride as RideWithDriver | null;
}

export async function updateRide(
  id: string,
  driverId: string,
  data: Partial<RideInput>
): Promise<RideWithDriver | null> {
  // First verify the ride belongs to the driver
  const existing = await prisma.ride.findFirst({
    where: { id, driverId },
  });

  if (!existing) {
    return null;
  }

  const ride = await prisma.ride.update({
    where: { id },
    data: {
      ...(data.originCity && { originCity: data.originCity }),
      ...(data.destinationCity && { destinationCity: data.destinationCity }),
      ...(data.departureTime && { departureTime: data.departureTime }),
      ...(data.pricePerSeat && { pricePerSeat: data.pricePerSeat }),
      ...(data.totalSeats && {
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats - (existing.totalSeats - existing.availableSeats),
      }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
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

  return ride as RideWithDriver;
}

export async function cancelRide(
  id: string,
  driverId: string
): Promise<boolean> {
  const existing = await prisma.ride.findFirst({
    where: { id, driverId },
  });

  if (!existing) {
    return false;
  }

  await prisma.ride.update({
    where: { id },
    data: { status: RideStatus.CANCELLED },
  });

  return true;
}

export async function getDriverRides(
  driverId: string,
  includeCompleted = false
): Promise<RideWithDriver[]> {
  const rides = await prisma.ride.findMany({
    where: {
      driverId,
      ...(includeCompleted ? {} : { status: RideStatus.ACTIVE }),
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
    orderBy: { departureTime: "asc" },
  });

  return rides as RideWithDriver[];
}

export async function searchRides(params: {
  origin?: string;
  destination?: string;
  date?: Date;
  page?: number;
  limit?: number;
}): Promise<{ rides: RideWithDriver[]; total: number }> {
  const { origin, destination, date, page = 1, limit = 10 } = params;

  const where = {
    status: RideStatus.ACTIVE,
    availableSeats: { gt: 0 },
    departureTime: { gte: new Date() }, // Only future rides
    ...(origin && { originCity: { contains: origin, mode: "insensitive" as const } }),
    ...(destination && { destinationCity: { contains: destination, mode: "insensitive" as const } }),
    ...(date && {
      departureTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    }),
  };

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { departureTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ride.count({ where }),
  ]);

  return { rides: rides as RideWithDriver[], total };
}
