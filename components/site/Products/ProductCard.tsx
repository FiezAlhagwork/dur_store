"use client";

import { ProductCardProps } from "@/types/product";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ProductCardImage from "./ProductCardImage";
import {
  formatPercent,
  getLocalizedName,
  getProductPricing,
} from "@/utils/helper";
import Button from "@/components/ui/Button";

export default function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  const name = getLocalizedName(product, locale);
  const categoryName = product.category
    ? getLocalizedName(product.category, locale)
    : undefined;
  const isOutOfStock = product.stock <= 0;
  const pricing = getProductPricing(product);

  /*
   * One badge slot on the image, so the two claims compete for it: "out of
   * stock" wins, since a discount on something nobody can buy is noise next
   * to the blocking fact. There's no price on this card to carry the
   * discount otherwise, so the badge is the only signal for it here.
   */
  const badge = isOutOfStock
    ? t("products.outOfStock")
    : pricing.hasDiscount
      ? t("products.discountBadge", {
          percent: formatPercent(pricing.percentOff, locale),
        })
      : undefined;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_1px_3px_-1px_rgba(29,6,52,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_24px_48px_-24px_rgba(29,6,52,0.3)]">
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <ProductCardImage
          images={product.images}
          alt={name}
          className="aspect-5/4"
          badge={badge}
        />
      </Link>

      <div className="p-4 pt-3 sm:p-5 sm:pt-4">
        {categoryName && (
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary/50">
            {categoryName}
          </p>
        )}
        <h3 className="mt-0.5 truncate font-serif text-sm font-semibold text-primary sm:text-lg">
          {name}
        </h3>

        {/*
          Always this one button, regardless of stock — it only ever leads
          to the detail page, it never places an order, so "out of stock"
          has nothing to disable here. That fact is already visible via the
          badge on the image above.
        */}
        <Button
          href={`/${locale}/products/${product.slug}`}
          variant="primary"
          size="md"
          className="mt-3 w-full gap-2"
        >
          {t("products.viewDetails")}
        </Button>
      </div>
    </div>
  );
}
