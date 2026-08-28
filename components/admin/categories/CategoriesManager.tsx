"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import CategoriesTable from "./CategoriesTable";
import CategoryFormModal from "./CategoryFormModal";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import Button from "@/components/ui/Button";
import { SkeletonGroup, SkeletonListRow } from "@/components/ui/Skeleton";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types/product";

/**
 * Owns the data (`useCategories`) and the two pieces of dialog state — which
 * category, if any, is being edited or is pending deletion. The table and
 * both modals below are presentational; this is the only place that decides
 * which one is open.
 */
export default function CategoriesManager() {
  const { t } = useTranslation("common");
  const { data: categories, error, isError, isPending, refetch } =
    useCategories();

  // `null` create, a `Category` edit, `undefined` closed — three states in
  // one field rather than a separate boolean plus a nullable category, which
  // would let "open" and "which category" drift out of sync.
  const [formTarget, setFormTarget] = useState<Category | null | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const openCreate = () => setFormTarget(null);
  const openEdit = (category: Category) => setFormTarget(category);
  const closeForm = () => setFormTarget(undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.categories.add")}
        </Button>
      </div>

      <div className="rounded-3xl border border-primary/10 bg-background p-5 sm:p-6">
        {isError ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-serif text-lg font-bold text-primary">
              {t("admin.categories.error.title")}
            </h2>
            <p className="max-w-sm text-sm text-foreground/60">
              {t("admin.categories.error.description")}
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-3 text-start text-xs text-foreground/70">
                {error.status} — {error.message}
              </pre>
            )}
            <Button type="button" onClick={() => refetch()}>
              {t("admin.categories.error.retry")}
            </Button>
          </div>
        ) : isPending ? (
          <SkeletonGroup label={t("common.loading")} className="flex flex-col divide-y divide-primary/10">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonListRow key={index} />
            ))}
          </SkeletonGroup>
        ) : categories.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-foreground/60">
              {t("admin.categories.empty")}
            </p>
            <Button type="button" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("admin.categories.add")}
            </Button>
          </div>
        ) : (
          <CategoriesTable
            categories={categories}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <CategoryFormModal
        isOpen={formTarget !== undefined}
        onClose={closeForm}
        category={formTarget ?? undefined}
      />

      {deleteTarget && (
        <DeleteCategoryDialog
          category={deleteTarget}
          isOpen
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
