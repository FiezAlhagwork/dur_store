import { z } from "zod";
import type { TFunction } from "i18next";

/**
 * Schema for the email step. `requireName` is on for the register page,
 * where we also collect the first/last name so it can be handed to
 * `signUp.create()` — Laravel needs a `name` for the row its `user.created`
 * webhook creates. The login page passes `false`: it does not render the
 * name inputs at all, since asking a returning visitor for their name to
 * sign in makes no sense.
 *
 * The name fields stay optional in the object shape (so both modes share one
 * inferred type) and are enforced through `superRefine` instead.
 */
export const getEmailSchema = (t: TFunction, requireName: boolean) =>
  z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.email(t("auth.email.error")),
    })
    .superRefine((values, ctx) => {
      if (!requireName) return;

      if ((values.firstName ?? "").trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["firstName"],
          message: t("auth.name.firstError"),
        });
      }

      if ((values.lastName ?? "").trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["lastName"],
          message: t("auth.name.lastError"),
        });
      }
    });

export type EmailFormValues = z.infer<ReturnType<typeof getEmailSchema>>;

// Clerk's default email OTP code is 6 digits. If the Clerk dashboard is
// configured for a different length this regex needs to match it.
export const getCodeSchema = (t: TFunction) =>
  z.object({
    code: z
      .string()
      .regex(/^\d{6}$/, t("auth.code.error")),
  });

export type CodeFormValues = z.infer<ReturnType<typeof getCodeSchema>>;
