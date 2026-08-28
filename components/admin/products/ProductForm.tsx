"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import ProductImagesField, { type PendingImage } from "./ProductImagesField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import {
  getProductSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/schema/product";
import { ApiError } from "@/lib/api/errors";
import { formatPrice, getLocalizedName } from "@/utils/helper";
import { KARAT_OPTIONS, type Product } from "@/types/product";

/** Field names shared between the form and the API's 422 payload. */
const SERVER_ERROR_FIELDS = [
  "category_id",
  "slug",
  "name_ar",
  "name_en",
  "description_ar",
  "description_en",
  "gold_weight",
  "karat",
  "gemstone_type",
  "gemstone_carat",
  "price",
  "stock",
] as const;

export default function ProductForm({ product }: { product?: Product }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const router = useRouter();
  const isEdit = !!product;

  const schema = useMemo(() => getProductSchema(t), [t]);
  const { data: categories } = useCategories();

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          category_id: product.category_id,
          slug: product.slug,
          name_ar: product.name_ar,
          name_en: product.name_en,
          description_ar: product.description_ar ?? undefined,
          description_en: product.description_en ?? undefined,
          gold_weight: product.gold_weight ?? undefined,
          karat: product.karat,
          gemstone_type: product.gemstone_type ?? undefined,
          gemstone_carat: product.gemstone_carat ?? undefined,
          price: product.price,
          has_discount: product.has_discount,
          // Gated on `has_discount` for the same reason as DiscountDialog: a
          // removed discount leaves its old value behind, and seeding the
          // hidden field with it makes that number reappear the moment the
          // switch is turned back on, as though it had been configured.
          discount_value: product.has_discount
            ? (product.discount_value ?? undefined)
            : undefined,
          stock: product.stock,
          is_active: product.is_active,
        }
      : {
          karat: "21",
          is_active: true,
          stock: 0,
          has_discount: false,
        },
  });

  const hasDiscount = watch("has_discount");
  const priceInput = watch("price");
  const discountInput = watch("discount_value");

  /**
   * The discounted price, worked out as the admin types.
   *
   * A percentage of a price is not something to do in your head while deciding
   * whether an offer is worth running, and the number that matters
   * commercially is the one the customer will see — not the 15 in the box.
   * The formula is the API's own, confirmed against a real response
   * (`discount.type: "percentage"`); the server stays the authority, and every
   * price actually displayed anywhere still comes from its `final_price`.
   */
  const previewPrice = (() => {
    const price = Number(priceInput);
    const percent = Number(discountInput);

    if (!hasDiscount) return null;
    if (!Number.isFinite(price) || price <= 0) return null;
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) return null;

    return price * (1 - percent / 100);
  })();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    const newImageFiles = pendingImages.map((image) => image.file);

    try {
      if (isEdit) {
        /*
         * `slug` is sent only when it actually changed. It is not confirmed
         * that the server excludes the current row from its uniqueness check,
         * so re-sending the product's own slug risks a 422 that has nothing
         * to do with what the user edited (see types/product.ts).
         */
        const { slug, ...rest } = values;

        await updateProduct.mutateAsync({
          id: product.id,
          payload: {
            ...rest,
            ...(slug !== product.slug ? { slug } : {}),
            // Added to the existing images, never a replacement for them.
            ...(newImageFiles.length > 0 ? { images: newImageFiles } : {}),
          },
        });
      } else {
        await createProduct.mutateAsync({
          ...values,
          ...(newImageFiles.length > 0 ? { images: newImageFiles } : {}),
        });
      }

      router.push(`/${locale}/dashboard/products`);
    } catch (error) {
      if (error instanceof ApiError && error.isValidation) {
        SERVER_ERROR_FIELDS.forEach((field) => {
          const message = error.fieldError(field);
          if (message) setError(field, { message });
        });
        setFormError(t("admin.categories.form.errors.validation"));
        return;
      }
      setFormError(t("admin.categories.form.errors.generic"));
    }
  };

  const isPending =
    isSubmitting || createProduct.isPending || updateProduct.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex max-w-3xl flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label={t("admin.products.form.category")}
          error={errors.category_id?.message}
          {...register("category_id")}
        >
          <option value="">{t("admin.products.form.categoryPlaceholder")}</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {getLocalizedName(category, locale)}
            </option>
          ))}
        </Select>

        <Input
          label={t("admin.products.form.slug")}
          dir="ltr"
          placeholder="eternity-gold-ring"
          hint={t("admin.categories.form.slugHint")}
          error={errors.slug?.message}
          {...register("slug")}
        />

        <Input
          label={t("admin.products.form.nameAr")}
          error={errors.name_ar?.message}
          {...register("name_ar")}
        />
        <Input
          label={t("admin.products.form.nameEn")}
          error={errors.name_en?.message}
          {...register("name_en")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea
          label={t("admin.products.form.descriptionAr")}
          rows={3}
          error={errors.description_ar?.message}
          {...register("description_ar")}
        />
        <Textarea
          label={t("admin.products.form.descriptionEn")}
          rows={3}
          error={errors.description_en?.message}
          {...register("description_en")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          type="number"
          step="0.01"
          min="0"
          label={t("admin.products.form.price")}
          error={errors.price?.message}
          {...register("price")}
        />
        <Input
          type="number"
          min="0"
          label={t("admin.products.form.stock")}
          error={errors.stock?.message}
          {...register("stock")}
        />
        <Select
          label={t("admin.products.form.karat")}
          error={errors.karat?.message}
          {...register("karat")}
        >
          {KARAT_OPTIONS.map((karat) => (
            <option key={karat} value={karat}>
              {karat}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          step="0.01"
          min="0"
          label={t("admin.products.form.goldWeight")}
          error={errors.gold_weight?.message}
          {...register("gold_weight")}
        />
      </div>

      {/*
        Grouped in its own bordered block rather than dropped in among the
        twelve plain fields: a discount is a temporary commercial decision, not
        a property of the piece, and the value input is meaningless unless the
        switch above it is on.
      */}
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-primary/2 p-4">
        <label className="flex items-center gap-2.5 text-sm font-medium text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-primary/30 accent-primary"
            {...register("has_discount")}
          />
          {t("admin.products.form.hasDiscount")}
        </label>

        {hasDiscount && (
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              label={t("admin.products.form.discountValue")}
              hint={t("admin.products.form.discountValueHint")}
              error={errors.discount_value?.message}
              containerClassName="max-w-[12rem]"
              {...register("discount_value")}
            />

            {previewPrice !== null && (
              <p className="pb-6 text-sm text-foreground/60">
                {t("admin.products.form.finalPrice")}:{" "}
                <span className="font-semibold tabular-nums text-primary">
                  {formatPrice(previewPrice, locale)}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("admin.products.form.gemstoneType")}
          error={errors.gemstone_type?.message}
          {...register("gemstone_type")}
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          label={t("admin.products.form.gemstoneCarat")}
          error={errors.gemstone_carat?.message}
          {...register("gemstone_carat")}
        />
      </div>

      <ProductImagesField
        productId={product?.id}
        existingImages={product?.images ?? []}
        pendingImages={pendingImages}
        onPendingImagesChange={setPendingImages}
      />

      <label className="flex items-center gap-2.5 text-sm font-medium text-primary">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-primary/30 accent-primary"
          {...register("is_active")}
        />
        {t("admin.products.form.isActive")}
      </label>

      {formError && (
        <p role="alert" className="text-xs text-red-500">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/${locale}/dashboard/products`)}
        >
          {t("admin.categories.form.cancel")}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEdit
            ? t("admin.categories.form.save")
            : t("admin.products.form.create")}
        </Button>
      </div>
    </form>
  );
}
