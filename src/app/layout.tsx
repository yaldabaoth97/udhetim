// This is a minimal root layout that redirects to locale-specific routes
// The actual app layout is in [locale]/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
