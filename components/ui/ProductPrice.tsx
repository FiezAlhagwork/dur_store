"use client";

import { useTranslation } from "react-i18next";
import {
  formatPercent,
  formatPrice,
  getProductPricing,
} from "@/utils/helper";
import type { Product } from "@/types/product";

const PRICE_SIZES = {
  sm: { final: "text-sm", original: "text-[11px]", badge: "text-[10px]" },
  md: { final: "text-sm sm:text-base", original: "text-xs", badge: "text-[10px]" },
  lg: { final: "text-2xl sm:text-3xl", original: "text-base", badge: "text-xs" },
} as const;

interface ProductPriceProps {
  /** Only the three fields the price depends on, so callers can pass anything product-shaped. */
  product: Pick<Product, "price" | "has_discount" | "final_price">;
  locale: "ar" | "en";
  size?: keyof typeof PRICE_SIZES;
  /** The "15% off" pill. Off by default — it needs room the tighter rows don't have. */
  showBadge?: boolean;
  className?: string;
}

/**
 * One price display for the whole app, so a discounted product cannot end up
 * struck through on the card and plain in the table.
 *
 * The discount is read from `price` and `final_price` via `getProductPricing`;
 * `discount_value` is never touched here (see the note on it in
 * types/product.ts). Undiscounted products render exactly what they rendered
 * before this component existed — a single price, no extra markup.
 */
export default function ProductPrice({
  product,
  locale,
  size = "md",
  showBadge = false,
  className = "",
}: ProductPriceProps) {
  const { t } = useTranslation("common");
  const pricing = getProductPricing(product);
  const sizes = PRICE_SIZES[size];

  if (!pricing.hasDiscount) {
    return (
      <span
        className={`font-semibold tabular-nums text-primary ${sizes.final} ${className}`}
      >
        {formatPrice(pricing.finalPrice, locale)}
      </span>
    );
  }

  return (
    /*
     * Row order is not flipped by hand: `flex` follows the document's `dir`,
     * so the final price leads and the struck-through original trails in both
     * languages without an `rtl:` variant.
     */
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className={`font-semibold tabular-nums text-primary ${sizes.final}`}>
        {formatPrice(pricing.finalPrice, locale)}
      </span>

      {/* `line-through` alone is decoration a screen reader may not convey, so
          the old price is labelled rather than left to look like a second,
          contradictory price. */}
      <s
        className={`tabular-nums text-foreground/40 ${sizes.original}`}
        aria-label={t("products.originalPrice")}
      >
        {formatPrice(pricing.price, locale)}
      </s>

      {showBadge && (
        <span
          className={`rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-600 ${sizes.badge}`}
        >
          {t("products.discountBadge", {
            percent: formatPercent(pricing.percentOff, locale),
          })}
        </span>
      )}
    </span>
  );
}
