import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Header } from "@/components/layout/Header";
import "../globals.css";

export const metadata: Metadata = {
  title: "Hitch - Share the Journey",
  description: "Connect with travelers heading your way. Share rides, split costs, and discover Albania together.",
  keywords: ["rideshare", "Albania", "carpooling", "travel", "Tirana", "Durres", "Vlora"],
  authors: [{ name: "Hitch" }],
  openGraph: {
    title: "Hitch - Share the Journey",
    description: "Connect with travelers heading your way. Share rides, split costs, and discover Albania together.",
    type: "website",
    locale: "en_US",
    alternateLocale: "sq_AL",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D4654A",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "sq" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DM Sans - Clean geometric body font */}
        {/* Fraunces - Distinctive display serif with optical sizing */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <div className="pt-16 sm:pt-20">
              {children}
            </div>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
