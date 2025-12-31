import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPendingBookingsForRide, getBookingsForRide } from "@/services/booking.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/rides/[id]/bookings - Get bookings for a ride (driver only)
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
    const searchParams = request.nextUrl.searchParams;
    const pendingOnly = searchParams.get("pending") === "true";

    let bookings;
    if (pendingOnly) {
      bookings = await getPendingBookingsForRide(id, session.user.id);
    } else {
      // Get all bookings (for driver's view of confirmed passengers)
      bookings = await getBookingsForRide(id);
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch bookings";

    if (message === "Ride not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message === "Only the driver can view booking requests") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error("Get ride bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
