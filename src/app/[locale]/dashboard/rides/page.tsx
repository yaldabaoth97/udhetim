"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Ride {
  id: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
}

export default function DriverRidesPage() {
  const t = useTranslations();
  const { status } = useSession();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRides();
    }
  }, [status, showCompleted]);

  async function fetchRides() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showCompleted) params.set("includeCompleted", "true");

      const res = await fetch(`/api/rides/my-rides?${params}`);
      const data = await res.json();
      setRides(data.rides || []);
    } catch (error) {
      console.error("Failed to fetch rides:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>{t("common.loading")}</div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4">{t("errors.unauthorized")}</p>
          <Link href="/auth/login" className="text-primary hover:underline">
            {t("auth.login")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("rides.myRides")}</h1>
        <Link
          href="/rides/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {t("rides.postRide")}
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Show completed and cancelled rides</span>
        </label>
      </div>

      {/* Rides List */}
      {loading ? (
        <div className="text-center py-8">{t("common.loading")}</div>
      ) : rides.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("rides.noRidesFound")}</p>
          <Link
            href="/rides/new"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            {t("rides.postRide")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const isPast = new Date(ride.departureTime) < new Date();
            const isCancelled = ride.status === "CANCELLED";

            return (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className={`block p-4 border rounded-lg transition-colors ${
                  isCancelled
                    ? "border-destructive/30 bg-destructive/5"
                    : isPast
                    ? "border-muted bg-muted/50"
                    : "border-input hover:bg-muted"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">
                        {ride.originCity} → {ride.destinationCity}
                      </span>
                      {isCancelled && (
                        <span className="px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
                          Cancelled
                        </span>
                      )}
                      {isPast && !isCancelled && (
                        <span className="px-2 py-0.5 text-xs bg-muted-foreground/20 rounded">
                          Past
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(new Date(ride.departureTime))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(ride.pricePerSeat)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ride.availableSeats} / {ride.totalSeats} seats
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
