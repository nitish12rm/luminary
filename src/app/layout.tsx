import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luminary — Our Journey",
  description: "Your love story, beautifully told.",
  keywords: ["love story", "couple", "timeline", "memories"],
  authors: [{ name: "Luminary" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Luminary",
  },
  openGraph: {
    title: "Luminary — Our Journey",
    description: "A beautiful timeline of your love story.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e8789a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="blush" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <PWAInstallBanner />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              backdropFilter: "blur(12px)",
              borderRadius: "12px",
              fontSize: "0.9rem",
              fontFamily: "var(--font-ui)",
            },
          }}
        />
      </body>
    </html>
  );
}
