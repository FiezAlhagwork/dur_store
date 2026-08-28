import { z } from "zod";
import type { TFunction } from "i18next";

export const getContactSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(2, t("contact.form.errors.name")),
    email: z.email(t("contact.form.errors.email")),
    phone: z.string().regex(/^[0-9+\s-]{7,}$/, t("contact.form.errors.phone")),
    subject: z.string().min(2, t("contact.form.errors.subject")),
    message: z.string().min(10, t("contact.form.errors.message")),
  });

export type ContactFormValues = z.infer<ReturnType<typeof getContactSchema>>;
