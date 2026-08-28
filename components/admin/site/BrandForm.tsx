"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import SectionSaveBar from "./SectionSaveBar";
import { useSettingsSection } from "./useSettingsSection";
import Input from "@/components/ui/Input";
import { getBrandSchema, type BrandFormValues } from "@/schema/settings";
import type { SiteSettings } from "@/types/settings";

const FIELDS = ["site_url", "whatsapp_number"] as const;

export default function BrandForm({ brand }: { brand: SiteSettings["brand"] }) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => getBrandSchema(t), [t]);
  const section = useSettingsSection();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(schema),
    defaultValues: brand,
  });

  const onSubmit = async (values: BrandFormValues) => {
    const ok = await section.save(
      { brand: values },
      {
        applyFieldErrors: (error) =>
          FIELDS.forEach((field) => {
            // The API nests the body, so a 422 keys its messages the same way.
            const message =
              error.fieldError(`brand.${field}`) ?? error.fieldError(field);
            if (message) setError(field, { message });
          }),
      },
    );

    // Re-baselining clears `isDirty`, which is what disables Save again and
    // keeps the success tick visible until the next edit.
    if (ok) reset(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          dir="ltr"
          label={t("admin.site.brand.siteUrl")}
          hint={t("admin.site.brand.siteUrlHint")}
          placeholder="https://durjewels.com"
          error={errors.site_url?.message}
          {...register("site_url")}
        />
        <Input
          dir="ltr"
          inputMode="numeric"
          label={t("admin.site.brand.whatsapp")}
          hint={t("admin.site.brand.whatsappHint")}
          placeholder="963999000000"
          error={errors.whatsapp_number?.message}
          {...register("whatsapp_number")}
        />
      </div>

      <SectionSaveBar
        isPending={section.isPending}
        isDirty={isDirty}
        isSaved={section.isSaved}
        error={section.formError}
      />
    </form>
  );
}
