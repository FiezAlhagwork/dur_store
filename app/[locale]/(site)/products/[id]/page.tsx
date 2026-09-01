import type { Metadata } from "next";
import { fetchProduct } from "@/services/products";
import ProductDetailsPageClient from "./ProductDetailsPageClient";

type ProductDetailsPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const isArabic = locale === "ar";

  try {
    // `id` is always a slug here (see the client component) — fetchProduct
    // resolves either form, same call the client hook makes.
    const product = await fetchProduct(id);
    const name = isArabic ? product.name_ar : product.name_en;
    // `description_ar`/`description_en` are `string | null` on Product;
    // Metadata's description wants `string | undefined`.
    const description =
      (isArabic ? product.description_ar : product.description_en) ??
      undefined;
    const image =
      product.images.find((img) => img.is_primary)?.path ??
      product.images[0]?.path;

    return {
      title: name,
      description,
      openGraph: {
        title: name,
        description,
        // No explicit width/height: ProductImage carries no dimensions, and
        // both are optional in the Open Graph spec.
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    // Bad or deleted slug: the client component already renders its own
    // "not found" screen for this, so metadata just falls back to the
    // parent layout's generic title/description/OG image instead of
    // failing the whole route over a 404.
    return {};
  }
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  return <ProductDetailsPageClient params={params} />;
}
