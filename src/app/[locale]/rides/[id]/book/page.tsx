"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
        <div>{t("common.loading")}</div>
      </main>
    );
  }

  if (!session) {
    return null; // Redirecting to login
  }

  if (error && !ride) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/rides" className="text-primary hover:underline">
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
      <main className="min-h-screen p-4 max-w-md mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {isDriver && "You cannot book your own ride"}
            {isCancelled && "This ride has been cancelled"}
            {isPast && "This ride has already departed"}
            {noSeats && "No seats available"}
          </p>
          <Link href={`/rides/${id}`} className="text-primary hover:underline">
            {t("common.back")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <div className="mb-6">
        <Link
          href={`/rides/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t("common.back")}
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{t("booking.title")}</h1>
      <p className="text-muted-foreground mb-6">
        {ride.originCity} → {ride.destinationCity}
      </p>

      {/* Ride Summary */}
      <div className="border border-input rounded-lg p-4 mb-6 bg-muted/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">{t("rides.departure")}</span>
          <span className="font-medium">{formatDate(new Date(ride.departureTime))}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">{t("rides.driver")}</span>
          <span className="font-medium">{ride.driver.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t("rides.available")}</span>
          <span className="font-medium">{ride.availableSeats} {t("rides.seats")}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seats Selection */}
        <div>
          <label htmlFor="seats" className="block text-sm font-medium mb-2">
            {t("booking.seats")}
          </label>
          <select
            id="seats"
            value={seatsRequested}
            onChange={(e) => setSeatsRequested(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          >
            {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "seat" : "seats"}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            {t("booking.message")} <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("booking.messagePlaceholder")}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{message.length}/500</p>
        </div>

        {/* Price Summary */}
        <div className="border-t border-input pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">
              {seatsRequested} × {formatCurrency(ride.pricePerSeat)}
            </span>
            <span className="font-medium">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>{t("booking.total")}</span>
            <span className="text-primary">{formatCurrency(totalPrice)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("booking.paymentNote")}</p>
        </div>

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? t("common.loading") : t("booking.submit")}
        </button>
      </form>
    </main>
  );
}
