import { z } from "zod";
import type { TFunction } from "i18next";
import { KARAT_OPTIONS } from "@/types/product";

/**
 * Turns an empty input into `undefined` before validation.
 *
 * Every optional numeric field here is a text input that yields `""` when
 * untouched, and `z.coerce.number()` reads `""` as `0` — which would silently
 * save a gold weight of zero instead of leaving the field unset.
 */
const optionalNumber = (message: string) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, message).optional(),
  );

const optionalText = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

export const getProductSchema = (t: TFunction) =>
  z.object({
    category_id: z.coerce
      .number()
      .int()
      .positive(t("admin.products.form.errors.category")),

    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, t("admin.products.form.errors.slug")),

    name_ar: z.string().min(2, t("admin.products.form.errors.nameAr")),
    name_en: z.string().min(2, t("admin.products.form.errors.nameEn")),

    description_ar: optionalText,
    description_en: optionalText,

    gold_weight: optionalNumber(t("admin.products.form.errors.goldWeight")),

    // The API rejects anything outside this set with a 422, which is why this
    // is a select rather than free text (see types/product.ts).
    karat: z.enum(KARAT_OPTIONS),

    gemstone_type: optionalText,
    gemstone_carat: optionalNumber(
      t("admin.products.form.errors.gemstoneCarat"),
    ),

    price: z.coerce.number().positive(t("admin.products.form.errors.price")),

    has_discount: z.boolean(),
    /*
     * A percentage, so it caps at 100 — confirmed against a real response, not
     * assumed: `discount_value: 15` on a $790 product came back as
     * `final_price: 671.5` with `discount.type: "percentage"`.
     *
     * 100 is allowed rather than capped at 99: giving something away is a
     * decision the shop is entitled to make, and rejecting it would be the
     * form inventing a commercial rule the API never stated.
     */
    discount_value: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce
        .number()
        .min(0, t("admin.products.form.errors.discountValue"))
        .max(100, t("admin.products.form.errors.discountMax"))
        .optional(),
    ),
    stock: z.coerce
      .number()
      .int()
      .min(0, t("admin.products.form.errors.stock")),

    is_active: z.boolean(),
  })
    /*
     * This rule needs no knowledge of what the number means, so it can be
     * enforced now: switching the discount on and leaving the value blank
     * would otherwise save a discount of nothing and read, to the admin, as
     * though it had worked.
     */
    .refine(
      (data) =>
        !data.has_discount ||
        (data.discount_value !== undefined && data.discount_value > 0),
      {
        path: ["discount_value"],
        message: t("admin.products.form.errors.discountRequired"),
      },
    );

/**
 * The coercions above mean the schema's input and output types differ: the
 * form holds what the DOM produces (strings from number inputs), while the
 * submit handler receives the parsed numbers.
 *
 * react-hook-form models this with separate generics, so both are exported —
 * `useForm<ProductFormInput, unknown, ProductFormValues>`.
 */
export type ProductFormInput = z.input<ReturnType<typeof getProductSchema>>;
export type ProductFormValues = z.output<ReturnType<typeof getProductSchema>>;
