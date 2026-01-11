import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-warm-gradient" />
        <div className="absolute inset-0 grain" />

        {/* Decorative road illustration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-[0.03]">
          <svg viewBox="0 0 1440 128" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,64 C480,128 960,0 1440,64 L1440,128 L0,128 Z"
              fill="currentColor"
              className="text-foreground"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Status badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-sm font-medium text-foreground">
                Now live across Albania
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center space-y-6 animate-fade-in-up animation-delay-100">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-foreground text-balance">
              Share the road,
              <br />
              <span className="text-gradient">share the journey.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              Connect with travelers heading your way. Split costs, reduce emissions, and discover the beauty of Albania together.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 animate-fade-in-up animation-delay-200">
            <Link
              href="/rides"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("rides.searchRides")}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/rides/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-full font-semibold transition-all hover:bg-muted hover:border-border/80 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("rides.postRide")}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-14 animate-fade-in-up animation-delay-300">
            <TrustStat icon="users" value="2,000+" label="Active travelers" />
            <div className="hidden sm:block w-px h-8 bg-border" />
            <TrustStat icon="route" value="50+" label="Routes daily" />
            <div className="hidden sm:block w-px h-8 bg-border" />
            <TrustStat icon="leaf" value="12 tons" label="CO₂ saved" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
              How Hitch works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to your next adventure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-10">
            {[
              {
                step: "01",
                title: "Find a ride",
                desc: "Search for rides matching your route. Filter by date, time, and preferences.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                ),
                color: "from-primary/10 to-primary/5 text-primary",
              },
              {
                step: "02",
                title: "Book your seat",
                desc: "Request a seat with one tap. Chat with the driver to coordinate details.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                ),
                color: "from-secondary/10 to-secondary/5 text-secondary",
              },
              {
                step: "03",
                title: "Travel together",
                desc: "Meet at the pickup point, share the journey, and split the costs fairly.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                ),
                color: "from-success/10 to-success/5 text-success",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all hover:shadow-lg"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold tracking-wider text-muted-foreground bg-muted rounded-full">
                  {item.step}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Illustration */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square max-w-md mx-auto relative">
                {/* Background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 animate-float" />
                </div>
                <div className="absolute inset-8 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 animate-float-delayed" />
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-6.586a1.125 1.125 0 00-.263-.736L16.5 3.75H7.5l-4.012 5.078a1.125 1.125 0 00-.263.736v7.311c0 .621.504 1.125 1.125 1.125" />
                    </svg>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute top-8 right-8 px-4 py-2 bg-card border border-border rounded-xl shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💸</span>
                    <span className="font-semibold text-foreground">Save 75%</span>
                  </div>
                </div>
                <div className="absolute bottom-12 left-4 px-4 py-2 bg-card border border-border rounded-xl shadow-lg animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌱</span>
                    <span className="font-semibold text-foreground">Eco-friendly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
                  Why choose Hitch?
                </h2>
                <p className="text-lg text-muted-foreground">
                  More than just a ride—it&apos;s a smarter way to travel Albania.
                </p>
              </div>

              <div className="space-y-6">
                <BenefitItem
                  icon={
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                  title="Save up to 75% on travel costs"
                  desc="Share fuel expenses fairly and keep more money in your pocket for the journey."
                />
                <BenefitItem
                  icon={
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  }
                  title="Reduce your carbon footprint"
                  desc="Every shared ride means fewer cars on the road and cleaner air for everyone."
                />
                <BenefitItem
                  icon={
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  }
                  title="Meet interesting people"
                  desc="Turn travel time into connection. Make friends and discover local stories."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-primary-gradient" />
        <div className="absolute inset-0 grain" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-white mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Join thousands of travelers who are saving money and making connections across Albania.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-bold transition-all hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              Get started free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20" />
                  <path d="M5 10h14" className="opacity-60" />
                  <path d="M5 14h14" className="opacity-60" />
                  <path d="M5 6l7-4 7 4" />
                  <path d="M5 18l7 4 7-4" />
                </svg>
              </div>
              <span className="font-display font-semibold text-lg text-foreground">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Hitch. Made with ♥ in Albania.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Trust stat component
function TrustStat({ icon, value, label }: { icon: "users" | "route" | "leaf"; value: string; label: string }) {
  const icons = {
    users: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    ),
    route: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    ),
    leaf: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    ),
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <div>
        <div className="font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// Benefit item component
function BenefitItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
