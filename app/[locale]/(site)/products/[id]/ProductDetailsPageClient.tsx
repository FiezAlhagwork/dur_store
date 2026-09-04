"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Gem, Weight, ChevronLeft, ChevronRight } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import ProductGallery from "@/components/site/Products/ProductGallery";
import ProductCard from "@/components/site/Products/ProductCard";
import Button from "@/components/ui/Button";
import ProductPrice from "@/components/ui/ProductPrice";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import Reveal from "@/components/shared/Reveal";
import { getWhatsAppOrderLink } from "@/lib/whatsapp";
import { useSettings } from "@/hooks/useSettings";
import { getLocalizedName } from "@/utils/helper";

type ProductDetailsPageClientProps = {
  params: Promise<{ id: string }>;
  /**
   * The same product `page.tsx` already fetched server-side for its
   * metadata/JSON-LD (undefined on a bad/deleted slug). Seeds `useProduct`
   * so this component renders the real content on the very first render —
   * server-side included — instead of a skeleton until the client re-fetches
   * it. See the comment on `useProduct`'s `initialData` param.
   */
  initialProduct?: Product;
};

/** How many related products to show, at most. */
const RELATED_LIMIT = 3;

export default function ProductDetailsPageClient({
  params,
  initialProduct,
}: ProductDetailsPageClientProps) {
  const { id: slug } = use(params);
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const isArabic = locale === "ar";
  const BackIcon = isArabic ? ChevronRight : ChevronLeft;

  // `useProduct` accepts an id or a slug — the API resolves either — and this
  // page's URL always carries the slug.
  const { data: product, isPending, isError, error } = useProduct(
    slug,
    true,
    initialProduct,
  );
  const { settings } = useSettings();

  const relatedEnabled = !!product;
  const { data: relatedPage } = useProducts(
    relatedEnabled ? { category_id: product.category_id } : {},
    relatedEnabled,
  );
  const relatedProducts = (relatedPage?.data ?? [])
    .filter((item) => item.slug !== slug)
    .slice(0, RELATED_LIMIT);

  if (isPending) {
    return (
      <main className="site-container py-10 md:py-26" data-navbar-theme="dark">
        <SkeletonGroup
          label={t("common.loading")}
          className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20"
        >
          <Skeleton className="aspect-square w-full rounded-2xl lg:aspect-auto lg:h-130" />

          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="mt-4 h-11 w-40 rounded-2xl" />
          </div>
        </SkeletonGroup>
      </main>
    );
  }

  if (isError) {
    if (error.status === 404) {
      return (
        <main
          className="site-container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center"
          data-navbar-theme="dark"
        >
          <p className="text-foreground/60">{t("productDetail.notFound")}</p>
          <Button href={`/${locale}/products`} variant="primary" size="sm">
            {t("productDetail.backToProducts")}
          </Button>
        </main>
      );
    }

    return (
      <main
        className="site-container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center"
        data-navbar-theme="dark"
      >
        <p className="text-foreground/60">{t("products.error.description")}</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-3 text-start text-xs text-foreground/70">
            {error.status} — {error.message}
          </pre>
        )}
        <Button href={`/${locale}/products`} variant="primary" size="sm">
          {t("productDetail.backToProducts")}
        </Button>
      </main>
    );
  }

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const description =
    locale === "ar" ? product.description_ar : product.description_en;
  const isOutOfStock = product.stock <= 0;

  return (
    <main
      className="relative overflow-hidden  py-10 md:py-26"
      data-navbar-theme="dark"
    >
      <div className="site-container">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary/60 transition-colors duration-200 hover:text-primary"
        >
          <BackIcon size={16} />
          {t("productDetail.backToProducts")}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <Reveal>
            <ProductGallery
              images={product.images}
              alt={name}
              className="h-80 sm:h-105 lg:h-130"
              badge={isOutOfStock ? t("products.outOfStock") : undefined}
            />
          </Reveal>

          {/*
            `min-w-0`: a CSS Grid column has an implicit `min-width: auto`
            (content-based), not zero — so a long unbroken run of text can
            widen this column past its track and spill out of the page
            regardless of `max-w-prose` on the paragraph below. This is the
            actual fix; `break-words` on the paragraph is a second layer for
            a single pathologically long word/URL with no spaces to wrap at.
          */}
          <Reveal delay={0.08} className="min-w-0">
            {product.category && (
              <Link
                href={`/${locale}/products?category=${product.category.slug}`}
                className="text-xs font-medium uppercase tracking-[0.16em] text-primary/40 transition-colors hover:text-primary/60"
              >
                {getLocalizedName(product.category, locale)}
              </Link>
            )}
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-primary/50">
              {t("products.karat", { karat: product.karat })}
            </p>
            <h1 className="mt-2 font-serif text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
              {name}
            </h1>
            <ProductPrice
              product={product}
              locale={locale}
              size="lg"
              showBadge
              className="mt-3"
            />

            <p className="mt-6 max-w-prose wrap-break-word text-sm leading-relaxed text-foreground/70 sm:text-base">
              {description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {/* `gold_weight` is `number | null` on real data — unlike the
                  fixture data this page used to run on, where every product
                  had one. Guarded the same way `gemstone_type` already is
                  below, rather than printing "Gold Weight: g" for a piece
                  with none recorded. */}
              {product.gold_weight != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:text-sm">
                  <Weight size={14} strokeWidth={1.75} />
                  {t("productDetail.goldWeight")}: {product.gold_weight}g
                </span>
              )}
              {product.gemstone_type && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:text-sm">
                  <Gem size={14} strokeWidth={1.75} />
                  {t(`productDetail.gemstones.${product.gemstone_type}`, {
                    defaultValue: product.gemstone_type,
                  })}
                  {product.gemstone_carat
                    ? ` · ${product.gemstone_carat} ct`
                    : ""}
                </span>
              )}
            </div>

            {!isOutOfStock && product.stock <= 5 && (
              <p className="mt-4 text-sm font-medium text-red-600">
                {t("productDetail.lowStock", { count: product.stock })}
              </p>
            )}

            <div className="mt-8">
              {!isOutOfStock ? (
                <Button
                  href={getWhatsAppOrderLink(product, locale, settings.brand)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="md"
                  className="gap-2"
                >
                  {t("products.orderWhatsapp")}
                </Button>
              ) : (
                <Button variant="primary" size="md" className="gap-2">
                  {t("products.outOfStock")}
                </Button>
              )}
            </div>
          </Reveal>
        </div>

        {/* No empty-state message here on purpose: a category with nothing
            else in it is a normal, unremarkable case for a related-products
            strip, unlike the main grid where "no products" is the whole
            page's content and needs to say so. */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 md:mt-28">
            <h2 className="font-serif text-xl font-bold text-primary sm:text-2xl">
              {t("productDetail.relatedTitle")}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {relatedProducts.map((related, index) => (
                <Reveal key={related.id} delay={Math.min(index * 0.06, 0.3)}>
                  <ProductCard product={related} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
