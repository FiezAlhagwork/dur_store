import { z } from "zod";
import type { TFunction } from "i18next";

/** 4MB, matching the limit documented in services/categories.ts. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const getCategorySchema = (t: TFunction) =>
  z.object({
    name_ar: z.string().min(2, t("admin.categories.form.errors.nameAr")),
    name_en: z.string().min(2, t("admin.categories.form.errors.nameEn")),
    // English letters/digits only: the slug is a URL segment, and this
    // matches every existing slug in the API (`rings`, `necklaces`, …).
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, t("admin.categories.form.errors.slug")),
    is_active: z.boolean(),
    image: z
      .instanceof(File)
      .refine(
        (file) => file.size <= MAX_IMAGE_BYTES,
        t("admin.categories.form.errors.imageSize"),
      )
      .optional()
      .nullable(),
  });

export type CategoryFormValues = z.infer<ReturnType<typeof getCategorySchema>>;
