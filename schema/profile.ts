import { z } from "zod";
import type { TFunction } from "i18next";

/**
 * The signed-in user's display name, as Clerk stores it.
 *
 * `lastName` carries no minimum: Clerk keeps both names optional (see
 * CLAUDE.md — a login that transfers into a sign-up completes without either),
 * plenty of people go by a single name, and an empty string is how this form
 * clears the field. `firstName` is required because a dashboard account with
 * no name at all is worse than an incomplete one.
 */
export const getProfileSchema = (t: TFunction) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(2, t("admin.settings.profile.errors.firstName")),
    lastName: z.string().trim(),
  });

export type ProfileFormValues = z.infer<ReturnType<typeof getProfileSchema>>;
