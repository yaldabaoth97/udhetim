import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentMethod, RideStatus } from "@prisma/client";

export interface CreateBookingInput {
  riderId: string;
  rideId: string;
  seatsRequested: number;
  message?: string;
}

export async function createBookingRequest(data: CreateBookingInput) {
  // Validate seats requested
  if (data.seatsRequested < 1) {
    throw new Error("Seats requested must be at least 1");
  }

  // Get the ride
  const ride = await prisma.ride.findUnique({
    where: { id: data.rideId },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  // Check ride is active
  if (ride.status !== RideStatus.ACTIVE) {
    throw new Error("Ride is not available for booking");
  }

  // Check rider isn't booking their own ride
  if (ride.driverId === data.riderId) {
    throw new Error("Cannot book your own ride");
  }

  // Check if rider already has a booking for this ride
  const existingBooking = await prisma.booking.findUnique({
    where: {
      rideId_riderId: {
        rideId: data.rideId,
        riderId: data.riderId,
      },
    },
  });

  if (existingBooking) {
    throw new Error("You already have a booking for this ride");
  }

  // Check available seats
  if (ride.availableSeats < data.seatsRequested) {
    throw new Error("Not enough available seats");
  }

  // Create the booking
  return prisma.booking.create({
    data: {
      riderId: data.riderId,
      rideId: data.rideId,
      seatsRequested: data.seatsRequested,
      message: data.message || null,
      status: BookingStatus.PENDING,
      paymentMethod: PaymentMethod.CASH,
    },
    include: {
      ride: { include: { driver: true } },
      rider: true,
    },
  });
}

export async function acceptBooking(bookingId: string, userId: string) {
  // Get booking with ride details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { ride: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Only driver can accept
  if (booking.ride.driverId !== userId) {
    throw new Error("Only the driver can accept bookings");
  }

  // Must be pending
  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Booking is not in pending status");
  }

  // Check seats still available
  if (booking.ride.availableSeats < booking.seatsRequested) {
    throw new Error("Not enough available seats");
  }

  // Accept booking and decrease seats atomically
  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACCEPTED },
      include: {
        ride: { include: { driver: true } },
        rider: true,
      },
    }),
    prisma.ride.update({
      where: { id: booking.rideId },
      data: {
        availableSeats: { decrement: booking.seatsRequested },
      },
    }),
  ]);

  return updatedBooking;
}

export async function declineBooking(bookingId: string, userId: string) {
  // Get booking with ride details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { ride: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Only driver can decline
  if (booking.ride.driverId !== userId) {
    throw new Error("Only the driver can decline bookings");
  }

  // Must be pending
  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Booking is not in pending status");
  }

  // Decline booking (no seat changes needed)
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.DECLINED },
    include: {
      ride: { include: { driver: true } },
      rider: true,
    },
  });
}

export async function cancelBooking(bookingId: string, userId: string) {
  // Get booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Only rider can cancel their own booking
  if (booking.riderId !== userId) {
    throw new Error("Only the rider can cancel their booking");
  }

  // Can only cancel pending bookings
  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Cannot cancel a booking that is not pending");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
    include: {
      ride: { include: { driver: true } },
      rider: true,
    },
  });
}

export async function getBookingsForRider(riderId: string) {
  return prisma.booking.findMany({
    where: { riderId },
    orderBy: { createdAt: "desc" },
    include: {
      ride: { include: { driver: true } },
    },
  });
}

export async function getPendingBookingsForRide(rideId: string, userId: string) {
  // Get ride to verify ownership
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.driverId !== userId) {
    throw new Error("Only the driver can view booking requests");
  }

  return prisma.booking.findMany({
    where: {
      rideId,
      status: BookingStatus.PENDING,
    },
    include: {
      rider: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBookingById(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: { include: { driver: true } },
      rider: true,
    },
  });
}

export async function getBookingsForRide(rideId: string) {
  return prisma.booking.findMany({
    where: { rideId },
    include: {
      rider: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
