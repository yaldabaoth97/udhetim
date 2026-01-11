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
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20" />
                <path d="M5 10h14" className="opacity-60" />
                <path d="M5 14h14" className="opacity-60" />
                <path d="M5 6l7-4 7 4" />
                <path d="M5 18l7 4 7-4" />
              </svg>
            </div>
            <span className="font-display font-semibold text-2xl text-foreground">
              {t("common.appName")}
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
              Join the journey
            </h1>
            <p className="text-muted-foreground">
              Create your account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                {t("auth.name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
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
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  Create account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
