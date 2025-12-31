import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { BookingStatus, PaymentMethod, RideStatus } from "@prisma/client";

// Mock prisma before importing the service
vi.mock("@/lib/prisma", () => ({
  prisma: {
    ride: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import {
  createBookingRequest,
  acceptBooking,
  declineBooking,
  cancelBooking,
  getBookingsForRider,
  getPendingBookingsForRide,
  getBookingById,
} from "@/services/booking.service";

describe("BookingService", () => {
  const mockDriver = {
    id: "driver-123",
    email: "driver@test.com",
    name: "Test Driver",
    phone: "+355691234567",
  };

  const mockRider = {
    id: "rider-456",
    email: "rider@test.com",
    name: "Test Rider",
    phone: "+355699876543",
  };

  const mockRide = {
    id: "ride-789",
    driverId: mockDriver.id,
    driver: mockDriver,
    originCity: "Tiranë",
    destinationCity: "Durrës",
    departureTime: new Date("2025-12-30T10:00:00Z"),
    availableSeats: 3,
    totalSeats: 4,
    pricePerSeat: 500,
    status: RideStatus.ACTIVE,
  };

  const mockBooking = {
    id: "booking-001",
    rideId: mockRide.id,
    ride: mockRide,
    riderId: mockRider.id,
    rider: mockRider,
    seatsRequested: 2,
    status: BookingStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    message: "Please pick me up at the corner",
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-02"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // AC-08: Create a booking request
  // ============================================
  describe("createBookingRequest", () => {
    it("should successfully create a booking request with valid data", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);
      (prisma.booking.create as Mock).mockResolvedValue(mockBooking);

      const result = await createBookingRequest({
        riderId: mockRider.id,
        rideId: mockRide.id,
        seatsRequested: 2,
        message: "Please pick me up at the corner",
      });

      expect(result).toEqual(mockBooking);
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riderId: mockRider.id,
          rideId: mockRide.id,
          seatsRequested: 2,
          message: "Please pick me up at the corner",
          status: BookingStatus.PENDING,
          paymentMethod: PaymentMethod.CASH,
        }),
        include: expect.any(Object),
      });
    });

    it("should create booking without optional message", async () => {
      const bookingNoMessage = { ...mockBooking, message: null };
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);
      (prisma.booking.create as Mock).mockResolvedValue(bookingNoMessage);

      const result = await createBookingRequest({
        riderId: mockRider.id,
        rideId: mockRide.id,
        seatsRequested: 1,
      });

      expect(result.message).toBeNull();
    });

    it("should fail if rider tries to book their own ride", async () => {
      const driverRide = { ...mockRide, driverId: mockRider.id };
      (prisma.ride.findUnique as Mock).mockResolvedValue(driverRide);

      await expect(
        createBookingRequest({
          riderId: mockRider.id,
          rideId: mockRide.id,
          seatsRequested: 1,
        })
      ).rejects.toThrow("Cannot book your own ride");
    });

    it("should fail if ride does not exist", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(null);

      await expect(
        createBookingRequest({
          riderId: mockRider.id,
          rideId: "non-existent",
          seatsRequested: 1,
        })
      ).rejects.toThrow("Ride not found");
    });

    it("should fail if not enough available seats", async () => {
      const rideWithFewSeats = { ...mockRide, availableSeats: 1 };
      (prisma.ride.findUnique as Mock).mockResolvedValue(rideWithFewSeats);
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);

      await expect(
        createBookingRequest({
          riderId: mockRider.id,
          rideId: mockRide.id,
          seatsRequested: 3,
        })
      ).rejects.toThrow("Not enough available seats");
    });

    it("should fail if rider already has a booking on this ride", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);
      (prisma.booking.findUnique as Mock).mockResolvedValue(mockBooking);

      await expect(
        createBookingRequest({
          riderId: mockRider.id,
          rideId: mockRide.id,
          seatsRequested: 1,
        })
      ).rejects.toThrow("You already have a booking for this ride");
    });

    it("should fail if ride is not ACTIVE", async () => {
      const cancelledRide = { ...mockRide, status: RideStatus.CANCELLED };
      (prisma.ride.findUnique as Mock).mockResolvedValue(cancelledRide);
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);

      await expect(
        createBookingRequest({
          riderId: mockRider.id,
          rideId: mockRide.id,
          seatsRequested: 1,
        })
      ).rejects.toThrow("Ride is not available for booking");
    });

    it("should fail if seatsRequested is zero", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);

      await expect(
        createBookingRequest({
          riderId: mockRider.id,
          rideId: mockRide.id,
          seatsRequested: 0,
        })
      ).rejects.toThrow("Seats requested must be at least 1");
    });
  });

  // ============================================
  // AC-16: Payment method defaults to CASH
  // ============================================
  describe("Payment method", () => {
    it("should set payment method to CASH by default", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);
      (prisma.booking.create as Mock).mockResolvedValue(mockBooking);

      await createBookingRequest({
        riderId: mockRider.id,
        rideId: mockRide.id,
        seatsRequested: 1,
      });

      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paymentMethod: PaymentMethod.CASH,
        }),
        include: expect.any(Object),
      });
    });
  });

  // ============================================
  // AC-10: Accept booking (driver only)
  // AC-12: Available seats decrease
  // ============================================
  describe("acceptBooking", () => {
    it("should successfully accept a pending booking as the driver", async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING, ride: mockRide };
      const acceptedBooking = { ...mockBooking, status: BookingStatus.ACCEPTED };

      (prisma.booking.findUnique as Mock).mockResolvedValue(pendingBooking);
      // Mock $transaction to return the updated booking
      (prisma.$transaction as Mock).mockResolvedValue([
        acceptedBooking,
        { ...mockRide, availableSeats: 1 },
      ]);

      const result = await acceptBooking(mockBooking.id, mockDriver.id);

      expect(result.status).toBe(BookingStatus.ACCEPTED);
    });

    it("should decrease available seats when accepting", async () => {
      const pendingBooking = { ...mockBooking, seatsRequested: 2, ride: mockRide };
      const acceptedBooking = { ...pendingBooking, status: BookingStatus.ACCEPTED };

      (prisma.booking.findUnique as Mock).mockResolvedValue(pendingBooking);
      (prisma.$transaction as Mock).mockImplementation(async (operations) => {
        // Execute the operations to capture the calls
        return Promise.all(operations);
      });
      (prisma.booking.update as Mock).mockResolvedValue(acceptedBooking);
      (prisma.ride.update as Mock).mockResolvedValue({
        ...mockRide,
        availableSeats: 1,
      });

      await acceptBooking(mockBooking.id, mockDriver.id);

      expect(prisma.ride.update).toHaveBeenCalledWith({
        where: { id: mockRide.id },
        data: {
          availableSeats: { decrement: 2 },
        },
      });
    });

    it("should fail if user is not the ride driver", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue({
        ...mockBooking,
        ride: mockRide,
      });

      await expect(
        acceptBooking(mockBooking.id, "some-other-user")
      ).rejects.toThrow("Only the driver can accept bookings");
    });

    it("should fail if booking is already accepted", async () => {
      const acceptedBooking = { ...mockBooking, status: BookingStatus.ACCEPTED, ride: mockRide };
      (prisma.booking.findUnique as Mock).mockResolvedValue(acceptedBooking);

      await expect(
        acceptBooking(mockBooking.id, mockDriver.id)
      ).rejects.toThrow("Booking is not in pending status");
    });

    it("should fail if booking does not exist", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);

      await expect(
        acceptBooking("non-existent", mockDriver.id)
      ).rejects.toThrow("Booking not found");
    });

    it("should fail if not enough seats available", async () => {
      const rideNoSeats = { ...mockRide, availableSeats: 0 };
      const pendingBooking = { ...mockBooking, seatsRequested: 2, ride: rideNoSeats };
      (prisma.booking.findUnique as Mock).mockResolvedValue(pendingBooking);

      await expect(
        acceptBooking(mockBooking.id, mockDriver.id)
      ).rejects.toThrow("Not enough available seats");
    });
  });

  // ============================================
  // AC-10: Decline booking (driver only)
  // ============================================
  describe("declineBooking", () => {
    it("should successfully decline a pending booking as the driver", async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING, ride: mockRide };
      const declinedBooking = { ...mockBooking, status: BookingStatus.DECLINED };

      (prisma.booking.findUnique as Mock).mockResolvedValue(pendingBooking);
      (prisma.booking.update as Mock).mockResolvedValue(declinedBooking);

      const result = await declineBooking(mockBooking.id, mockDriver.id);

      expect(result.status).toBe(BookingStatus.DECLINED);
      expect(prisma.ride.update).not.toHaveBeenCalled(); // Should NOT change seats
    });

    it("should fail if user is not the ride driver", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue({
        ...mockBooking,
        ride: mockRide,
      });

      await expect(
        declineBooking(mockBooking.id, "some-other-user")
      ).rejects.toThrow("Only the driver can decline bookings");
    });

    it("should fail if booking is not pending", async () => {
      const acceptedBooking = { ...mockBooking, status: BookingStatus.ACCEPTED, ride: mockRide };
      (prisma.booking.findUnique as Mock).mockResolvedValue(acceptedBooking);

      await expect(
        declineBooking(mockBooking.id, mockDriver.id)
      ).rejects.toThrow("Booking is not in pending status");
    });
  });

  // ============================================
  // Cancel booking (rider only)
  // ============================================
  describe("cancelBooking", () => {
    it("should successfully cancel own pending booking", async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING };
      const cancelledBooking = { ...mockBooking, status: BookingStatus.CANCELLED };

      (prisma.booking.findUnique as Mock).mockResolvedValue(pendingBooking);
      (prisma.booking.update as Mock).mockResolvedValue(cancelledBooking);

      const result = await cancelBooking(mockBooking.id, mockRider.id);

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it("should fail if user is not the booking rider", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue(mockBooking);

      await expect(
        cancelBooking(mockBooking.id, "some-other-user")
      ).rejects.toThrow("Only the rider can cancel their booking");
    });

    it("should fail if booking is already accepted", async () => {
      const acceptedBooking = { ...mockBooking, status: BookingStatus.ACCEPTED };
      (prisma.booking.findUnique as Mock).mockResolvedValue(acceptedBooking);

      await expect(
        cancelBooking(mockBooking.id, mockRider.id)
      ).rejects.toThrow("Cannot cancel a booking that is not pending");
    });

    it("should fail if booking does not exist", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);

      await expect(
        cancelBooking("non-existent", mockRider.id)
      ).rejects.toThrow("Booking not found");
    });
  });

  // ============================================
  // AC-20: Get rider's bookings
  // ============================================
  describe("getBookingsForRider", () => {
    it("should return all bookings for a rider sorted by createdAt desc", async () => {
      const bookings = [
        { ...mockBooking, id: "b1", createdAt: new Date("2025-01-15") },
        { ...mockBooking, id: "b2", createdAt: new Date("2025-01-01") },
      ];
      (prisma.booking.findMany as Mock).mockResolvedValue(bookings);

      const result = await getBookingsForRider(mockRider.id);

      expect(result).toHaveLength(2);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { riderId: mockRider.id },
        orderBy: { createdAt: "desc" },
        include: expect.objectContaining({
          ride: expect.any(Object),
        }),
      });
    });

    it("should return empty array if rider has no bookings", async () => {
      (prisma.booking.findMany as Mock).mockResolvedValue([]);

      const result = await getBookingsForRider("rider-no-bookings");

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // Get pending bookings for ride (driver view)
  // ============================================
  describe("getPendingBookingsForRide", () => {
    it("should return pending bookings for driver's ride", async () => {
      const pendingBookings = [
        { ...mockBooking, status: BookingStatus.PENDING },
      ];
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);
      (prisma.booking.findMany as Mock).mockResolvedValue(pendingBookings);

      const result = await getPendingBookingsForRide(mockRide.id, mockDriver.id);

      expect(result).toHaveLength(1);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          rideId: mockRide.id,
          status: BookingStatus.PENDING,
        },
        include: expect.objectContaining({
          rider: true,
        }),
        orderBy: { createdAt: "asc" },
      });
    });

    it("should fail if user is not the ride driver", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(mockRide);

      await expect(
        getPendingBookingsForRide(mockRide.id, "some-other-user")
      ).rejects.toThrow("Only the driver can view booking requests");
    });

    it("should fail if ride does not exist", async () => {
      (prisma.ride.findUnique as Mock).mockResolvedValue(null);

      await expect(
        getPendingBookingsForRide("non-existent", mockDriver.id)
      ).rejects.toThrow("Ride not found");
    });
  });

  // ============================================
  // Get booking by ID
  // ============================================
  describe("getBookingById", () => {
    it("should return booking with ride and rider details", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue(mockBooking);

      const result = await getBookingById(mockBooking.id);

      expect(result).toEqual(mockBooking);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
        include: {
          ride: { include: { driver: true } },
          rider: true,
        },
      });
    });

    it("should return null if booking not found", async () => {
      (prisma.booking.findUnique as Mock).mockResolvedValue(null);

      const result = await getBookingById("non-existent");

      expect(result).toBeNull();
    });
  });
});
