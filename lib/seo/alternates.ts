import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Builds `alternates` (canonical + hreflang) for a page.
 *
 * `path` is the route WITHOUT a locale prefix — `""` for the home page,
 * `"/products"` for the listing, `` `/products/${slug}` `` for a product.
 * Every value returned here is a relative path; Next.js resolves it against
 * `metadataBase` (set once in app/layout.tsx) into an absolute URL, so this
 * file never needs to know the domain itself.
 *
 * Every indexable page should call this with its own path so the `ar`/`en`
 * versions of that same page are linked for search engines (`hreflang`) and
 * so query-string variants of a page (e.g. `/products?category=x`) collapse
 * back to one canonical URL instead of being treated as duplicate content.
 */
export function buildAlternates(path: string, locale: Locale): Metadata["alternates"] {
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}${path}`]));

  return {
    canonical: `/${locale}${path}`,
    languages: { ...languages, "x-default": `/${defaultLocale}${path}` },
  };
}
