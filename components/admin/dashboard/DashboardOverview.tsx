"use client";

import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import CategoryBreakdown from "./CategoryBreakdown";
import DashboardSection from "./DashboardSection";
import ProductMiniList from "./ProductMiniList";
import StatCards from "./StatCards";
import Button from "@/components/ui/Button";
import Skeleton, {
  SkeletonAvatar,
  SkeletonGroup,
  SkeletonListRow,
} from "@/components/ui/Skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import ProductPrice from "@/components/ui/ProductPrice";

/**
 * Matches the height and shape of the loaded layout below so the page does
 * not jump once the real data arrives — the three stat cards, then the three
 * sections with a couple of list rows each.
 */
function OverviewSkeleton({ label }: { label: string }) {
  return (
    <SkeletonGroup label={label} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-3xl border border-primary/10 bg-background p-5"
          >
            <SkeletonAvatar className="h-12 w-12 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="mt-3 h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={`rounded-3xl border border-primary/10 bg-background p-5 sm:p-6 ${index === 2 ? "lg:col-span-2" : ""}`}
          >
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-4 divide-y divide-primary/10">
              <SkeletonListRow />
              <SkeletonListRow />
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}

export default function DashboardOverview() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const { data, error, isError, isPending, refetch } = useDashboardStats();

  if (isError) {
    /*
     * A 403 is its own case, not a transient failure. The API docs single this
     * endpoint out: `manager` may write categories and products but is refused
     * here, so a manager clears the role guard in AdminShell and is stopped at
     * this request. Retrying cannot help, and the shared QueryClient already
     * knows not to.
     */
    const isForbidden = error.isForbidden;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        {isForbidden && (
          <ShieldAlert
            className="h-8 w-8 text-amber-600"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        )}

        <h2 className="font-serif text-lg font-bold text-primary">
          {isForbidden
            ? t("admin.overview.error.forbiddenTitle")
            : t("admin.overview.error.title")}
        </h2>
        <p className="max-w-sm text-sm text-foreground/60">
          {isForbidden
            ? t("admin.overview.error.forbiddenDescription")
            : t("admin.overview.error.description")}
        </p>

        {/* The visitor gets the translated copy above; this surfaces the raw
            server response in development only, so a failing request can be
            diagnosed without digging through the network tab. */}
        {process.env.NODE_ENV === "development" && (
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-3 text-start text-xs text-foreground/70">
            {error.status} — {error.message}
          </pre>
        )}

        {!isForbidden && (
          <Button type="button" onClick={() => refetch()}>
            {t("admin.overview.error.retry")}
          </Button>
        )}
      </div>
    );
  }

  if (isPending) return <OverviewSkeleton label={t("common.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <StatCards counts={data.products_count} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection
          title={t("admin.overview.byCategory.title")}
          emptyMessage={t("admin.overview.byCategory.empty")}
          isEmpty={data.products_by_category.length === 0}
        >
          <CategoryBreakdown categories={data.products_by_category} />
        </DashboardSection>

        <DashboardSection
          title={t("admin.overview.lowStock.title")}
          emptyMessage={t("admin.overview.lowStock.empty")}
          isEmpty={data.low_stock_products.length === 0}
        >
          <ProductMiniList
            products={data.low_stock_products}
            renderMeta={(product) => (
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                  product.stock <= 0
                    ? "bg-red-500/10 text-red-600"
                    : "bg-amber-500/10 text-amber-700",
                ].join(" ")}
              >
                {t("admin.overview.lowStock.remaining", {
                  count: product.stock,
                })}
              </span>
            )}
          />
        </DashboardSection>

        <DashboardSection
          className="lg:col-span-2"
          title={t("admin.overview.latest.title")}
          emptyMessage={t("admin.overview.latest.empty")}
          isEmpty={data.latest_products.length === 0}
        >
          <ProductMiniList
            products={data.latest_products}
            renderMeta={(product) => (
              <ProductPrice product={product} locale={locale} size="sm" />
            )}
          />
        </DashboardSection>
      </div>
    </div>
  );
}
