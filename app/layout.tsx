import "./globals.css";

// Root layout is a minimal pass-through.
// The locale layout (app/[locale]/layout.tsx) sets <html lang> and wraps with NextIntlClientProvider.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
