import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBookingById } from "@/services/booking.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/bookings/[id] - Get a single booking
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Only the rider or driver can view the booking
    const isRider = booking.riderId === session.user.id;
    const isDriver = booking.ride.driverId === session.user.id;

    if (!isRider && !isDriver) {
      return NextResponse.json(
        { error: "Not authorized to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
