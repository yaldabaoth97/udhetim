import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancelBooking } from "@/services/booking.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/bookings/[id]/cancel - Cancel a booking (rider only)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const booking = await cancelBooking(id, session.user.id);

    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel booking";

    if (message === "Booking not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message === "Only the rider can cancel their booking" ||
      message === "Cannot cancel a booking that is not pending"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
