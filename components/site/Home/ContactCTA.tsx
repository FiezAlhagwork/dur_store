"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Reveal from "@/components/shared/Reveal";
import { getContactSchema, type ContactFormValues } from "@/schema/contact";
import { getWhatsAppContactLink } from "@/lib/whatsapp";
import { getContactDetails, getSocialLinks } from "@/constants";
import { useSettings } from "@/hooks/useSettings";
import Image from "next/image";

export default function ContactCTA() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const schema = useMemo(() => getContactSchema(t), [t]);
  const { settings } = useSettings();
  const contactDetails = getContactDetails(settings, locale);
  const socialLinks = getSocialLinks(settings);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: ContactFormValues) => {
    const link = getWhatsAppContactLink(values, locale, settings.brand);
    window.open(link, "_blank", "noopener,noreferrer");
    reset();
  };

  return (
    <section
      className="relative overflow-hidden  bg-second py-20  "
      id="contact"
      data-navbar-theme="dark"
    >
      <Image
        src="/eger.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -bottom-10 -right-19 w-70  rotate-180 select-none  sm:w-60 md:-bottom-23 md:-right-22 md:w-90"
      />
      <div className="site-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-primary xl:text-base">
            {t("contact.eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-primary md:text-4xl xl:text-5xl">
            {t("contact.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-foreground/70 sm:text-base">
            {t("contact.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14 xl:mt-16">
          <Reveal delay={0.05} className="lg:col-span-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t("contact.form.name")}
                  placeholder={t("contact.form.namePlaceholder")}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label={t("contact.form.email")}
                  type="email"
                  placeholder={t("contact.form.emailPlaceholder")}
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t("contact.form.phone")}
                  type="tel"
                  placeholder={t("contact.form.phonePlaceholder")}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <Input
                  label={t("contact.form.subject")}
                  placeholder={t("contact.form.subjectPlaceholder")}
                  error={errors.subject?.message}
                  {...register("subject")}
                />
              </div>

              <Textarea
                label={t("contact.form.message")}
                placeholder={t("contact.form.messagePlaceholder")}
                rows={5}
                error={errors.message?.message}
                {...register("message")}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                {t("contact.form.submit")}
              </Button>
            </form>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-8 rounded-[28px] border border-white/50 bg-background/25 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_30px_-12px_rgba(29,6,52,0.15)] backdrop-blur-xl backdrop-saturate-150 sm:p-8">
              <ul className="space-y-5">
                {contactDetails.map(({ icon: Icon, labelKey, value, href }) => (
                  <li key={labelKey} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-primary/50">
                        {t(labelKey)}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-0.5 block text-sm font-medium text-primary transition-colors hover:text-primary/70"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-primary">
                          {value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary/50">
                  {t("contact.info.follow")}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-second"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
