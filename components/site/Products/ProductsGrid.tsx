"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { usePublicProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import CategoryFilters from "./CategoryFilters";
import Button from "@/components/ui/Button";
import Reveal from "@/components/shared/Reveal";
import { getLocalizedName } from "@/utils/helper";

const SKELETON_COUNT = 6;

/**
 * The URL is the single source of truth for the active filter — there is no
 * separate `activeSlug` state to keep in sync with it. `useSearchParams`
 * already re-renders this component whenever `router.replace` changes the
 * query string, so deriving everything from `searchParams` and `categories`
 * on every render means there is nothing to reconcile and nothing that could
 * drift out of sync with what the address bar shows.
 */
export default function ProductsGrid() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawSlug = searchParams.get("category") ?? "all";

  const { data: categories, isError: categoriesError } = useCategories();

  const resolvedCategoryId = useMemo(() => {
    if (rawSlug === "all") return undefined;
    return categories?.find((category) => category.slug === rawSlug)?.id;
  }, [rawSlug, categories]);

  /*
   * A `?category=slug` link needs the category list resolved before it can be
   * turned into the numeric `category_id` the API actually filters on — the
   * API ignores a `category` query param outright (confirmed against the live
   * API; only `category_id` filters). Firing the products query before that
   * resolution lands would show every product for a moment, unfiltered,
   * before correcting itself.
   */
  const isReady = rawSlug === "all" || categories !== undefined;

  /*
   * A `?category=slug` pointing at nothing real — a deleted category, a stale
   * bookmark — resolves to `undefined` even once categories have loaded.
   * Treated as "all" for rendering rather than left showing a permanently
   * empty grid for a category that no longer exists; the URL itself is
   * corrected below, in an effect, since fixing it is the one part of this
   * that is a genuine side effect rather than a pure derivation.
   */
  const isStaleSlug =
    categories !== undefined && rawSlug !== "all" && resolvedCategoryId === undefined;

  const activeCategoryId = isStaleSlug ? undefined : resolvedCategoryId;

  useEffect(() => {
    if (!isStaleSlug) return;
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [isStaleSlug, searchParams, router]);

  const filterOptions = useMemo(
    () => [
      { id: "all" as const, label: t("products.filters.all") },
      ...(categories ?? []).map((category) => ({
        id: category.id,
        label: getLocalizedName(category, locale),
      })),
    ],
    [categories, t, locale],
  );

  const setActiveCategory = useCallback(
    (id: number | "all") => {
      const slug =
        id === "all" ? "all" : (categories?.find((c) => c.id === id)?.slug ?? "all");

      // Reflected on the URL, not local state — so a shared link or a page
      // refresh lands on the same filter.
      const params = new URLSearchParams(searchParams);
      if (slug === "all") {
        params.delete("category");
      } else {
        params.set("category", slug);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [categories, searchParams, router],
  );

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePublicProducts(
    activeCategoryId ? { category_id: activeCategoryId } : {},
    isReady,
  );

  const products = data?.pages.flatMap((page) => page.data) ?? [];
  const showLoading = isPending || !isReady;

  return (
    <div>
      <CategoryFilters
        options={filterOptions}
        activeId={activeCategoryId ?? "all"}
        onChange={setActiveCategory}
      />

      {categoriesError && (
        <p className="mt-4 text-center text-xs text-foreground/45">
          {t("products.filtersUnavailable")}
        </p>
      )}

      {isError ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-foreground/60">{t("products.error.description")}</p>
          {process.env.NODE_ENV === "development" && (
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-3 text-start text-xs text-foreground/70">
              {error.status} — {error.message}
            </pre>
          )}
          <Button type="button" variant="surface" size="sm" onClick={() => refetch()}>
            {t("products.error.retry")}
          </Button>
        </div>
      ) : showLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 ">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-16 text-center text-foreground/60">
          {t("products.empty")}
        </p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 ">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={Math.min((index % SKELETON_COUNT) * 0.06, 0.3)}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-10 flex justify-center sm:mt-14">
              <Button
                type="button"
                variant="surface"
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {t("products.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
