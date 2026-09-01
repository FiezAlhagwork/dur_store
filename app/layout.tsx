import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { SITE_URL } from "@/lib/seo/constants";
import "./globals.css";

const thmanyahSans = localFont({
  src: [
    { path: "../public/fonts/thmanyahsans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/thmanyahsans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/thmanyahsans-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/thmanyahsans-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-thmanyah-sans",
  display: "swap",
});

const thmanyahSerifDisplay = localFont({
  src: [
    { path: "../public/fonts/thmanyahserifdisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/thmanyahserifdisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/thmanyahserifdisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/thmanyahserifdisplay-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-thmanyah-serif-display",
  display: "swap",
});

const thmanyahSerifText = localFont({
  src: [
    { path: "../public/fonts/thmanyahseriftext-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/thmanyahseriftext-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/thmanyahseriftext-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/thmanyahseriftext-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-thmanyah-serif-text",
  display: "swap",
});

export const metadata: Metadata = {
  // `/` (this layout's only reachable route with no [locale] segment) does an
  // immediate server redirect to the default locale, so this title/description
  // is never actually shown — it's a fallback safety net for whatever gets to
  // read the response before that redirect, not dead code to skip fixing.
  title: "دُرّ | متجر مجوهرات",
  description: "اكتشف تشكيلتنا من المجوهرات الفاخرة",
  /*
   * Base for URL-based metadata fields that use a relative path (e.g. the
   * openGraph.images "/dur.jpg" set in app/[locale]/layout.tsx, or the
   * alternates built by lib/seo/alternates.ts) — Next.js throws a build error
   * resolving a relative metadata URL without one.
   */
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/logo.png", media: "(prefers-color-scheme: light)" },
      { url: "/logo-light.png", media: "(prefers-color-scheme: dark)" },
    ],
    // iOS doesn't switch this by appearance mode, so just one variant.
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `signInUrl`/`signUpUrl` point Clerk at our own pages. Without them,
    // any redirect Clerk initiates itself falls back to its hosted Account
    // Portal, which drops the user out of our custom bilingual UI. Clerk
    // takes a single static string here and this layout sits above the
    // [locale] segment, so these use the default locale (see i18n/config.ts);
    // it is only a fallback — the auth flow itself always builds
    // locale-correct URLs from the active language.
    <ClerkProvider signInUrl="/ar/login" signUpUrl="/ar/register">
      <html
        lang="ar"
        suppressHydrationWarning
        className={`h-full antialiased ${thmanyahSans.variable} ${thmanyahSerifDisplay.variable} ${thmanyahSerifText.variable}`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}




