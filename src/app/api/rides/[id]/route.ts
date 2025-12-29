import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rideSchema } from "@/lib/validation";
import { getRideById, updateRide, cancelRide } from "@/services/ride.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/rides/[id] - Get a single ride
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const ride = await getRideById(id);

    if (!ride) {
      return NextResponse.json(
        { error: "Ride not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ride });
  } catch (error) {
    console.error("Get ride error:", error);
    return NextResponse.json(
      { error: "Failed to get ride" },
      { status: 500 }
    );
  }
}

// PATCH /api/rides/[id] - Update a ride
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Partial validation for updates
    const parsed = rideSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Convert departureTime if provided
    const updateData = {
      ...parsed.data,
      ...(parsed.data.departureTime && {
        departureTime: new Date(parsed.data.departureTime),
      }),
    };

    const ride = await updateRide(id, session.user.id, updateData);

    if (!ride) {
      return NextResponse.json(
        { error: "Ride not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ride });
  } catch (error) {
    console.error("Update ride error:", error);
    return NextResponse.json(
      { error: "Failed to update ride" },
      { status: 500 }
    );
  }
}

// DELETE /api/rides/[id] - Cancel a ride
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const success = await cancelRide(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Ride not found or you don't have permission to cancel it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Ride cancelled successfully" });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return NextResponse.json(
      { error: "Failed to cancel ride" },
      { status: 500 }
    );
  }
}
