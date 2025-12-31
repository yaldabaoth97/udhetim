"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface TopRoute {
  originCity: string;
  destinationCity: string;
  searchCount: number;
}

interface UnderservedRoute extends TopRoute {
  availableRides: number;
}

interface AnalyticsData {
  topRoutes: TopRoute[];
  underservedRoutes: UnderservedRoute[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export default function AnalyticsDashboardPage() {
  const t = useTranslations();
  const { status } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, days]);

  async function fetchAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/routes?days=${days}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const result = await res.json();
      setData(result);
    } catch {
      setError(t("common.error"));
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
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <Link
          href="/rides/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {t("rides.postRide")}
        </Link>
      </div>

      {/* Time Period Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setDays(7)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            days === 7
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {t("dashboard.last7Days")}
        </button>
        <button
          onClick={() => setDays(30)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            days === 30
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {t("dashboard.last30Days")}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">{t("common.loading")}</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : data ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Routes */}
          <div className="border border-input rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-input">
              <h2 className="font-semibold">{t("dashboard.topRoutes")}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Most searched destinations
              </p>
            </div>
            <div className="p-4">
              {data.topRoutes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No search data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {data.topRoutes.map((route, index) => (
                    <div
                      key={`${route.originCity}-${route.destinationCity}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">
                          {route.originCity} → {route.destinationCity}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {route.searchCount} {t("dashboard.searchCount").toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Underserved Routes */}
          <div className="border border-input rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-input">
              <h2 className="font-semibold">{t("dashboard.underservedRoutes")}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                High demand, low supply - opportunity!
              </p>
            </div>
            <div className="p-4">
              {data.underservedRoutes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  All routes have good coverage
                </p>
              ) : (
                <div className="space-y-3">
                  {data.underservedRoutes.map((route, index) => (
                    <div
                      key={`${route.originCity}-${route.destinationCity}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-sm">
                            {route.originCity} → {route.destinationCity}
                          </span>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>{route.searchCount} searches</span>
                            <span>•</span>
                            <span className="text-yellow-600">
                              {route.availableRides} rides available
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/rides/new?origin=${encodeURIComponent(route.originCity)}&destination=${encodeURIComponent(route.destinationCity)}`}
                        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90"
                      >
                        Post Ride
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Links */}
      <div className="mt-8 pt-6 border-t border-input">
        <h3 className="font-medium mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/rides"
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm"
          >
            {t("rides.myRides")}
          </Link>
          <Link
            href="/rides/new"
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm"
          >
            {t("rides.postRide")}
          </Link>
          <Link
            href="/rides"
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm"
          >
            {t("rides.searchRides")}
          </Link>
        </div>
      </div>
    </main>
  );
}
