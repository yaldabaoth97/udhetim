"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
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

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
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
        <div>{t("common.loading")}</div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("bookings.title")}</h1>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
          {t("booking.success")}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("bookings.noBookings")}</p>
          <Link
            href="/rides"
            className="text-primary hover:underline"
          >
            {t("rides.searchRides")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isPast = new Date(booking.ride.departureTime) < new Date();
            const canCancel = booking.status === "PENDING" && !isPast;
            const totalPrice = booking.seatsRequested * booking.ride.pricePerSeat;

            return (
              <div
                key={booking.id}
                className="border border-input rounded-lg overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-muted flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">
                      {booking.ride.originCity} → {booking.ride.destinationCity}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(booking.ride.departureTime))}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      statusColors[booking.status]
                    }`}
                  >
                    {t(`bookings.${booking.status.toLowerCase()}`)}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("rides.driver")}</span>
                    <span>{booking.ride.driver.name}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("bookings.seatsRequested")}</span>
                    <span>{booking.seatsRequested}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("booking.total")}</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>

                  {booking.message && (
                    <div className="pt-2 border-t border-input">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("bookings.message")}
                      </p>
                      <p className="text-sm">{booking.message}</p>
                    </div>
                  )}

                  {/* Contact info for accepted bookings */}
                  {booking.status === "ACCEPTED" && booking.ride.driver.phone && (
                    <div className="pt-2 border-t border-input">
                      <p className="text-xs text-muted-foreground mb-1">
                        Contact Driver
                      </p>
                      <a
                        href={`tel:${booking.ride.driver.phone}`}
                        className="text-primary hover:underline"
                      >
                        {booking.ride.driver.phone}
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    <Link
                      href={`/rides/${booking.rideId}`}
                      className="flex-1 py-2 text-center text-sm border border-input rounded hover:bg-muted"
                    >
                      View Ride
                    </Link>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="flex-1 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:opacity-90 disabled:opacity-50"
                      >
                        {cancellingId === booking.id
                          ? t("common.loading")
                          : t("bookings.cancelBooking")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
