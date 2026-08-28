"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { getLocalizedName } from "@/utils/helper";
import type { Category } from "@/types/product";

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/**
 * A row list rather than a literal HTML `<table>` — same shape as
 * `ProductMiniList` on the dashboard — so nothing here ever needs
 * `overflow-x-auto`: each row already wraps naturally at any width instead of
 * a table forcing a fixed column layout that would scroll horizontally on
 * mobile.
 */
export default function CategoriesTable({
  categories,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  return (
    <ul className="flex flex-col divide-y divide-primary/10">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center gap-3 py-3 sm:gap-4"
        >
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-primary/5">
            {category.image ? (
              <Image
                src={category.image}
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
            <p className="truncate text-sm font-medium text-primary">
              {getLocalizedName(category, locale)}
            </p>
            <p dir="ltr" className="truncate text-xs text-foreground/50">
              {category.slug}
            </p>
          </div>

          <span
            className={[
              "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline",
              category.is_active
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-primary/8 text-primary/50",
            ].join(" ")}
          >
            {category.is_active
              ? t("admin.categories.status.active")
              : t("admin.categories.status.inactive")}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(category)}
              aria-label={t("admin.categories.actions.edit")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              aria-label={t("admin.categories.actions.delete")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
