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
    phone: string | null;
  };
}

export default function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const isDriver = session?.user?.id === ride?.driverId;

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

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this ride?")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/rides/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to cancel ride");
      }
      router.push("/rides");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>{t("common.loading")}</div>
      </main>
    );
  }

  if (error || !ride) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || t("errors.notFound")}</p>
          <Link href="/rides" className="text-primary hover:underline">
            {t("common.back")}
          </Link>
        </div>
      </main>
    );
  }

  const isCancelled = ride.status === "CANCELLED";
  const isPast = new Date(ride.departureTime) < new Date();

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/rides"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t("common.back")}
        </Link>
      </div>

      <div className="border border-input rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-muted">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {ride.originCity} → {ride.destinationCity}
              </h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(new Date(ride.departureTime))}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(ride.pricePerSeat)}
              </div>
              <div className="text-sm text-muted-foreground">per seat</div>
            </div>
          </div>

          {(isCancelled || isPast) && (
            <div className={`mt-4 px-3 py-2 rounded-lg text-sm ${
              isCancelled ? "bg-destructive/10 text-destructive" : "bg-muted-foreground/10"
            }`}>
              {isCancelled ? t("rides.rideCancelled") : "This ride has already departed"}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          {/* Driver Info */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              {t("rides.driver")}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">
                  {ride.driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{ride.driver.name}</p>
                {ride.driver.phone && (
                  <p className="text-sm text-muted-foreground">{ride.driver.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seats */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              {t("rides.seats")}
            </h2>
            <p className="text-lg">
              {ride.availableSeats} / {ride.totalSeats} available
            </p>
          </div>

          {/* Notes */}
          {ride.notes && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                {t("rides.notes")}
              </h2>
              <p className="text-muted-foreground">{ride.notes}</p>
            </div>
          )}

          {/* Actions */}
          {!isCancelled && !isPast && (
            <div className="pt-4 border-t border-input">
              {isDriver ? (
                <div className="flex gap-3">
                  <Link
                    href={`/rides/${ride.id}/edit`}
                    className="flex-1 py-3 text-center border border-input rounded-lg hover:bg-muted"
                  >
                    {t("common.edit")}
                  </Link>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {cancelling ? t("common.loading") : t("common.cancel")}
                  </button>
                </div>
              ) : (
                <Link
                  href={`/rides/${ride.id}/book`}
                  className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  {t("rides.book")} - {formatCurrency(ride.pricePerSeat)}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
