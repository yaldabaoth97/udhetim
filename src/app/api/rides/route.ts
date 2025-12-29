import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rideSchema } from "@/lib/validation";
import { createRide, searchRides } from "@/services/ride.service";

// GET /api/rides - Search rides
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get("origin") || undefined;
    const destination = searchParams.get("destination") || undefined;
    const dateStr = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const date = dateStr ? new Date(dateStr) : undefined;

    const result = await searchRides({
      origin,
      destination,
      date,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search rides error:", error);
    return NextResponse.json(
      { error: "Failed to search rides" },
      { status: 500 }
    );
  }
}

// POST /api/rides - Create a new ride
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
    const parsed = rideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Convert departureTime string to Date if needed
    const rideData = {
      ...parsed.data,
      departureTime: new Date(parsed.data.departureTime),
    };

    const ride = await createRide(session.user.id, rideData);

    return NextResponse.json({ ride }, { status: 201 });
  } catch (error) {
    console.error("Create ride error:", error);
    return NextResponse.json(
      { error: "Failed to create ride" },
      { status: 500 }
    );
  }
}
