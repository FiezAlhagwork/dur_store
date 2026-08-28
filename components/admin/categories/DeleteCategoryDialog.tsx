"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useDeleteCategory } from "@/hooks/useCategories";
import { getLocalizedName } from "@/utils/helper";
import type { Category } from "@/types/product";

interface DeleteCategoryDialogProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Deleting a category cascades to every product inside it (see
 * services/categories.ts), so this asks for an explicit, informed
 * confirmation rather than a bare "are you sure?" — the copy names that
 * consequence directly.
 */
export default function DeleteCategoryDialog({
  category,
  isOpen,
  onClose,
}: DeleteCategoryDialogProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const [error, setError] = useState<string | null>(null);
  const deleteCategory = useDeleteCategory();

  const handleConfirm = async () => {
    setError(null);
    try {
      await deleteCategory.mutateAsync(category.id);
      onClose();
    } catch {
      setError(t("admin.categories.delete.error"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.categories.delete.title")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-500/5 p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-primary/80">
            {t("admin.categories.delete.warning", {
              name: getLocalizedName(category, locale),
            })}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("admin.categories.form.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={deleteCategory.isPending}
            onClick={handleConfirm}
          >
            {t("admin.categories.delete.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
