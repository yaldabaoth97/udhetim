"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  // Get the path without locale prefix for language switching
  const pathWithoutLocale = pathname.replace(/^\/(sq|en)/, "") || "/";

  function switchLocale(newLocale: "sq" | "en") {
    // Use the next-intl router which handles locale switching
    router.replace(pathWithoutLocale, { locale: newLocale });
  }

  return (
    <header className="border-b border-input bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-primary">
            {t("common.appName")}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/rides"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("rides.searchRides")}
            </Link>
            {status === "authenticated" && (
              <>
                <Link
                  href="/rides/new"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("rides.postRide")}
                </Link>
                <Link
                  href="/dashboard/rides"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("rides.myRides")}
                </Link>
                <Link
                  href="/bookings"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("bookings.title")}
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("dashboard.title")}
                </Link>
              </>
            )}
          </nav>

          {/* Right side: Auth + Language */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center border border-input rounded-lg overflow-hidden text-sm">
              <button
                onClick={() => switchLocale("sq")}
                className={`px-2 py-1 ${
                  locale === "sq"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                SQ
              </button>
              <button
                onClick={() => switchLocale("en")}
                className={`px-2 py-1 ${
                  locale === "en"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                EN
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {status === "loading" ? (
                <span className="text-sm text-muted-foreground">...</span>
              ) : status === "authenticated" ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {session?.user?.name}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("auth.logout")}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                  >
                    {t("auth.register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-input">
            <nav className="flex flex-col gap-3">
              <Link
                href="/rides"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {t("rides.searchRides")}
              </Link>
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/rides/new"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("rides.postRide")}
                  </Link>
                  <Link
                    href="/dashboard/rides"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("rides.myRides")}
                  </Link>
                  <Link
                    href="/bookings"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("bookings.title")}
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("dashboard.title")}
                  </Link>
                  <div className="pt-3 border-t border-input">
                    <span className="text-sm text-muted-foreground">
                      {session?.user?.name}
                    </span>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block mt-2 text-sm text-destructive"
                    >
                      {t("auth.logout")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 border-t border-input flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("auth.register")}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
