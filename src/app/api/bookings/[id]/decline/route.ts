import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { declineBooking } from "@/services/booking.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/bookings/[id]/decline - Decline a booking (driver only)
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
    const booking = await declineBooking(id, session.user.id);

    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decline booking";

    if (message === "Booking not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message === "Only the driver can decline bookings" ||
      message === "Booking is not in pending status"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Decline booking error:", error);
    return NextResponse.json(
      { error: "Failed to decline booking" },
      { status: 500 }
    );
  }
}
