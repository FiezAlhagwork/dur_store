"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import ProductsFilters, { type ActiveFilter } from "./ProductsFilters";
import ProductsTable from "./ProductsTable";
import DeleteProductDialog from "./DeleteProductDialog";
import DiscountDialog from "./DiscountDialog";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { SkeletonGroup, SkeletonListRow } from "@/components/ui/Skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProducts } from "@/hooks/useProducts";
import type { Product, ProductFilters } from "@/types/product";

export default function ProductsManager() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [active, setActive] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [discountTarget, setDiscountTarget] = useState<Product | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo<ProductFilters>(
    () => ({
      page,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(categoryId !== "all" ? { category_id: categoryId } : {}),
      ...(active !== "all" ? { is_active: active === "active" } : {}),
    }),
    [page, debouncedSearch, categoryId, active],
  );

  const { data, error, isError, isPending, isPlaceholderData, refetch } =
    useProducts(filters);

  const hasFilters =
    debouncedSearch !== "" || categoryId !== "all" || active !== "all";

  /** Any filter change invalidates the current page number. */
  const resetTo = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setActive("all");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button href={`/${locale}/dashboard/products/new`} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.products.add")}
        </Button>
      </div>

      <ProductsFilters
        search={search}
        onSearchChange={resetTo(setSearch)}
        categoryId={categoryId}
        onCategoryChange={resetTo(setCategoryId)}
        active={active}
        onActiveChange={resetTo(setActive)}
      />

      <div className="rounded-3xl border border-primary/10 bg-background p-5 sm:p-6">
        {isError ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-serif text-lg font-bold text-primary">
              {t("admin.products.error.title")}
            </h2>
            <p className="max-w-sm text-sm text-foreground/60">
              {t("admin.products.error.description")}
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-3 text-start text-xs text-foreground/70">
                {error.status} — {error.message}
              </pre>
            )}
            <Button type="button" onClick={() => refetch()}>
              {t("admin.products.error.retry")}
            </Button>
          </div>
        ) : isPending ? (
          <SkeletonGroup
            label={t("common.loading")}
            className="flex flex-col divide-y divide-primary/10"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonListRow key={index} />
            ))}
          </SkeletonGroup>
        ) : data.data.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
            {/* "Nothing matches your filters" and "you have no products at
                all" call for different next actions, so they are different
                messages rather than one generic empty state. */}
            <p className="text-sm text-foreground/60">
              {hasFilters
                ? t("admin.products.emptyFiltered")
                : t("admin.products.empty")}
            </p>
            {hasFilters ? (
              <Button type="button" variant="surface" onClick={clearFilters}>
                {t("admin.products.clearFilters")}
              </Button>
            ) : (
              <Button
                href={`/${locale}/dashboard/products/new`}
                className="gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("admin.products.add")}
              </Button>
            )}
          </div>
        ) : (
          <div
            // Dims the previous page while the next one loads, so paging reads
            // as a transition instead of a frozen table.
            className={isPlaceholderData ? "opacity-60 transition-opacity" : ""}
          >
            <ProductsTable
              products={data.data}
              locale={locale}
              onDelete={setDeleteTarget}
              onEditDiscount={setDiscountTarget}
            />
          </div>
        )}
      </div>

      {!isPending && !isError && (
        <Pagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          onPageChange={setPage}
          isDisabled={isPlaceholderData}
        />
      )}

      {deleteTarget && (
        <DeleteProductDialog
          product={deleteTarget}
          isOpen
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {discountTarget && (
        <DiscountDialog
          // Explicit rather than relying on the conditional above to unmount
          // it: the dialog seeds its input from the product it opened with, so
          // a reused instance would carry one product's value onto another.
          key={discountTarget.id}
          product={discountTarget}
          locale={locale}
          isOpen
          onClose={() => setDiscountTarget(null)}
        />
      )}
    </div>
  );
}
