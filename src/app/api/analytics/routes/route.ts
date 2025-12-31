import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTopRoutes, getUnderservedRoutes } from "@/services/search.service";

// GET /api/analytics/routes - Get route analytics for driver dashboard
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
    const days = parseInt(searchParams.get("days") || "7", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate parameters
    const validDays = [7, 30];
    const safeDays = validDays.includes(days) ? days : 7;
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    // Fetch both top routes and underserved routes in parallel
    const [topRoutes, underservedRoutes] = await Promise.all([
      getTopRoutes(safeDays, safeLimit),
      getUnderservedRoutes(safeDays, safeLimit),
    ]);

    return NextResponse.json({
      topRoutes,
      underservedRoutes,
      period: {
        days: safeDays,
        startDate: new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
