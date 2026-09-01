/**
 * Single source of truth for the site's canonical URL and display name, used
 * by `metadataBase` (app/layout.tsx), the sitemap/robots route handlers, and
 * every JSON-LD builder in this directory — so the domain is never typed out
 * more than once.
 */
export const SITE_URL = "https://durjewels.com";

export const SITE_NAME = {
  ar: "دُرّ",
  en: "Dur Store",
} as const;
