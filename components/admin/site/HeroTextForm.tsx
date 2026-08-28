"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import SectionSaveBar from "./SectionSaveBar";
import { useSettingsSection } from "./useSettingsSection";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { getHeroTextSchema, type HeroTextFormValues } from "@/schema/settings";
import type { SiteSettings } from "@/types/settings";

const FIELDS = [
  "title_line1_ar",
  "title_line1_en",
  "title_line2_ar",
  "title_line2_en",
  "description_ar",
  "description_en",
  "primary_button_label_ar",
  "primary_button_label_en",
  "primary_button_url",
  "secondary_button_label_ar",
  "secondary_button_label_en",
  "secondary_button_url",
] as const;

/**
 * The hero's words, kept apart from its video and poster.
 *
 * Splitting the two is not a layout preference: the media card can be busy for
 * minutes uploading 50MB, and fixing a typo in a headline should not have to
 * queue behind that.
 */
export default function HeroTextForm({
  hero,
}: {
  hero: SiteSettings["home_hero"];
}) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => getHeroTextSchema(t), [t]);
  const section = useSettingsSection();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<HeroTextFormValues>({
    resolver: zodResolver(schema),
    // Only the text half; `video_url` and `poster_url` belong to the other card.
    defaultValues: {
      title_line1_ar: hero.title_line1_ar,
      title_line1_en: hero.title_line1_en,
      title_line2_ar: hero.title_line2_ar,
      title_line2_en: hero.title_line2_en,
      description_ar: hero.description_ar,
      description_en: hero.description_en,
      primary_button_label_ar: hero.primary_button_label_ar,
      primary_button_label_en: hero.primary_button_label_en,
      primary_button_url: hero.primary_button_url,
      secondary_button_label_ar: hero.secondary_button_label_ar,
      secondary_button_label_en: hero.secondary_button_label_en,
      secondary_button_url: hero.secondary_button_url,
    },
  });

  const onSubmit = async (values: HeroTextFormValues) => {
    const ok = await section.save(
      { home_hero: values },
      {
        applyFieldErrors: (error) =>
          FIELDS.forEach((field) => {
            const message =
              error.fieldError(`home_hero.${field}`) ?? error.fieldError(field);
            if (message) setError(field, { message });
          }),
      },
    );

    if (ok) reset(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("admin.site.hero.titleLine1Ar")}
          error={errors.title_line1_ar?.message}
          {...register("title_line1_ar")}
        />
        <Input
          dir="ltr"
          label={t("admin.site.hero.titleLine1En")}
          error={errors.title_line1_en?.message}
          {...register("title_line1_en")}
        />
        <Input
          label={t("admin.site.hero.titleLine2Ar")}
          error={errors.title_line2_ar?.message}
          {...register("title_line2_ar")}
        />
        <Input
          dir="ltr"
          label={t("admin.site.hero.titleLine2En")}
          error={errors.title_line2_en?.message}
          {...register("title_line2_en")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea
          rows={3}
          label={t("admin.site.hero.descriptionAr")}
          error={errors.description_ar?.message}
          {...register("description_ar")}
        />
        <Textarea
          dir="ltr"
          rows={3}
          label={t("admin.site.hero.descriptionEn")}
          error={errors.description_en?.message}
          {...register("description_en")}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-primary/2 p-4">
        <p className="text-sm font-medium text-primary">
          {t("admin.site.hero.primaryButton")}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label={t("admin.site.hero.labelAr")}
            error={errors.primary_button_label_ar?.message}
            {...register("primary_button_label_ar")}
          />
          <Input
            dir="ltr"
            label={t("admin.site.hero.labelEn")}
            error={errors.primary_button_label_en?.message}
            {...register("primary_button_label_en")}
          />
          <Input
            dir="ltr"
            label={t("admin.site.hero.url")}
            hint={t("admin.site.hero.urlHint")}
            placeholder="/products"
            error={errors.primary_button_url?.message}
            {...register("primary_button_url")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-primary/2 p-4">
        <p className="text-sm font-medium text-primary">
          {t("admin.site.hero.secondaryButton")}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label={t("admin.site.hero.labelAr")}
            error={errors.secondary_button_label_ar?.message}
            {...register("secondary_button_label_ar")}
          />
          <Input
            dir="ltr"
            label={t("admin.site.hero.labelEn")}
            error={errors.secondary_button_label_en?.message}
            {...register("secondary_button_label_en")}
          />
          <Input
            dir="ltr"
            label={t("admin.site.hero.url")}
            hint={t("admin.site.hero.urlHint")}
            placeholder="/#about"
            error={errors.secondary_button_url?.message}
            {...register("secondary_button_url")}
          />
        </div>
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
