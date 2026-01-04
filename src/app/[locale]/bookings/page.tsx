"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  rideId: string;
  seatsRequested: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  paymentMethod: string;
  message: string | null;
  createdAt: string;
  ride: {
    id: string;
    originCity: string;
    destinationCity: string;
    departureTime: string;
    pricePerSeat: number;
    driver: {
      name: string;
      phone: string | null;
    };
  };
}

const statusConfig = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  ACCEPTED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  DECLINED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
};

export default function MyBookingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const showSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/bookings");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBookings();
    }
  }, [session]);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data.bookings);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          <span className="text-gray-500">{t("common.loading")}</span>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t("bookings.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your ride reservations</p>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-700 font-medium">{t("booking.success")}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{t("bookings.noBookings")}</p>
            <Link
              href="/rides"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("rides.searchRides")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isPast = new Date(booking.ride.departureTime) < new Date();
              const canCancel = booking.status === "PENDING" && !isPast;
              const totalPrice = booking.seatsRequested * booking.ride.pricePerSeat;
              const status = statusConfig[booking.status];

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-medium text-gray-900">{booking.ride.originCity}</span>
                          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium text-gray-900">{booking.ride.destinationCity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(new Date(booking.ride.departureTime))}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {t(`bookings.${booking.status.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">{t("rides.driver")}</p>
                        <p className="font-medium text-gray-900">{booking.ride.driver.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">{t("bookings.seatsRequested")}</p>
                        <p className="font-medium text-gray-900">{booking.seatsRequested}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">{t("booking.total")}</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>

                    {/* Message */}
                    {booking.message && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          {t("bookings.message")}
                        </p>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {booking.message}
                        </p>
                      </div>
                    )}

                    {/* Contact info for accepted bookings */}
                    {booking.status === "ACCEPTED" && booking.ride.driver.phone && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
                          <div>
                            <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">
                              Contact Driver
                            </p>
                            <p className="text-green-700 font-medium">{booking.ride.driver.phone}</p>
                          </div>
                          <a
                            href={`tel:${booking.ride.driver.phone}`}
                            className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <Link
                        href={`/rides/${booking.rideId}`}
                        className="flex-1 py-2.5 text-center text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        View Ride
                      </Link>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {cancellingId === booking.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              {t("common.loading")}
                            </>
                          ) : (
                            t("bookings.cancelBooking")
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
