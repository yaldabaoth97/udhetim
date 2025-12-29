import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Home() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">{t("common.appName")}</h1>
        <p className="text-xl text-muted-foreground">{t("common.tagline")}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            {t("auth.login")}
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 border border-input rounded-lg hover:bg-accent"
          >
            {t("auth.register")}
          </Link>
        </div>
      </div>
    </main>
  );
}
