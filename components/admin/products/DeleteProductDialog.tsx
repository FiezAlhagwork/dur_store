"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useDeleteProduct } from "@/hooks/useProducts";
import { getLocalizedName } from "@/utils/helper";
import type { Product } from "@/types/product";

interface DeleteProductDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteProductDialog({
  product,
  isOpen,
  onClose,
}: DeleteProductDialogProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const [error, setError] = useState<string | null>(null);
  const deleteProduct = useDeleteProduct();

  const handleConfirm = async () => {
    setError(null);
    try {
      await deleteProduct.mutateAsync(product.id);
      onClose();
    } catch {
      setError(t("admin.products.delete.error"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("admin.products.delete.title")}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-500/5 p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-primary/80">
            {t("admin.products.delete.warning", {
              name: getLocalizedName(product, locale),
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
            isLoading={deleteProduct.isPending}
            onClick={handleConfirm}
          >
            {t("admin.products.delete.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
