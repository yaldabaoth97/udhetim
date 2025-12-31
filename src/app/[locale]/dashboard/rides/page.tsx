"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  seatsRequested: number;
  status: string;
  message: string | null;
  createdAt: string;
  rider: {
    id: string;
    name: string;
    phone: string | null;
  };
}

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
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Record<string, Booking[]>>({});
  const [loadingBookings, setLoadingBookings] = useState<string | null>(null);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);

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

  async function fetchPendingBookings(rideId: string) {
    setLoadingBookings(rideId);
    try {
      const res = await fetch(`/api/rides/${rideId}/bookings?pending=true`);
      const data = await res.json();
      setPendingBookings((prev) => ({
        ...prev,
        [rideId]: data.bookings || [],
      }));
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoadingBookings(null);
    }
  }

  async function handleAccept(bookingId: string, rideId: string) {
    setProcessingBooking(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept booking");
      }

      // Refresh bookings and rides
      await fetchPendingBookings(rideId);
      await fetchRides();
    } catch (error) {
      console.error("Accept error:", error);
      alert(error instanceof Error ? error.message : "Failed to accept booking");
    } finally {
      setProcessingBooking(null);
    }
  }

  async function handleDecline(bookingId: string, rideId: string) {
    if (!confirm("Are you sure you want to decline this booking?")) return;

    setProcessingBooking(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to decline booking");
      }

      // Refresh bookings
      await fetchPendingBookings(rideId);
    } catch (error) {
      console.error("Decline error:", error);
      alert(error instanceof Error ? error.message : "Failed to decline booking");
    } finally {
      setProcessingBooking(null);
    }
  }

  function toggleExpand(rideId: string) {
    if (expandedRide === rideId) {
      setExpandedRide(null);
    } else {
      setExpandedRide(rideId);
      if (!pendingBookings[rideId]) {
        fetchPendingBookings(rideId);
      }
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
            const isExpanded = expandedRide === ride.id;
            const bookings = pendingBookings[ride.id] || [];
            const isLoadingThis = loadingBookings === ride.id;
            const canExpand = !isPast && !isCancelled;

            return (
              <div
                key={ride.id}
                className={`border rounded-lg overflow-hidden ${
                  isCancelled
                    ? "border-destructive/30 bg-destructive/5"
                    : isPast
                    ? "border-muted bg-muted/50"
                    : "border-input"
                }`}
              >
                {/* Ride Header */}
                <div className="p-4 flex justify-between items-start">
                  <Link href={`/rides/${ride.id}`} className="flex-1">
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
                  </Link>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(ride.pricePerSeat)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ride.availableSeats} / {ride.totalSeats} seats
                    </div>
                  </div>
                </div>

                {/* Expand button for active rides */}
                {canExpand && (
                  <div className="px-4 pb-3 border-t border-input pt-3">
                    <button
                      onClick={() => toggleExpand(ride.id)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? "▼" : "▶"} {t("bookings.pendingBookings")}
                      {bookings.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {bookings.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Pending Bookings */}
                {isExpanded && (
                  <div className="bg-muted/50 px-4 py-3 border-t border-input">
                    {isLoadingThis ? (
                      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                    ) : bookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("bookings.noPendingBookings")}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-background p-3 rounded-lg border border-input"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{booking.rider.name}</p>
                                {booking.rider.phone && (
                                  <p className="text-sm text-muted-foreground">
                                    {booking.rider.phone}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                {booking.seatsRequested} {booking.seatsRequested === 1 ? "seat" : "seats"}
                              </span>
                            </div>

                            {booking.message && (
                              <p className="text-sm text-muted-foreground mb-3 bg-muted p-2 rounded">
                                "{booking.message}"
                              </p>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAccept(booking.id, ride.id)}
                                disabled={processingBooking === booking.id}
                                className="flex-1 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {processingBooking === booking.id
                                  ? t("common.loading")
                                  : t("bookings.accept")}
                              </button>
                              <button
                                onClick={() => handleDecline(booking.id, ride.id)}
                                disabled={processingBooking === booking.id}
                                className="flex-1 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:opacity-90 disabled:opacity-50"
                              >
                                {t("bookings.decline")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
