"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ImageOff, Pencil, Percent, Trash2 } from "lucide-react";
import { useToggleProductActive } from "@/hooks/useProducts";
import { getLocalizedName } from "@/utils/helper";
import ProductPrice from "@/components/ui/ProductPrice";
import type { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
  locale: "ar" | "en";
  onDelete: (product: Product) => void;
  /** Opens the quick discount dialog for one row. */
  onEditDiscount: (product: Product) => void;
}

export default function ProductsTable({
  products,
  locale,
  onDelete,
  onEditDiscount,
}: ProductsTableProps) {
  const { t } = useTranslation("common");
  const toggleActive = useToggleProductActive();

  return (
    <ul className="flex flex-col divide-y divide-primary/10">
      {products.map((product) => {
        const name = getLocalizedName(product, locale);
        const image =
          product.images?.find((item) => item.is_primary) ?? product.images?.[0];
        const isToggling =
          toggleActive.isPending && toggleActive.variables === product.id;

        return (
          <li key={product.id} className="flex items-center gap-3 py-3 sm:gap-4">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-primary/5">
              {image ? (
                <Image
                  src={image.path}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-primary/30">
                  <ImageOff className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary">{name}</p>
              <p className="truncate text-xs text-foreground/50">
                {product.category
                  ? getLocalizedName(product.category, locale)
                  : "—"}
              </p>
            </div>

            <div className="hidden shrink-0 text-end sm:block">
              <ProductPrice product={product} locale={locale} size="sm" />
              <p className="text-xs tabular-nums text-foreground/50">
                {t("admin.products.stock", { count: product.stock })}
              </p>
            </div>

            {/*
              No confirmation here on purpose: this is one click to undo, so a
              dialog would be friction rather than protection. `aria-pressed`
              carries the on/off state that the colour communicates visually.
            */}
            <button
              type="button"
              onClick={() => toggleActive.mutate(product.id)}
              disabled={isToggling}
              aria-pressed={product.is_active}
              aria-label={t("admin.products.actions.toggle")}
              className={[
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                product.is_active
                  ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                  : "bg-primary/10 text-primary/50 hover:bg-primary/15",
              ].join(" ")}
            >
              {product.is_active
                ? t("admin.categories.status.active")
                : t("admin.categories.status.inactive")}
            </button>

            <div className="flex shrink-0 items-center gap-1">
              {/* Setting up a sale means touching one field on many products,
                  so it gets its own one-click route in rather than making the
                  admin open the full twelve-field form each time. Tinted when
                  a discount is already running, so the row states it at a
                  glance. */}
              <button
                type="button"
                onClick={() => onEditDiscount(product)}
                aria-label={t("admin.products.actions.discount")}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  product.has_discount
                    ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    : "text-primary/60 hover:bg-primary/5 hover:text-primary",
                ].join(" ")}
              >
                <Percent className="h-4 w-4" aria-hidden="true" />
              </button>

              <Link
                href={`/${locale}/dashboard/products/${product.id}/edit`}
                aria-label={t("admin.products.actions.edit")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(product)}
                aria-label={t("admin.products.actions.delete")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
