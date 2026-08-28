"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AuthError from "./AuthError";
import { getEmailSchema, type EmailFormValues } from "@/schema/auth";
import type { AuthMode } from "@/types";

interface EmailStepProps {
  mode: AuthMode;
  defaultEmail: string;
  onSubmit: (values: EmailFormValues) => Promise<void>;
  errorMessage: string | null;
}

export default function EmailStep({
  mode,
  defaultEmail,
  onSubmit,
  errorMessage,
}: EmailStepProps) {
  const { t } = useTranslation("common");

  // Only the register page collects a name — see getEmailSchema.
  const isRegister = mode === "register";
  const schema = useMemo(() => getEmailSchema(t, isRegister), [t, isRegister]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail, firstName: "", lastName: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {isRegister && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            type="text"
            autoComplete="given-name"
            autoFocus
            containerClassName="flex-1"
            label={t("auth.name.firstLabel")}
            placeholder={t("auth.name.firstPlaceholder")}
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <Input
            type="text"
            autoComplete="family-name"
            containerClassName="flex-1"
            label={t("auth.name.lastLabel")}
            placeholder={t("auth.name.lastPlaceholder")}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
      )}

      <Input
        type="email"
        autoComplete="email"
        autoFocus={!isRegister}
        label={t("auth.email.label")}
        placeholder={t("auth.email.placeholder")}
        error={errors.email?.message}
        {...register("email")}
      />

      <AuthError message={errorMessage} />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-1 w-full"
        isLoading={isSubmitting}
      >
        {t("auth.email.submit")}
      </Button>
    </form>
  );
}
