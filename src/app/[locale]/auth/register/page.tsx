"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

function formatPhoneNumber(value: string): string {
  // Check if user is typing an international number (starts with + or 00)
  const isInternational = value.startsWith("+") || value.startsWith("00");

  // Remove all non-digits except leading +
  const hasPlus = value.startsWith("+");
  const digits = value.replace(/\D/g, "");

  if (!digits) return hasPlus ? "+" : "";

  // If starts with 00, treat as international (replace 00 with nothing, we'll add +)
  const cleanDigits = digits.startsWith("00") ? digits.slice(2) : digits;

  if (isInternational || cleanDigits.startsWith("355")) {
    // International format: +XX XXX XXX XXXX (flexible grouping)
    const limited = cleanDigits.slice(0, 15); // Max 15 digits for international

    let formatted = "+";
    if (limited.length <= 3) {
      formatted += limited;
    } else if (limited.length <= 6) {
      formatted += `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else if (limited.length <= 9) {
      formatted += `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else {
      formatted += `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9)}`;
    }
    return formatted;
  }

  // Default: Albanian format +355 6X XXX XXXX
  // Remove leading 0 if present
  const cleaned = cleanDigits.startsWith("0") ? cleanDigits.slice(1) : cleanDigits;
  const limited = cleaned.slice(0, 9);

  if (!limited) return "";

  let formatted = "+355 ";
  if (limited.length <= 2) {
    formatted += limited;
  } else if (limited.length <= 5) {
    formatted += `${limited.slice(0, 2)} ${limited.slice(2)}`;
  } else {
    formatted += `${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5)}`;
  }

  return formatted;
}

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t("common.error"));
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but login failed - redirect to login
        router.push("/auth/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("auth.register")}</h1>
          <p className="mt-2 text-muted-foreground">{t("common.tagline")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              {t("auth.name")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              {t("auth.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              {t("auth.phone")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+355 6X XXX XXXX"
              autoComplete="tel"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              {t("auth.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.register")}
          </button>
        </form>

        <p className="text-center text-sm">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
