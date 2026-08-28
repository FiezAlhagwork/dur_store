"use client";

import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import Reveal from "@/components/shared/Reveal";
import CategoryCard from "./CategoryCard";

/**
 * This section is decoration for the home page, not a page whose job is to
 * show categories — so it fails quietly. While loading, or if the request
 * fails, or if the store simply does not have enough categories yet, the
 * whole section renders nothing rather than a spinner or an error banner. A
 * visitor scrolling the home page should never notice this section exists
 * only when it has something worth showing.
 */
export default function Categories() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const { data: categories, isPending, isError } = useCategories();

  if (isPending || isError) return null;
  if (categories.length < 2) return null;

  return (
    <div className="relative overflow-hidden  bg-second">

      <section
        className="site-container  py-16 md:py-24"
        id="categories"
        data-navbar-theme="dark"
      >
        <Reveal className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-primary sm:text-base">
            {t("categories.eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-2xl font-bold text-primary sm:text-3xl md:text-5xl">
            {t("categories.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-foreground/70 sm:text-base">
            {t("categories.subtitle")}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:mt-14 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={Math.min(index * 0.08, 0.3)}>
              <CategoryCard
                name={locale === "ar" ? category.name_ar : category.name_en}
                slug={category.slug}
                image={category.image}
                locale={locale}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
