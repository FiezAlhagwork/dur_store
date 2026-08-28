"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ImageOff, Upload } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { getCategorySchema, type CategoryFormValues } from "@/schema/category";
import { ApiError } from "@/lib/api/errors";
import type { Category } from "@/types/product";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present in edit mode, absent when creating a new category. */
  category?: Category;
}

const EMPTY_VALUES: CategoryFormValues = {
  name_ar: "",
  name_en: "",
  slug: "",
  is_active: true,
  image: null,
};

/**
 * Covers both create and edit — the two differ only in default values, which
 * mutation fires, and the title, so one form beats two near-identical ones.
 */
export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const { t } = useTranslation("common");
  const isEdit = !!category;
  const schema = useMemo(() => getCategorySchema(t), [t]);

  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedImage = watch("image");

  // Re-seed the form whenever a different category is opened (or the modal
  // opens fresh for "create"), rather than carrying over the previous
  // category's values into the next edit.
  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);
    setImagePreview(null);
    reset(
      category
        ? {
            name_ar: category.name_ar,
            name_en: category.name_en,
            slug: category.slug,
            is_active: category.is_active,
            image: null,
          }
        : EMPTY_VALUES,
    );
  }, [isOpen, category, reset]);

  // Local object URL for a newly picked file, revoked on change/unmount so it
  // does not leak — the existing category.image is a ready-to-use remote URL
  // and needs no such handling.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isPending = createCategory.isPending || updateCategory.isPending;

  const onSubmit = async (values: CategoryFormValues) => {
    setFormError(null);

    try {
      if (isEdit) {
        await updateCategory.mutateAsync({
          id: category.id,
          payload: {
            name_ar: values.name_ar,
            name_en: values.name_en,
            slug: values.slug,
            is_active: values.is_active,
            // Omitted entirely when nothing was picked, so the existing
            // image is left alone — see services/categories.ts.
            ...(values.image ? { image: values.image } : {}),
          },
        });
      } else {
        await createCategory.mutateAsync({
          name_ar: values.name_ar,
          name_en: values.name_en,
          slug: values.slug,
          is_active: values.is_active,
          image: values.image ?? undefined,
        });
      }
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.isValidation) {
        // Map whatever field-level messages the server sent back onto the
        // matching inputs, so a duplicate slug (for example) surfaces right
        // under the slug field instead of as one generic banner.
        (["name_ar", "name_en", "slug"] as const).forEach((field) => {
          const message = error.fieldError(field);
          if (message) setError(field, { message });
        });
        setFormError(t("admin.categories.form.errors.validation"));
        return;
      }
      setFormError(t("admin.categories.form.errors.generic"));
    }
  };

  const existingImageUrl = !selectedImage ? category?.image ?? null : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t("admin.categories.form.editTitle")
          : t("admin.categories.form.createTitle")
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            label={t("admin.categories.form.nameAr")}
            containerClassName="flex-1"
            error={errors.name_ar?.message}
            {...register("name_ar")}
          />
          <Input
            label={t("admin.categories.form.nameEn")}
            containerClassName="flex-1"
            error={errors.name_en?.message}
            {...register("name_en")}
          />
        </div>

        <Input
          label={t("admin.categories.form.slug")}
          dir="ltr"
          placeholder="rings"
          hint={t("admin.categories.form.slugHint")}
          error={errors.slug?.message}
          {...register("slug")}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-primary">
            {t("admin.categories.form.image")}
          </span>

          <div className="flex items-center gap-4">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/5">
              {imagePreview ? (
                // A local blob: URL for the just-picked file — next/image
                // validates its src against `remotePatterns`, which a blob
                // URL can never satisfy, so a plain <img> renders the
                // ephemeral preview instead.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : existingImageUrl ? (
                <Image
                  src={existingImageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <ImageOff className="h-5 w-5 text-primary/30" aria-hidden="true" />
              )}
            </span>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t("admin.categories.form.imageUpload")}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) =>
                  setValue("image", event.target.files?.[0] ?? null, {
                    shouldValidate: true,
                  })
                }
              />
            </label>
          </div>
          {errors.image?.message && (
            <p className="text-xs text-red-500">{errors.image.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-primary/30 accent-primary"
            {...register("is_active")}
          />
          {t("admin.categories.form.isActive")}
        </label>

        {formError && (
          <p role="alert" className="text-xs text-red-500">
            {formError}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("admin.categories.form.cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting || isPending}>
            {isEdit
              ? t("admin.categories.form.save")
              : t("admin.categories.form.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
