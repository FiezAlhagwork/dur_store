"use client";

import { useTranslation } from "react-i18next";
import { getLocalizedName } from "@/utils/helper";
import type { CategoryWithProductCount } from "@/types/dashboard";

/**
 * How the catalogue splits across categories, as proportional bars.
 *
 * Plain CSS widths rather than a chart library: there are only a handful of
 * categories, and the bars grow from the inline-start edge on their own, so
 * this needs no direction handling.
 */
export default function CategoryBreakdown({
  categories,
}: {
  categories: CategoryWithProductCount[];
}) {
  const { i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  // Scale against the biggest category, not the total, so the chart stays
  // readable when one category dwarfs the rest.
  const largest = Math.max(...categories.map((c) => c.products_count), 1);

  return (
    <ul className="flex flex-col gap-4">
      {categories.map((category) => (
        <li key={category.id}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-primary">
              {getLocalizedName(category, locale)}
            </span>
            <span className="shrink-0 tabular-nums text-primary/60">
              {category.products_count}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{
                width: `${(category.products_count / largest) * 100}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
