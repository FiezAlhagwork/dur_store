import { z } from "zod";
import type { TFunction } from "i18next";

/**
 * One schema per card, not one for the whole page.
 *
 * The store page saves each section on its own — a phone number should not
 * wait behind a 50MB video upload — so each form validates only its own
 * fields. A single page-wide schema would make every card's submit depend on
 * every other card's fields being valid.
 */

/** Trimmed, and required: an empty contact line is worse than a stale one. */
const requiredText = (message: string) => z.string().trim().min(1, message);

export const getBrandSchema = (t: TFunction) =>
  z.object({
    site_url: z
      .string()
      .trim()
      .url(t("admin.site.errors.url")),
    /*
     * Digits only. `wa.me` takes the number with no `+`, spaces or dashes, and
     * a value carrying any of those produces a link that opens WhatsApp on a
     * blank chat — which looks like the button is broken rather than like the
     * setting is wrong.
     */
    whatsapp_number: z
      .string()
      .trim()
      .regex(/^\d{8,15}$/, t("admin.site.errors.whatsapp")),
  });

export const getContactSchema = (t: TFunction) =>
  z.object({
    phone: requiredText(t("admin.site.errors.required")),
    // Kept separate from `phone` on purpose: the display form ("+963 999 000
    // 000") is not a valid `tel:` target, so the API stores both.
    phone_href: requiredText(t("admin.site.errors.required")),
    email: z.string().trim().email(t("admin.site.errors.email")),
    address_ar: requiredText(t("admin.site.errors.required")),
    address_en: requiredText(t("admin.site.errors.required")),
  });

export const getSocialSchema = (t: TFunction) =>
  z.object({
    instagram_url: z.string().trim().url(t("admin.site.errors.url")),
    facebook_url: z.string().trim().url(t("admin.site.errors.url")),
  });

export const getHeroTextSchema = (t: TFunction) => {
  const required = requiredText(t("admin.site.errors.required"));

  return z.object({
    title_line1_ar: required,
    title_line1_en: required,
    title_line2_ar: required,
    title_line2_en: required,
    description_ar: required,
    description_en: required,

    primary_button_label_ar: required,
    primary_button_label_en: required,
    secondary_button_label_ar: required,
    secondary_button_label_en: required,

    /*
     * A path, not a URL — these point inside the site (`/products`,
     * `/#about`), so `z.url()` would reject every legitimate value. Requiring
     * the leading slash is what stops `products` from resolving relative to
     * whatever page the visitor happens to be on.
     */
    primary_button_url: z
      .string()
      .trim()
      .regex(/^\/(?!\/)/, t("admin.site.errors.path")),
    secondary_button_url: z
      .string()
      .trim()
      .regex(/^\/(?!\/)/, t("admin.site.errors.path")),
  });
};

export type BrandFormValues = z.infer<ReturnType<typeof getBrandSchema>>;
export type ContactFormValues = z.infer<ReturnType<typeof getContactSchema>>;
export type SocialFormValues = z.infer<ReturnType<typeof getSocialSchema>>;
export type HeroTextFormValues = z.infer<ReturnType<typeof getHeroTextSchema>>;
