"use client";

import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import ProductsGrid from "@/components/site/Products/ProductsGrid";

export default function ProductsPageClient() {
  const { t } = useTranslation("common");

  return (
    <main className=" relative overflow-hidden">
      <section
        className="bg-second pb-12 pt-20 text-center md:pt-30"
        data-navbar-theme="dark"
      >
        <div className="site-container">
          <span className="text-sm font-bold uppercase tracking-wider text-primary sm:text-base">
            {t("products.eyebrow")}
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-primary sm:text-4xl md:text-5xl">
            {t("products.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground/70 sm:text-lg">
            {t("products.subtitle")}
          </p>
        </div>
      </section>

      <section
        className="site-container  py-14 md:py-20"
        data-navbar-theme="dark"
      >
        <Suspense fallback={null}>
          <ProductsGrid />
        </Suspense>
      </section>
    </main>
  );
}
