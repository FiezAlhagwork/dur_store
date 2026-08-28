"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "@/utils/helper";
import type { DashboardProduct } from "@/types/dashboard";

interface ProductMiniListProps {
  products: DashboardProduct[];
  /**
   * The value shown at the end of each row. Low stock and latest products are
   * the same list in every other respect, and differ only here — a stock
   * badge versus a price — so they share this component instead of being two
   * near-identical ones.
   */
  renderMeta: (product: DashboardProduct) => ReactNode;
}

export default function ProductMiniList({
  products,
  renderMeta,
}: ProductMiniListProps) {
  const { i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  return (
    <ul className="flex flex-col divide-y divide-primary/10">
      {products.map((product) => {
        const name = getLocalizedName(product, locale);
        /*
         * This endpoint does not send `images` at all (see `DashboardProduct`),
         * so every row falls back to the placeholder today. The lookup stays in
         * place because the field is only missing, not impossible — if the API
         * starts eager-loading the relation, thumbnails appear on their own.
         * The primary flag is not guaranteed to be set on any image either.
         */
        const image =
          product.images?.find((item) => item.is_primary) ?? product.images?.[0];

        return (
          <li key={product.id} className="flex items-center gap-3 py-3">
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-primary/5">
              {image ? (
                <Image
                  src={image.path}
                  alt={name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-primary/30">
                  <ImageOff className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary">
                {name}
              </p>
              <p className="truncate text-xs text-foreground/50">
                {product.category
                  ? getLocalizedName(product.category, locale)
                  : "—"}
              </p>
            </div>

            <div className="shrink-0 text-sm">{renderMeta(product)}</div>
          </li>
        );
      })}
    </ul>
  );
}
