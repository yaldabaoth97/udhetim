"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

interface Ride {
  id: string;
  driverId: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  pricePerSeat: number;
  totalSeats: number;
  notes: string | null;
}

export default function EditRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRide();
  }, [id]);

  async function fetchRide() {
    try {
      const res = await fetch(`/api/rides/${id}`);
      if (!res.ok) throw new Error("Ride not found");
      const data = await res.json();
      setRide(data.ride);
    } catch {
      setError(t("errors.notFound"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

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
      const res = await fetch(`/api/rides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update ride");
      }

      router.push(`/rides/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>{t("common.loading")}</div>
      </main>
    );
  }

  if (!ride || error) {
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

  // Check if user is the driver
  if (session?.user?.id !== ride.driverId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4">{t("errors.unauthorized")}</p>
          <Link href={`/rides/${id}`} className="text-primary hover:underline">
            {t("common.back")}
          </Link>
        </div>
      </main>
    );
  }

  // Format datetime for input
  const departureDate = new Date(ride.departureTime);
  departureDate.setMinutes(departureDate.getMinutes() - departureDate.getTimezoneOffset());
  const formattedDeparture = departureDate.toISOString().slice(0, 16);

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/rides/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t("common.back")}
        </Link>
        <h1 className="text-2xl font-bold mt-2">{t("common.edit")} Ride</h1>
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
              defaultValue={ride.originCity}
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
              defaultValue={ride.destinationCity}
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
            defaultValue={formattedDeparture}
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
              defaultValue={ride.pricePerSeat}
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
              defaultValue={ride.totalSeats}
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
            defaultValue={ride.notes || ""}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href={`/rides/${id}`}
            className="flex-1 py-3 text-center border border-input rounded-lg hover:bg-muted"
          >
            {t("common.cancel")}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </form>
    </main>
  );
}
