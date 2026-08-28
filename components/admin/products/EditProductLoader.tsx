"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import ProductForm from "./ProductForm";
import Button from "@/components/ui/Button";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import { useProduct } from "@/hooks/useProducts";

/**
 * Fetches the product the edit route points at, then hands it to the shared
 * form.
 *
 * The form only mounts once the product is loaded, so its `defaultValues`
 * are correct on the first render — react-hook-form reads them once, and
 * rendering the form against an empty product would leave every field blank
 * even after the data arrived.
 */
export default function EditProductLoader() {
  const { t } = useTranslation("common");
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: product, isPending, isError, error, refetch } = useProduct(id);

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
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
    );
  }

  if (isPending) {
    return (
      <SkeletonGroup
        label={t("common.loading")}
        className="flex max-w-3xl flex-col gap-5"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </SkeletonGroup>
    );
  }

  return <ProductForm product={product} />;
}
