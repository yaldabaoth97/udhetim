import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { acceptBooking } from "@/services/booking.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/bookings/[id]/accept - Accept a booking (driver only)
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
    const booking = await acceptBooking(id, session.user.id);

    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept booking";

    if (message === "Booking not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message === "Only the driver can accept bookings" ||
      message === "Booking is not in pending status" ||
      message === "Not enough available seats"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Accept booking error:", error);
    return NextResponse.json(
      { error: "Failed to accept booking" },
      { status: 500 }
    );
  }
}
