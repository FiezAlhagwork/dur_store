"use client";


import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";
import { getLocalizedName } from "@/utils/helper";

/** `is_active` is tri-state in the UI but boolean-or-absent in the API. */
export type ActiveFilter = "all" | "active" | "inactive";

interface ProductsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: number | "all";
  onCategoryChange: (value: number | "all") => void;
  active: ActiveFilter;
  onActiveChange: (value: ActiveFilter) => void;
}

export default function ProductsFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  active,
  onActiveChange,
}: ProductsFiltersProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  // Public endpoint, already cached by any other page that has listed
  // categories — this rarely costs a request of its own.
  const { data: categories } = useCategories();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 start-3.5 z-10 my-auto h-4 w-4 text-primary/40"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("admin.products.filters.searchPlaceholder")}
          aria-label={t("admin.products.filters.search")}
          className="ps-10"
        />
      </div>

      <Select
        value={String(categoryId)}
        onChange={(event) =>
          onCategoryChange(
            event.target.value === "all" ? "all" : Number(event.target.value),
          )
        }
        aria-label={t("admin.products.filters.category")}
      >
        <option value="all">{t("admin.products.filters.allCategories")}</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {getLocalizedName(category, locale)}
          </option>
        ))}
      </Select>

      <Select
        value={active}
        onChange={(event) => onActiveChange(event.target.value as ActiveFilter)}
        aria-label={t("admin.products.filters.status")}
      >
        <option value="all">{t("admin.products.filters.allStatuses")}</option>
        <option value="active">{t("admin.categories.status.active")}</option>
        <option value="inactive">{t("admin.categories.status.inactive")}</option>
      </Select>
    </div>
  );
}
