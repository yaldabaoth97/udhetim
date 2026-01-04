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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-gray-500">Insights to help you find the best routes</p>
          </div>
          <Link
            href="/rides/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("rides.postRide")}
          </Link>
        </div>

        {/* Time Period Filter */}
        <div className="mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Time Period</p>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                days === 7
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("dashboard.last7Days")}
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                days === 30
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("dashboard.last30Days")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
              <span className="text-gray-500">{t("common.loading")}</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Routes Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{t("dashboard.topRoutes")}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Most searched destinations</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {data.topRoutes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No search data yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.topRoutes.map((route, index) => (
                      <div
                        key={`${route.originCity}-${route.destinationCity}`}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold ${
                            index === 0
                              ? "bg-primary text-white"
                              : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : index === 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-sm text-gray-700">{route.originCity}</span>
                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-sm text-gray-700">{route.destinationCity}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          {route.searchCount} {t("dashboard.searchCount").toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Underserved Routes Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{t("dashboard.underservedRoutes")}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">High demand, low supply — opportunity!</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {data.underservedRoutes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">All routes have good coverage</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.underservedRoutes.map((route, index) => (
                      <div
                        key={`${route.originCity}-${route.destinationCity}`}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-semibold">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-sm text-gray-700">{route.originCity}</span>
                              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-sm text-gray-700">{route.destinationCity}</span>
                            </div>
                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                              <span>{route.searchCount} searches</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-amber-600 font-medium">
                                {route.availableRides} rides available
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/rides/new?origin=${encodeURIComponent(route.originCity)}&destination=${encodeURIComponent(route.destinationCity)}`}
                          className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
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

        {/* Quick Actions */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/rides"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {t("rides.myRides")}
            </Link>
            <Link
              href="/rides/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              {t("rides.postRide")}
            </Link>
            <Link
              href="/rides"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("rides.searchRides")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
