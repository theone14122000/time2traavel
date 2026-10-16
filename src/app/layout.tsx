import type { Metadata } from "next";
import Script from "next/script";
import {
  Caveat,
  Caveat_Brush,
  Fraunces,
  Inter,
  Kaushan_Script,
  Kalam,
  Noto_Sans_Devanagari,
  Nunito,
  Pacifico,
  Yellowtail,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CommandPaletteProvider } from "@/components/ui/command-palette";
import { CookieConsent } from "@/components/ui/cookie-consent";
// `ssr: false` must live inside a Client Component (Next 16 rejects it in a
// Server Component), so the dynamic import comes from this client wrapper.
import { FloatingContactButtons } from "@/components/layout/floating-contact-buttons-loader";
import { MotionProvider } from "@/components/shared/lazy-motion";
import { getSiteSettings } from "@/lib/data/site";
import { SITE_IDENTITY } from "@/lib/constants";
import { fontThemeClass } from "@/lib/font-theme";
/* ---------------------------------------------------------------
   Font themes (Site settings → Font theme).
   Only the active theme's families are actually used on the page,
   so the browser downloads just that pair + the body font.
   Just the default theme's display face is preloaded (spec).
   --------------------------------------------------------------- */

// Theme A — Journal (default)
const kaushan = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true, // display font only — spec: preload the display font
  variable: "--font-kaushan",
});
const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-caveat-brush",
});
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-nunito",
});

// Theme B — Retro Postcard
const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-pacifico",
});
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-caveat",
});

// Theme C — Elegant
const yellowtail = Yellowtail({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-yellowtail",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  style: "italic",
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

// Hindi / Devanagari pair (EN/HI toggle ready)
const kalam = Kalam({
  weight: "400",
  subsets: ["latin", "devanagari"],
  display: "swap",
  preload: false,
  variable: "--font-kalam",
});
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["latin", "devanagari"],
  display: "swap",
  preload: false,
  variable: "--font-noto-devanagari",
});

const fontVariables = [
  kaushan.variable,
  caveatBrush.variable,
  nunito.variable,
  pacifico.variable,
  caveat.variable,
  yellowtail.variable,
  fraunces.variable,
  inter.variable,
  kalam.variable,
  notoDevanagari.variable,
].join(" ");

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
  themeColor: "#FFFAF0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${fontVariables} ${fontThemeClass(settings.fontTheme)}`}
    >
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <Toaster />
        <MotionProvider>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </MotionProvider>
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
