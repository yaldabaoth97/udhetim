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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const pathWithoutLocale = pathname.replace(/^\/(sq|en)/, "") || "/";

  function switchLocale(newLocale: "sq" | "en") {
    router.replace(pathWithoutLocale, { locale: newLocale });
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "glass border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Road icon logo */}
              <div className="relative w-9 h-9 bg-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md shadow-primary/20">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M5 10h14" className="opacity-60" />
                  <path d="M5 14h14" className="opacity-60" />
                  <path d="M5 6l7-4 7 4" />
                  <path d="M5 18l7 4 7-4" />
                </svg>
              </div>
              <span className="font-display font-semibold text-xl tracking-tight text-foreground">
                {t("common.appName")}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/rides">{t("rides.searchRides")}</NavLink>
              {status === "authenticated" && (
                <>
                  <NavLink href="/dashboard/rides">{t("rides.myRides")}</NavLink>
                  <NavLink href="/bookings">{t("bookings.title")}</NavLink>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Language switcher */}
              <div className="hidden sm:flex items-center bg-muted/60 rounded-full p-1">
                <button
                  onClick={() => switchLocale("sq")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    locale === "sq"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  SQ
                </button>
                <button
                  onClick={() => switchLocale("en")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    locale === "en"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Auth section - Desktop */}
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border/50">
                {status === "loading" ? (
                  <div className="w-8 h-8 rounded-full animate-shimmer" />
                ) : status === "authenticated" ? (
                  <div className="flex items-center gap-3">
                    {/* User avatar */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-secondary">
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {session?.user?.name?.split(" ")[0]}
                      </span>
                    </div>

                    {/* Post Ride CTA */}
                    <Link
                      href="/rides/new"
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {t("rides.postRide")}
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title={t("auth.logout")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {t("auth.login")}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                    >
                      {t("auth.register")}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-xl animate-scale-in origin-top">
            <nav className="p-4 space-y-1">
              <MobileNavLink href="/rides" onClick={() => setMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {t("rides.searchRides")}
              </MobileNavLink>

              {status === "authenticated" && (
                <>
                  <MobileNavLink href="/rides/new" onClick={() => setMenuOpen(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t("rides.postRide")}
                  </MobileNavLink>

                  <MobileNavLink href="/dashboard/rides" onClick={() => setMenuOpen(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V9.75M18.75 18.75V9.75m0 0a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25m15.75 0h.75" />
                    </svg>
                    {t("rides.myRides")}
                  </MobileNavLink>

                  <MobileNavLink href="/bookings" onClick={() => setMenuOpen(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                    {t("bookings.title")}
                  </MobileNavLink>

                  <div className="h-px bg-border my-3" />

                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <span className="text-base font-semibold text-secondary">
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{session?.user?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      {t("auth.logout")}
                    </button>
                  </div>
                </>
              )}

              {status === "unauthenticated" && (
                <>
                  <div className="h-px bg-border my-3" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      href="/auth/login"
                      className="py-3 text-center text-sm font-medium rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("auth.login")}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="py-3 text-center text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("auth.register")}
                    </Link>
                  </div>
                </>
              )}

              {/* Language switcher for mobile */}
              <div className="flex items-center justify-center gap-2 pt-4 sm:hidden">
                <button
                  onClick={() => switchLocale("sq")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    locale === "sq"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Shqip
                </button>
                <button
                  onClick={() => switchLocale("en")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    locale === "en"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  English
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// Desktop nav link component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "text-primary bg-primary/5"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile nav link component
function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-colors ${
        isActive
          ? "text-primary bg-primary/5"
          : "text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
