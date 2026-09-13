"use client";

import { useTranslation } from "react-i18next";
import { Gem, Sparkles, Weight, CircleDot } from "lucide-react";
import type { ProductSpecsProps } from "@/types";

/**
 * The piece's specs, as cards rather than the two inline pills this replaced.
 *
 * Every spec except karat is nullable in `types/product.ts`, so the grid is
 * built from whatever is actually recorded and renders nothing at all when a
 * piece has only its karat — an empty "Piece Details" heading over one lonely
 * card reads worse than no section.
 *
 * Units live in the translation files (`{{weight}} غرام` / `{{weight}} g`)
 * rather than being concatenated in JSX, which is how `g` and `ct` ended up
 * hardcoded English on the Arabic page before.
 */
export default function ProductSpecs({
  product,
  className = "",
}: ProductSpecsProps) {
  const { t } = useTranslation("common");

  const specs = [
    {
      key: "karat",
      icon: CircleDot,
      label: t("productDetail.karat"),
      value: t("productDetail.karatValue", { karat: product.karat }),
    },
    product.gold_weight != null && {
      key: "goldWeight",
      icon: Weight,
      label: t("productDetail.goldWeight"),
      value: t("productDetail.goldWeightValue", { weight: product.gold_weight }),
    },
    product.gemstone_type && {
      key: "gemstone",
      icon: Gem,
      label: t("productDetail.gemstone"),
      // Falls back to the raw stored value: only `diamond` has a translation
      // today, and a piece set with anything else should still say so.
      value: t(`productDetail.gemstones.${product.gemstone_type}`, {
        defaultValue: product.gemstone_type,
      }),
    },
    product.gemstone_carat != null && {
      key: "gemstoneCarat",
      icon: Sparkles,
      label: t("productDetail.gemstoneCarat"),
      value: t("productDetail.gemstoneCaratValue", {
        carat: product.gemstone_carat,
      }),
    },
  ].filter((spec) => typeof spec === "object" && spec !== null);

  // Karat alone isn't a spec sheet — it's already implied by the piece.
  if (specs.length < 2) return null;

  return (
    <section className={className} aria-labelledby="product-specs-title">
      <h2
        id="product-specs-title"
        className="font-serif text-base font-bold text-primary sm:text-lg"
      >
        {t("productDetail.specsTitle")}
      </h2>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {specs.map(({ key, icon: Icon, label, value }) => (
          <div
            key={key}
            /* The house glass card, same as WhyChooseUsCard / ReviewCard /
               ContactCTA — scaled down, since four of these sit in a row. */
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/50 bg-background/25 p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_30px_-12px_rgba(29,6,52,0.15)] backdrop-blur-lg backdrop-saturate-150"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/50">
              {label}
            </dt>
            <dd className="font-serif text-sm font-bold text-primary sm:text-base">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
