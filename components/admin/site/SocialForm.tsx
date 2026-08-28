"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import SectionSaveBar from "./SectionSaveBar";
import { useSettingsSection } from "./useSettingsSection";
import Input from "@/components/ui/Input";
import { getSocialSchema, type SocialFormValues } from "@/schema/settings";
import type { SiteSettings } from "@/types/settings";

const FIELDS = ["instagram_url", "facebook_url"] as const;

export default function SocialForm({
  social,
}: {
  social: SiteSettings["social"];
}) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => getSocialSchema(t), [t]);
  const section = useSettingsSection();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<SocialFormValues>({
    resolver: zodResolver(schema),
    defaultValues: social,
  });

  const onSubmit = async (values: SocialFormValues) => {
    const ok = await section.save(
      { social: values },
      {
        applyFieldErrors: (error) =>
          FIELDS.forEach((field) => {
            const message =
              error.fieldError(`social.${field}`) ?? error.fieldError(field);
            if (message) setError(field, { message });
          }),
      },
    );

    if (ok) reset(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          dir="ltr"
          label={t("admin.site.social.instagram")}
          placeholder="https://instagram.com/…"
          error={errors.instagram_url?.message}
          {...register("instagram_url")}
        />
        <Input
          dir="ltr"
          label={t("admin.site.social.facebook")}
          placeholder="https://facebook.com/…"
          error={errors.facebook_url?.message}
          {...register("facebook_url")}
        />
      </div>

      {/* No WhatsApp field: that link is built from the number in the brand
          card, so a second input here would be a value that silently disagrees
          with the one actually used. */}
      <p className="mt-3 text-xs text-foreground/50">
        {t("admin.site.social.whatsappNote")}
      </p>

      <SectionSaveBar
        isPending={section.isPending}
        isDirty={isDirty}
        isSaved={section.isSaved}
        error={section.formError}
      />
    </form>
  );
}
