"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  getClerkErrorMessage,
  isReverificationRequired,
} from "@/lib/clerk/user-error";
import { getProfileSchema, type ProfileFormValues } from "@/schema/profile";

/**
 * Edits the display name straight on Clerk — there is no API route for this
 * (`/api/user` is read-only, and nothing else exists; see the plan's endpoint
 * survey), and none is needed: Clerk owns identity in this architecture.
 *
 * Worth knowing: this updates Clerk **only**. Our `users.name` column is
 * written by the `user.created` webhook and there is no `user.updated`
 * handler, so the database keeps the original name. Nothing in the UI reads
 * that column, so no screen contradicts another — but the store's own records
 * do drift, and the fix belongs in Laravel rather than in a workaround here.
 */
export default function ProfileForm() {
  const { user } = useUser();
  const { t } = useTranslation("common");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const schema = useMemo(() => getProfileSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  if (!user) return null;

  const onSubmit = async (values: ProfileFormValues) => {
    setFormError(null);
    try {
      await user.update({
        firstName: values.firstName,
        lastName: values.lastName,
      });
      // Re-baselining the form clears `isDirty`, which is what keeps the
      // success note visible until the next edit — no timer, no effect.
      reset(values);
      setIsSaved(true);
    } catch (caught) {
      setFormError(
        isReverificationRequired(caught)
          ? t("admin.settings.errors.reverification")
          : getClerkErrorMessage(caught, t("admin.settings.profile.error")),
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 border-t border-primary/10 pt-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("admin.settings.profile.firstName")}
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label={t("admin.settings.profile.lastName")}
          hint={t("admin.settings.profile.lastNameHint")}
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      {formError && (
        <p role="alert" className="text-xs text-red-500">
          {formError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {isSaved && !isDirty && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {t("admin.settings.profile.saved")}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
          {t("admin.settings.profile.save")}
        </Button>
      </div>
    </form>
  );
}
