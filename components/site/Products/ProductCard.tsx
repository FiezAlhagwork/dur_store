"use client";

import { ProductCardProps } from "@/types/product";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ProductImageCarousel from "./ProductImageCarousel";
import { getWhatsAppOrderLink } from "@/lib/whatsapp";
import {
  formatPercent,
  getLocalizedName,
  getProductPricing,
} from "@/utils/helper";
import Button from "@/components/ui/Button";
import ProductPrice from "@/components/ui/ProductPrice";
import { useSettings } from "@/hooks/useSettings";

export default function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const { settings } = useSettings();

  const name = getLocalizedName(product, locale);
  const isOutOfStock = product.stock <= 0;
  const pricing = getProductPricing(product);

  /*
   * The carousel has one badge slot, so the two claims compete for it and
   * "out of stock" wins: a discount on something nobody can buy is noise, and
   * the shopper needs the blocking fact first. The discount is still visible
   * either way — the struck-through price in the caption carries it.
   */
  const badge = isOutOfStock
    ? t("products.outOfStock")
    : pricing.hasDiscount
      ? t("products.discountBadge", {
          percent: formatPercent(pricing.percentOff, locale),
        })
      : undefined;

  const caption = (
    <div className="rounded-xl border border-white/50 bg-background/30 px-3 py-2 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_20px_-8px_rgba(29,6,52,0.25)] sm:px-4 sm:py-2.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-primary/50 sm:text-[10px]">
        {t("products.karat", { karat: product.karat })}
      </p>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <h3 className="truncate font-serif text-sm font-semibold text-primary sm:text-base">
          {name}
        </h3>
        <ProductPrice
          product={product}
          locale={locale}
          size="md"
          className="shrink-0"
        />
      </div>
    </div>
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_1px_3px_-1px_rgba(29,6,52,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_24px_48px_-24px_rgba(29,6,52,0.3)]">
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <ProductImageCarousel
          images={product.images}
          alt={name}
          className="h-40 md:h-80 lg:h-70"
          badge={badge}
          caption={caption}
        />
      </Link>

      <div className="p-4 pt-3 sm:p-5 sm:pt-4">
        {!isOutOfStock ? (
          <Button
            href={getWhatsAppOrderLink(product, locale, settings.brand)}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="md"
            className="w-full gap-2"
          >
            {t("products.orderWhatsapp")}
          </Button>
        ) : (
          <Button variant="primary" size="md" className="w-full gap-2">
            {t("products.outOfStock")}
          </Button>
        )}
      </div>
    </div>
  );
}
