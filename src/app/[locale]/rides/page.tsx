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
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("rides.searchRides")}</h1>
        <Link
          href="/rides/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {t("rides.postRide")}
        </Link>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("rides.origin")}
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Tiranë"
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("rides.destination")}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Durrës"
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("rides.departureTime")}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              {t("common.search")}
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">{t("common.loading")}</div>
      ) : rides.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("rides.noRidesFound")}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {rides.map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="block p-4 border border-input rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-medium">
                      {ride.originCity} → {ride.destinationCity}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(new Date(ride.departureTime))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t("rides.driver")}: {ride.driver.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(ride.pricePerSeat)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ride.availableSeats} {t("rides.seats")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-input rounded-lg disabled:opacity-50"
              >
                {t("common.back")}
              </button>
              <span className="px-4 py-2">
                {page} / {Math.ceil(total / 10)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
                className="px-4 py-2 border border-input rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
