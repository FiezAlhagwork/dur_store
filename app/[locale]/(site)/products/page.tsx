import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/i18n/config";
import ProductsPageClient from "./ProductsPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return {
    title: t("products.title"),
    description: t("products.subtitle"),
    // Deliberately not reading `searchParams` here: the `?category=` filter
    // (see ProductsGrid.tsx) stays out of the metadata on purpose, so every
    // category view canonicalizes back to this same base URL instead of
    // being treated as separate, duplicate-content pages.
    alternates: buildAlternates("/products", locale as Locale),
  };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}
