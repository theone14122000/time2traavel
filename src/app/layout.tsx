import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CommandPaletteProvider } from "@/components/ui/command-palette";
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
};

export const viewport = {
  themeColor: "#fffdf5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <Toaster />
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </body>
    </html>
  );
}
