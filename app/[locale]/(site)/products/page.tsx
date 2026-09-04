import type { Metadata, ResolvingMetadata } from "next";
import { getTranslation } from "@/i18n/request";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/i18n/config";
import ProductsPageClient from "./ProductsPageClient";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: string }>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);
  const title = t("products.title");
  const description = t("products.subtitle");

  // Object-valued fields like `openGraph` are replaced wholesale, not
  // deep-merged, once a route sets its own (see the identical note on
  // products/[id]/page.tsx) — so setting `openGraph` here without carrying
  // `previousOpenGraph` forward would silently drop siteName/type/locale/url.
  // This page was previously missing `openGraph` entirely, which meant a
  // shared /products link previewed with the homepage's generic
  // title/description instead of its own.
  const previousOpenGraph = (await parent).openGraph;

  return {
    title,
    description,
    // Deliberately not reading `searchParams` here: the `?category=` filter
    // (see ProductsGrid.tsx) stays out of the metadata on purpose, so every
    // category view canonicalizes back to this same base URL instead of
    // being treated as separate, duplicate-content pages.
    alternates: buildAlternates("/products", locale as Locale),
    openGraph: {
      ...previousOpenGraph,
      title,
      description,
      url: `/${locale}/products`,
    },
  };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}
