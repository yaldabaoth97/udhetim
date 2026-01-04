"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Ride {
  id: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  driver: {
    name: string;
  };
}

interface SearchResult {
  rides: Ride[];
  total: number;
}

export default function RidesPage() {
  const t = useTranslations();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRides();
  }, [page]);

  async function fetchRides() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (origin) params.set("origin", origin);
      if (destination) params.set("destination", destination);
      if (date) params.set("date", date);
      params.set("page", page.toString());

      const res = await fetch(`/api/rides?${params}`);
      const data: SearchResult = await res.json();
      setRides(data.rides);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch rides:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchRides();
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("rides.searchRides")}
          </h1>
          <p className="text-muted-foreground">
            Find the perfect ride for your next trip
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-border/50 p-2 mb-12 sticky top-24 z-30 backdrop-blur-sm bg-white/90">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <div className="w-2.5 h-2.5 rounded-full border-[3px] border-current" />
              </div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder={t("rides.origin")}
                className="w-full h-14 pl-10 pr-4 bg-transparent rounded-2xl focus:bg-accent/50 hover:bg-muted/30 focus:outline-none transition-colors text-foreground font-medium placeholder:font-normal"
              />
            </div>

            <div className="hidden md:flex items-center justify-center text-muted-foreground">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>

            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-green-500 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full border-[3px] border-current" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t("rides.destination")}
                className="w-full h-14 pl-10 pr-4 bg-transparent rounded-2xl focus:bg-accent/50 hover:bg-muted/30 focus:outline-none transition-colors text-foreground font-medium placeholder:font-normal"
              />
            </div>

            <div className="w-px h-8 bg-border my-auto hidden md:block" />

            <div className="md:w-48 relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 px-4 bg-transparent rounded-2xl focus:bg-accent/50 hover:bg-muted/30 focus:outline-none transition-colors text-foreground"
              />
            </div>

            <button
              type="submit"
              className="h-14 px-8 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
            >
              {t("common.search")}
            </button>
          </form>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground font-medium">
              Searching for rides...
            </span>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No rides found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              We couldn&apos;t find any rides matching your search. Try changing
              the date or cities.
            </p>
            <Link
              href="/rides/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors"
            >
              {t("rides.postRide")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {rides.map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="group block bg-white rounded-2xl border border-border p-5 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    {/* Time & Route */}
                    <div className="space-y-1 min-w-[140px]">
                      <div className="text-xl font-bold text-foreground">
                        {formatDate(new Date(ride.departureTime)).split(",")[0]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(ride.departureTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Connection Line */}
                    <div className="flex flex-col gap-1 relative pl-6 border-l-2 border-dashed border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-foreground" />
                        <span className="font-semibold text-lg">
                          {ride.originCity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <span className="font-semibold text-lg text-muted-foreground">
                          {ride.destinationCity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Driver */}
                  <div className="flex items-center gap-8">
                    <div className="hidden sm:flex items-center gap-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-foreground">
                          {ride.driver.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Driver
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                        {ride.driver.name[0]}
                      </div>
                    </div>

                    <div className="text-right pl-6 border-l border-border">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(ride.pricePerSeat)}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-1 bg-muted px-2 py-1 rounded-md inline-block">
                        {ride.availableSeats} seats left
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {t("common.back")}
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 10)}
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
