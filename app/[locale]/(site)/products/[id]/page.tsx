import type { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { fetchProduct } from "@/services/products";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildProductJsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/i18n/config";
import ProductDetailsPageClient from "./ProductDetailsPageClient";

type ProductDetailsPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * `id` is always a slug here (see the client component) — fetchProduct
 * resolves either form, same call the client hook makes.
 *
 * Wrapped in React's `cache()` so `generateMetadata` and the page component
 * below share one request per render instead of each fetching the same
 * product independently — `fetchProduct` goes through axios, not `fetch()`,
 * so Next's automatic request memoization doesn't apply here on its own.
 * Resolves to `null` (not a throw) on a bad/deleted slug so both call sites
 * can just check for that instead of duplicating a try/catch each.
 */
const getProduct = cache((idOrSlug: string) =>
  fetchProduct(idOrSlug).catch(() => null),
);

export async function generateMetadata(
  { params }: ProductDetailsPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, id } = await params;
  const isArabic = locale === "ar";

  const product = await getProduct(id);
  if (!product) {
    // Bad or deleted slug: the client component already renders its own
    // "not found" screen for this, so metadata just falls back to the
    // parent layout's generic title/description/OG image instead of
    // failing the whole route over a 404.
    return {};
  }

  const name = isArabic ? product.name_ar : product.name_en;
  // `description_ar`/`description_en` are `string | null` on Product;
  // Metadata's description wants `string | undefined`.
  const description =
    (isArabic ? product.description_ar : product.description_en) ?? undefined;
  const image =
    product.images.find((img) => img.is_primary)?.path ??
    product.images[0]?.path;

  // Object-valued metadata fields are replaced wholesale, not deep-merged,
  // when a child route defines its own (see generate-metadata.md's Merging
  // section) — so setting `openGraph` here without this would silently drop
  // the siteName/type/locale/url already set in [locale]/layout.tsx, and a
  // shared link (e.g. on WhatsApp) would preview with no site branding.
  const previousOpenGraph = (await parent).openGraph;

  return {
    title: name,
    description,
    alternates: buildAlternates(`/products/${product.slug}`, locale as Locale),
    openGraph: {
      ...previousOpenGraph,
      title: name,
      description,
      // Otherwise this stays inherited as the generic `/${locale}` from
      // [locale]/layout.tsx — wrong for a shared product link: og:url is
      // meant to be this content's own canonical URL, per the OG spec.
      url: `/${locale}/products/${product.slug}`,
      // No explicit width/height: ProductImage carries no dimensions, and
      // both are optional in the Open Graph spec.
      images: image ? [{ url: image }] : previousOpenGraph?.images,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { locale, id } = await params;
  // Same cached request generateMetadata already made — no extra fetch.
  const product = await getProduct(id);

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductJsonLd(product, locale as Locale)),
          }}
        />
      )}
      <ProductDetailsPageClient params={params} />
    </>
  );
}
