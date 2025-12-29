import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/services/search.service";

// GET /api/cities - Search cities for autocomplete
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const locale = searchParams.get("locale") || "sq";

    const cities = await searchCities(query, locale);

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("City search error:", error);
    return NextResponse.json(
      { error: "Failed to search cities" },
      { status: 500 }
    );
  }
}
