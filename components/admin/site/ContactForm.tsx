"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import SectionSaveBar from "./SectionSaveBar";
import { useSettingsSection } from "./useSettingsSection";
import Input from "@/components/ui/Input";
import { getContactSchema, type ContactFormValues } from "@/schema/settings";
import type { SiteSettings } from "@/types/settings";

const FIELDS = [
  "phone",
  "phone_href",
  "email",
  "address_ar",
  "address_en",
] as const;

export default function ContactForm({
  contact,
}: {
  contact: SiteSettings["contact"];
}) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => getContactSchema(t), [t]);
  const section = useSettingsSection();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: contact,
  });

  const onSubmit = async (values: ContactFormValues) => {
    const ok = await section.save(
      { contact: values },
      {
        applyFieldErrors: (error) =>
          FIELDS.forEach((field) => {
            const message =
              error.fieldError(`contact.${field}`) ?? error.fieldError(field);
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
          label={t("admin.site.contact.phone")}
          hint={t("admin.site.contact.phoneHint")}
          placeholder="+963 999 000 000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        {/* Separate from the line above because the two are genuinely
            different strings: what reads well is not what `tel:` accepts. */}
        <Input
          dir="ltr"
          label={t("admin.site.contact.phoneHref")}
          hint={t("admin.site.contact.phoneHrefHint")}
          placeholder="tel:+963999000000"
          error={errors.phone_href?.message}
          {...register("phone_href")}
        />

        <Input
          dir="ltr"
          type="email"
          label={t("admin.site.contact.email")}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="hidden sm:block" aria-hidden="true" />

        <Input
          label={t("admin.site.contact.addressAr")}
          error={errors.address_ar?.message}
          {...register("address_ar")}
        />
        <Input
          label={t("admin.site.contact.addressEn")}
          error={errors.address_en?.message}
          {...register("address_en")}
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
