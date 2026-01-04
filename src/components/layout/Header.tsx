"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathWithoutLocale = pathname.replace(/^\/(sq|en)/, "") || "/";

  function switchLocale(newLocale: "sq" | "en") {
    router.replace(pathWithoutLocale, { locale: newLocale });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg transform group-hover:rotate-3 transition-transform">
              U
            </div>
            <span
              className={`font-bold text-xl tracking-tight transition-colors ${
                scrolled ? "text-foreground" : "text-foreground"
              }`}
            >
              {t("common.appName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/rides"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t("rides.searchRides")}
            </Link>
            {status === "authenticated" && (
              <>
                <Link
                  href="/dashboard/rides"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("rides.myRides")}
                </Link>
                <Link
                  href="/bookings"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("bookings.title")}
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-muted/50 rounded-full p-1 border border-border/50">
              <button
                onClick={() => switchLocale("sq")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  locale === "sq"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                SQ
              </button>
              <button
                onClick={() => switchLocale("en")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  locale === "en"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>

            <div className="hidden md:flex items-center gap-4 pl-4 border-l border-border/50">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : status === "authenticated" ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{session?.user?.name}</span>
                  <Link
                    href="/rides/new"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    {t("rides.postRide")}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("auth.logout")}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
                  >
                    {t("auth.register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <span className="sr-only">Open menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border p-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            <Link
              href="/rides"
              className="p-3 text-sm font-medium rounded-xl hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              {t("rides.searchRides")}
            </Link>

            {status === "authenticated" && (
              <>
                <Link
                  href="/rides/new"
                  className="p-3 text-sm font-medium rounded-xl hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("rides.postRide")}
                </Link>
                <Link
                  href="/dashboard/rides"
                  className="p-3 text-sm font-medium rounded-xl hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("rides.myRides")}
                </Link>
                <Link
                  href="/bookings"
                  className="p-3 text-sm font-medium rounded-xl hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("bookings.title")}
                </Link>
                <div className="h-px bg-border my-2" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="p-3 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 text-left"
                >
                  {t("auth.logout")} ({session?.user?.name})
                </button>
              </>
            )}

            {status === "unauthenticated" && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link
                  href="/auth/login"
                  className="p-3 text-center text-sm font-medium rounded-xl bg-muted hover:bg-muted/80"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("auth.login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="p-3 text-center text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("auth.register")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
