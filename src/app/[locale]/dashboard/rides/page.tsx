"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          <span className="text-gray-500">{t("common.loading")}</span>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600">{t("errors.unauthorized")}</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t("auth.login")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t("rides.myRides")}</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your rides and booking requests</p>
          </div>
          <Link
            href="/rides/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 shadow-sm hover:shadow transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("rides.postRide")}
          </Link>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-gray-700">Show completed and cancelled rides</span>
          </label>
        </div>

        {/* Rides List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
              <span className="text-gray-500">{t("common.loading")}</span>
            </div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{t("rides.noRidesFound")}</p>
            <Link
              href="/rides/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
                  className={`bg-white rounded-xl border overflow-hidden shadow-sm ${
                    isCancelled
                      ? "border-red-200 bg-red-50/50"
                      : isPast
                      ? "border-gray-200 bg-gray-50/50"
                      : "border-gray-100 shadow-lg"
                  }`}
                >
                  {/* Ride Header */}
                  <div className="p-5 flex justify-between items-start gap-4">
                    <Link href={`/rides/${ride.id}`} className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-medium text-gray-900">{ride.originCity}</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium text-gray-900">{ride.destinationCity}</span>
                        </div>
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            Cancelled
                          </span>
                        )}
                        {isPast && !isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            Past
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(new Date(ride.departureTime))}</span>
                      </div>
                    </Link>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(ride.pricePerSeat)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ride.availableSeats} / {ride.totalSeats} seats
                      </div>
                    </div>
                  </div>

                  {/* Expand button for active rides */}
                  {canExpand && (
                    <div className="px-5 pb-4 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => toggleExpand(ride.id)}
                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {t("bookings.pendingBookings")}
                        </span>
                        {bookings.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            {bookings.length} pending
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Pending Bookings */}
                  {isExpanded && (
                    <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
                      {isLoadingThis ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                          {t("common.loading")}
                        </div>
                      ) : bookings.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {t("bookings.noPendingBookings")}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-medium">
                                      {booking.rider.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{booking.rider.name}</p>
                                    {booking.rider.phone && (
                                      <p className="text-sm text-gray-500">
                                        {booking.rider.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                  {booking.seatsRequested} {booking.seatsRequested === 1 ? "seat" : "seats"}
                                </span>
                              </div>

                              {booking.message && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Message</p>
                                  <p className="text-sm text-gray-700">{booking.message}</p>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAccept(booking.id, ride.id)}
                                  disabled={processingBooking === booking.id}
                                  className="flex-1 py-2.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                  {processingBooking === booking.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      {t("common.loading")}
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      {t("bookings.accept")}
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDecline(booking.id, ride.id)}
                                  disabled={processingBooking === booking.id}
                                  className="flex-1 py-2.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
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
      </div>
    </main>
  );
}
