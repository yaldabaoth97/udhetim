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
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <span className="text-muted-foreground font-medium">{t("common.loading")}</span>
        </div>
      </main>
    );
  }

  if (error || !ride) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Ride not found</h2>
            <p className="text-muted-foreground">{error || t("errors.notFound")}</p>
          </div>
          <Link
            href="/rides"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to rides
          </Link>
        </div>
      </main>
    );
  }

  const isCancelled = ride.status === "CANCELLED";
  const isPast = new Date(ride.departureTime) < new Date();

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/rides"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t("common.back")}
        </Link>

        {/* Main card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden animate-fade-in-up">
          {/* Header section with route */}
          <div className="p-6 sm:p-8 border-b border-border">
            {/* Status badge if cancelled or past */}
            {(isCancelled || isPast) && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
                isCancelled
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}>
                <div className={`w-2 h-2 rounded-full ${isCancelled ? "bg-destructive" : "bg-muted-foreground"}`} />
                {isCancelled ? t("rides.rideCancelled") : t("rides.departed")}
              </div>
            )}

            {/* Route visualization */}
            <div className="flex items-start gap-5 mb-6">
              {/* Route dots and line */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-success" />
                <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Cities and time */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="text-2xl font-bold text-foreground">{ride.originCity}</div>
                  <div className="text-sm text-muted-foreground mt-1">Departure</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{ride.destinationCity}</div>
                  <div className="text-sm text-muted-foreground mt-1">Arrival</div>
                </div>
              </div>
            </div>

            {/* Date and time badge */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {formatDate(new Date(ride.departureTime))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Departure at {new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>

          {/* Details section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Driver info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-secondary">
                  {ride.driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("rides.driver")}</div>
                <div className="font-semibold text-foreground text-lg">{ride.driver.name}</div>
                {ride.driver.phone && (
                  <a
                    href={`tel:${ride.driver.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {ride.driver.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Seats and price row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Seats */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">{t("rides.seats")}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{ride.availableSeats}</span>
                  <span className="text-sm text-muted-foreground">of {ride.totalSeats} available</span>
                </div>
              </div>

              {/* Price */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                  <span className="text-sm text-primary">{t("rides.pricePerSeat")}</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(ride.pricePerSeat)}
                </div>
              </div>
            </div>

            {/* Notes section */}
            {ride.notes && (
              <>
                <div className="h-px bg-border" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{t("rides.notes")}</div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-foreground leading-relaxed">{ride.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Action buttons */}
            {!isCancelled && !isPast && (
              <>
                <div className="h-px bg-border" />
                <div className="pt-2">
                  {isDriver ? (
                    <div className="flex gap-3">
                      <Link
                        href={`/rides/${ride.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-foreground bg-muted border border-border rounded-xl hover:bg-muted/80 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {t("common.edit")}
                      </Link>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-destructive-foreground bg-destructive rounded-xl hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancelling ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t("common.loading")}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t("common.cancel")}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={`/rides/${ride.id}/book`}
                      className="flex items-center justify-center gap-2 w-full py-4 text-base font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
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
