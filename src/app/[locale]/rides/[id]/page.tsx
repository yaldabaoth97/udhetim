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
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          <span className="text-gray-500">{t("common.loading")}</span>
        </div>
      </main>
    );
  }

  if (error || !ride) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600">{error || t("errors.notFound")}</p>
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

  const isCancelled = ride.status === "CANCELLED";
  const isPast = new Date(ride.departureTime) < new Date();

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/rides"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("common.back")}
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          {/* Header section */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              {/* Route info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-gray-900">{ride.originCity}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium text-gray-900">{ride.destinationCity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{formatDate(new Date(ride.departureTime))}</span>
                </div>
              </div>

              {/* Price badge */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-center sm:text-right">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(ride.pricePerSeat)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{t("rides.pricePerSeat")}</div>
              </div>
            </div>

            {/* Status badges */}
            {(isCancelled || isPast) && (
              <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isCancelled
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isCancelled ? "bg-red-500" : "bg-gray-400"}`} />
                {isCancelled ? t("rides.rideCancelled") : t("rides.departed")}
              </div>
            )}
          </div>

          {/* Details section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Driver info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-gray-100">
                <span className="text-primary font-semibold text-lg">
                  {ride.driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t("rides.driver")}</p>
                <p className="font-medium text-gray-900">{ride.driver.name}</p>
                {ride.driver.phone && (
                  <a
                    href={`tel:${ride.driver.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {ride.driver.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Seats info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t("rides.seats")}</p>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {ride.availableSeats} {t("rides.available")}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {ride.totalSeats} {t("rides.total")}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes section */}
            {ride.notes && (
              <>
                <div className="border-t border-gray-100" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t("rides.notes")}</p>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-4">
                    {ride.notes}
                  </p>
                </div>
              </>
            )}

            {/* Action buttons */}
            {!isCancelled && !isPast && (
              <>
                <div className="border-t border-gray-100" />
                <div className="pt-2">
                  {isDriver ? (
                    <div className="flex gap-3">
                      <Link
                        href={`/rides/${ride.id}/edit`}
                        className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        {t("common.edit")}
                      </Link>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 py-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancelling ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t("common.loading")}
                          </span>
                        ) : (
                          t("common.cancel")
                        )}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={`/rides/${ride.id}/book`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm hover:shadow transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("rides.book")} · {formatCurrency(ride.pricePerSeat)}
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
