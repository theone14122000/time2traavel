import type { Metadata } from "next";
import Script from "next/script";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CommandPaletteProvider } from "@/components/ui/command-palette";
import { CookieConsent } from "@/components/ui/cookie-consent";
// `ssr: false` must live inside a Client Component (Next 16 rejects it in a
// Server Component), so the dynamic import comes from this client wrapper.
import { FloatingContactButtons } from "@/components/layout/floating-contact-buttons-loader";
import { getSiteSettings } from "@/lib/data/site";
import { SITE_IDENTITY } from "@/lib/constants";

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${SITE_IDENTITY.name} — Travel Agency in Shimla`,
    template: `%s · ${SITE_IDENTITY.name}`,
  },
  description: `${SITE_IDENTITY.name} — travel planning from ${SITE_IDENTITY.address}.`,
  applicationName: SITE_IDENTITY.name,
  category: "travel",
  manifest: "/manifest.webmanifest",
};

// `themeColor` lives on `viewport` (the `metadata.themeColor` field is
// deprecated since Next 14) and matches the manifest's theme_color.
export const viewport = {
  themeColor: "#FFE45E",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <Toaster />
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
        <CookieConsent />
        <FloatingContactButtons
          whatsapp={settings.whatsapp}
          email={settings.email}
        />
        {process.env.NODE_ENV === "production" ? (
          <Script
            id="tt-sw-register"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html:
                'if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}',
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
