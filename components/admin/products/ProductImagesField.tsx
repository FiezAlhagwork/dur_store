"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star, Upload, X } from "lucide-react";
import DeleteImageDialog from "./DeleteImageDialog";
import type { ProductImage } from "@/types/product";

/**
 * A picked-but-not-yet-uploaded image, paired with the object URL that
 * previews it.
 *
 * The URL is created in the file input's change handler — the event that
 * actually introduces the file — rather than being derived from the file list
 * during render or in an effect. That keeps creation and revocation in matching
 * places and avoids a render-time side effect.
 */
export interface PendingImage {
  file: File;
  url: string;
}

interface ProductImagesFieldProps {
  /** Absent while creating — there is nothing on the server yet. */
  productId?: number;
  existingImages: ProductImage[];
  pendingImages: PendingImage[];
  onPendingImagesChange: (images: PendingImage[]) => void;
}

/**
 * Two visually separate groups, because they behave completely differently:
 *
 * - **Existing images** live on the server. Removing one hits its own
 *   endpoint and takes effect immediately, independent of the form.
 * - **New images** are only uploaded when the form is saved, and are *added*
 *   to the existing set rather than replacing it (see services/products.ts).
 *
 * Collapsing them into one grid would hide that difference and make Cancel
 * look like it undoes both.
 */
export default function ProductImagesField({
  productId,
  existingImages,
  pendingImages,
  onPendingImagesChange,
}: ProductImagesFieldProps) {
  const { t } = useTranslation("common");
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);

  /*
   * Removing an image revokes its URL right away, but leaving the form with
   * images still picked would strand them. A ref mirrors the current list so
   * the unmount cleanup can revoke whatever is outstanding, without that
   * cleanup re-running (and revoking URLs still in use) on every change.
   */
  const pendingRef = useRef(pendingImages);

  useEffect(() => {
    pendingRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  const sortedExisting = [...existingImages].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const removePending = (index: number) => {
    URL.revokeObjectURL(pendingImages[index].url);
    onPendingImagesChange(pendingImages.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      {productId && sortedExisting.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-primary">
            {t("admin.products.images.current")}
          </span>
          <p className="text-xs text-foreground/50">
            {t("admin.products.images.currentHint")}
          </p>

          <ul className="flex flex-wrap gap-3">
            {sortedExisting.map((image) => (
              <li
                key={image.id}
                className="relative h-24 w-24 overflow-hidden rounded-2xl bg-primary/5"
              >
                <Image
                  src={image.path}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />

                {image.is_primary && (
                  <span
                    className="absolute bottom-1 start-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/80 text-second"
                    title={t("admin.products.images.primary")}
                  >
                    <Star className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setImageToDelete(image)}
                  aria-label={t("admin.products.images.deleteConfirm")}
                  className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/70 text-second transition-colors hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-primary">
          {productId
            ? t("admin.products.images.addMore")
            : t("admin.products.images.add")}
        </span>

        {pendingImages.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {pendingImages.map((image, index) => (
              <li
                key={image.url}
                className="relative h-24 w-24 overflow-hidden rounded-2xl bg-primary/5"
              >
                {/* Local blob: URLs can never match next/image's remotePatterns. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePending(index)}
                  aria-label={t("admin.products.images.removePending")}
                  className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/70 text-second transition-colors hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
          <Upload className="h-4 w-4" aria-hidden="true" />
          {t("admin.products.images.choose")}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              const picked = Array.from(event.target.files ?? []).map(
                (file) => ({ file, url: URL.createObjectURL(file) }),
              );
              // Appended, not replaced, so picking twice keeps both batches.
              onPendingImagesChange([...pendingImages, ...picked]);
              // Cleared so the same file can be re-picked after being removed.
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {productId && imageToDelete && (
        <DeleteImageDialog
          productId={productId}
          image={imageToDelete}
          isOpen
          onClose={() => setImageToDelete(null)}
        />
      )}
    </div>
  );
}
