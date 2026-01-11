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
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative pt-8 pb-6 sm:pt-12 sm:pb-10 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-2">
              {t("rides.searchRides")}
            </h1>
            <p className="text-muted-foreground">
              Find your perfect ride across Albania
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="relative bg-background rounded-2xl border border-border shadow-lg p-2"
          >
            <div className="flex flex-col md:flex-row gap-2">
              {/* Origin */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t("rides.origin")}
                  className="w-full h-14 pl-11 pr-4 bg-transparent rounded-xl text-foreground font-medium placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:bg-muted/30 hover:bg-muted/20 transition-colors"
                />
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center px-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>

              {/* Destination */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t("rides.destination")}
                  className="w-full h-14 pl-11 pr-4 bg-transparent rounded-xl text-foreground font-medium placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:bg-muted/30 hover:bg-muted/20 transition-colors"
                />
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-border my-auto" />

              {/* Date */}
              <div className="md:w-44 relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent rounded-xl text-foreground focus:outline-none focus:bg-muted/30 hover:bg-muted/20 transition-colors"
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="h-14 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.98]"
              >
                {t("common.search")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <span className="text-muted-foreground font-medium">
              Searching for rides...
            </span>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V9.75M18.75 18.75V9.75" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No rides found
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              We couldn&apos;t find any rides matching your search. Try adjusting the date or cities.
            </p>
            <Link
              href="/rides/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("rides.postRide")}
            </Link>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "ride" : "rides"} found
              </p>
            </div>

            {/* Ride cards */}
            <div className="grid gap-4">
              {rides.map((ride, index) => (
                <Link
                  key={ride.id}
                  href={`/rides/${ride.id}`}
                  className="group block bg-card rounded-2xl border border-border p-5 sm:p-6 transition-all hover:shadow-lg hover:border-primary/20 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Route info */}
                    <div className="flex items-start gap-5">
                      {/* Time */}
                      <div className="text-center min-w-[72px]">
                        <div className="text-2xl font-bold text-foreground">
                          {new Date(ride.departureTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(new Date(ride.departureTime)).split(",")[0]}
                        </div>
                      </div>

                      {/* Route visualization */}
                      <div className="flex items-center gap-4">
                        {/* Route dots and line */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <div className="w-0.5 h-8 bg-border" />
                          <div className="w-3 h-3 rounded-full bg-success" />
                        </div>

                        {/* Cities */}
                        <div className="space-y-4">
                          <div>
                            <span className="font-semibold text-foreground text-lg">
                              {ride.originCity}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              {ride.destinationCity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Driver, seats, price */}
                    <div className="flex items-center gap-6 sm:gap-8">
                      {/* Driver */}
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="font-semibold text-secondary">
                            {ride.driver.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {ride.driver.name.split(" ")[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Driver
                          </div>
                        </div>
                      </div>

                      {/* Seats badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span className="text-sm font-medium text-foreground">
                          {ride.availableSeats}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-right pl-4 sm:pl-6 border-l border-border">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(ride.pricePerSeat)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per seat
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-muted group-hover:bg-primary group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {t("common.back")}
            </button>
            <span className="text-sm text-muted-foreground font-medium">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 10)}
              className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
