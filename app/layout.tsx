import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studi Aperti — Artists & Studios of Upper Tiber Valley",
  description:
    "Discover artists and open studios in the Upper Tiber Valley, Umbria, Italy. Browse the interactive map and find local ceramics, painting, sculpture, and more.",
  openGraph: {
    title: "Studi Aperti — Artists & Studios of Upper Tiber Valley",
    description:
      "Discover artists and open studios in the Upper Tiber Valley, Umbria, Italy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
