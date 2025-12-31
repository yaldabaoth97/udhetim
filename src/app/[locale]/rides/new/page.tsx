"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export default function NewRidePage() {
  const t = useTranslations();
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          <Link
            href="/auth/login"
            className="text-primary hover:underline"
          >
            {t("auth.login")}
          </Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      originCity: formData.get("originCity") as string,
      destinationCity: formData.get("destinationCity") as string,
      departureTime: formData.get("departureTime") as string,
      pricePerSeat: parseInt(formData.get("pricePerSeat") as string, 10),
      totalSeats: parseInt(formData.get("totalSeats") as string, 10),
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create ride");
      }

      router.push("/rides");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  // Set minimum datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/rides"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t("common.back")}
        </Link>
        <h1 className="text-2xl font-bold mt-2">{t("rides.postRide")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="originCity" className="block text-sm font-medium">
              {t("rides.origin")}
            </label>
            <input
              id="originCity"
              name="originCity"
              type="text"
              required
              placeholder="Tiranë"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="destinationCity" className="block text-sm font-medium">
              {t("rides.destination")}
            </label>
            <input
              id="destinationCity"
              name="destinationCity"
              type="text"
              required
              placeholder="Durrës"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="departureTime" className="block text-sm font-medium">
            {t("rides.departureTime")}
          </label>
          <input
            id="departureTime"
            name="departureTime"
            type="datetime-local"
            required
            min={minDateTime}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="pricePerSeat" className="block text-sm font-medium">
              {t("rides.price")} ({t("rides.currency")})
            </label>
            <input
              id="pricePerSeat"
              name="pricePerSeat"
              type="number"
              required
              min="0"
              step="100"
              placeholder="500"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="totalSeats" className="block text-sm font-medium">
              {t("rides.totalSeats")}
            </label>
            <input
              id="totalSeats"
              name="totalSeats"
              type="number"
              required
              min="1"
              max="8"
              defaultValue="3"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium">
            {t("rides.notes")} <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="E.g., pickup location details, luggage space, etc."
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("rides.postRide")}
        </button>
      </form>
    </main>
  );
}
