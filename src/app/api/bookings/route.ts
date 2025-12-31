import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBookingRequest, getBookingsForRider } from "@/services/booking.service";

// POST /api/bookings - Create a booking request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rideId, seatsRequested, message } = body;

    if (!rideId) {
      return NextResponse.json(
        { error: "Ride ID is required" },
        { status: 400 }
      );
    }

    if (!seatsRequested || seatsRequested < 1) {
      return NextResponse.json(
        { error: "Number of seats must be at least 1" },
        { status: 400 }
      );
    }

    const booking = await createBookingRequest({
      riderId: session.user.id,
      rideId,
      seatsRequested,
      message,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create booking";

    // Return appropriate status codes for known errors
    if (message === "Ride not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message === "Cannot book your own ride" ||
      message === "You already have a booking for this ride" ||
      message === "Not enough available seats" ||
      message === "Ride is not available for booking" ||
      message === "Seats requested must be at least 1"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Get current user's bookings (as rider)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const bookings = await getBookingsForRider(session.user.id);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
