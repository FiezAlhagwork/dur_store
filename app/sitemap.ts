import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { fetchProducts } from "@/services/products";
import { SITE_URL } from "@/lib/seo/constants";

const withLanguages = (path: string) =>
  Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/products", priority: 0.8 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: "weekly",
      priority,
      alternates: { languages: withLanguages(path) },
    })),
  );

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    // The jewelry catalog is small enough for one page. If active products
    // ever approach ~1000, switch to `generateSitemaps` (multiple sitemap
    // files) instead of just raising per_page further.
    const { data: products } = await fetchProducts({ is_active: true, per_page: 1000 });

    productEntries = products.flatMap((product) => {
      const path = `/products/${product.slug}`;
      return locales.map((locale) => ({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: product.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: { languages: withLanguages(path) },
      }));
    });
  } catch {
    // Laravel is down at build/request time: ship the static routes rather
    // than failing the whole sitemap.
  }

  return [...staticEntries, ...productEntries];
}
