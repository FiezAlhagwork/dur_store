"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useDeleteProductImage } from "@/hooks/useProducts";
import type { ProductImage } from "@/types/product";

interface DeleteImageDialogProps {
  productId: number;
  image: ProductImage;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Removing an image is its own endpoint, not part of saving the form, so it
 * takes effect the moment this is confirmed — the form's Cancel button cannot
 * bring it back. The copy says so explicitly rather than leaving the user to
 * discover it.
 */
export default function DeleteImageDialog({
  productId,
  image,
  isOpen,
  onClose,
}: DeleteImageDialogProps) {
  const { t } = useTranslation("common");
  const [error, setError] = useState<string | null>(null);
  const deleteImage = useDeleteProductImage();

  const handleConfirm = async () => {
    setError(null);
    try {
      await deleteImage.mutateAsync({ productId, imageId: image.id });
      onClose();
    } catch {
      setError(t("admin.products.images.deleteError"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.products.images.deleteTitle")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-500/5 p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-primary/80">
            {t("admin.products.images.deleteWarning")}
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
            isLoading={deleteImage.isPending}
            onClick={handleConfirm}
          >
            {t("admin.products.images.deleteConfirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
