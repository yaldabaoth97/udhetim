"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Ride {
  id: string;
  driverId: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  notes: string | null;
  status: string;
  driver: {
    id: string;
    name: string;
  };
}

export default function BookRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [seatsRequested, setSeatsRequested] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/rides/${id}/book`);
    }
  }, [authStatus, router, id]);

  useEffect(() => {
    fetchRide();
  }, [id]);

  async function fetchRide() {
    try {
      const res = await fetch(`/api/rides/${id}`);
      if (!res.ok) {
        throw new Error("Ride not found");
      }
      const data = await res.json();
      setRide(data.ride);
    } catch {
      setError(t("errors.notFound"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId: id,
          seatsRequested,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Redirect to bookings page with success message
      router.push("/bookings?success=true");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
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
    return null; // Redirecting to login
  }

  if (error && !ride) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <Link
            href="/rides"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("common.back")}
          </Link>
        </div>
      </main>
    );
  }

  if (!ride) return null;

  const isDriver = session.user?.id === ride.driverId;
  const isCancelled = ride.status === "CANCELLED";
  const isPast = new Date(ride.departureTime) < new Date();
  const noSeats = ride.availableSeats === 0;
  const canBook = !isDriver && !isCancelled && !isPast && !noSeats;

  const totalPrice = seatsRequested * ride.pricePerSeat;

  if (!canBook) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <p className="text-gray-600">
            {isDriver && "You cannot book your own ride"}
            {isCancelled && "This ride has been cancelled"}
            {isPast && "This ride has already departed"}
            {noSeats && "No seats available"}
          </p>
          <Link
            href={`/rides/${id}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("common.back")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/rides/${id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("common.back")}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{t("booking.title")}</h1>
        </div>

        {/* Ride Summary Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
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
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(new Date(ride.departureTime))}</span>
            </div>
          </div>
          <div className="p-5 bg-gray-50 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{t("rides.driver")}</span>
              <span className="font-medium text-gray-900">{ride.driver.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{t("rides.available")}</span>
              <span className="font-medium text-gray-900">{ride.availableSeats} {t("rides.seats")}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seats Selection */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-5">
            <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-3">
              {t("booking.seats")}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
                disabled={seatsRequested <= 1}
                className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-semibold text-gray-900">{seatsRequested}</span>
                <p className="text-xs text-gray-500 mt-1">{seatsRequested === 1 ? "seat" : "seats"}</p>
              </div>
              <button
                type="button"
                onClick={() => setSeatsRequested(Math.min(ride.availableSeats, seatsRequested + 1))}
                disabled={seatsRequested >= ride.availableSeats}
                className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-5">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {t("booking.message")}
            </label>
            <p className="text-xs text-gray-500 mb-3">{t("booking.messagePlaceholder")}</p>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message here..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{message.length}/500</p>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {seatsRequested} × {formatCurrency(ride.pricePerSeat)}
                </span>
                <span className="font-medium text-gray-900">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-900">{t("booking.total")}</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t("booking.paymentNote")}</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t("booking.submit")} · {formatCurrency(totalPrice)}
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
