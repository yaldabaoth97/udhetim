import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDriverRides } from "@/services/ride.service";

// GET /api/rides/my-rides - Get current user's rides as driver
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    const rides = await getDriverRides(session.user.id, includeCompleted);

    return NextResponse.json({ rides });
  } catch (error) {
    console.error("Get driver rides error:", error);
    return NextResponse.json(
      { error: "Failed to get rides" },
      { status: 500 }
    );
  }
}
