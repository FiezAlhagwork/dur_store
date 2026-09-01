import type { Product } from "@/types/product";
import type { Locale } from "@/i18n/config";
import { getLocalizedName } from "@/utils/helper";
import { SITE_URL, SITE_NAME } from "./constants";

/** Sitewide brand identity — rendered once, in app/[locale]/layout.tsx. */
export function buildOrganizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME[locale],
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/logo.png`,
  };
}

/** Sitewide search-engine identity — rendered once, alongside Organization. */
export function buildWebSiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME[locale],
    url: `${SITE_URL}/${locale}`,
  };
}

/**
 * Per-product rich-result data for the product detail page. `priceCurrency`
 * is hardcoded to USD — confirmed as the only currency used anywhere in this
 * app (utils/helper.ts, lib/whatsapp.ts). `availability` reads `stock`
 * directly rather than any derived "out of stock" flag, since that is the
 * same raw field the rest of the product detail page already keys off of.
 */
export function buildProductJsonLd(product: Product, locale: Locale) {
  const isArabic = locale === "ar";
  const description =
    (isArabic ? product.description_ar : product.description_en) ?? undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: isArabic ? product.name_ar : product.name_en,
    description,
    sku: String(product.id),
    image: [...product.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.path),
    category: product.category ? getLocalizedName(product.category, locale) : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${locale}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.final_price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
}
