import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/constants";

/**
 * Mirrors the `robots: { index: false, follow: false }` already set on each
 * private route's own metadata ((admin)/layout.tsx, login, register,
 * sso-callback, redirect-after-login) — this is the standard extra layer on
 * top of that, not a replacement for it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/dashboard",
        "/*/login",
        "/*/register",
        "/*/sso-callback",
        "/*/redirect-after-login",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
