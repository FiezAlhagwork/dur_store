"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { MailCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getCodeSchema, type CodeFormValues } from "@/schema/auth";
import type { CodeState } from "@/types";

interface CodeStepProps {
  email: string;
  codeState: CodeState;
  resendRemaining: number;
  errorMessage: string | null;
  onSubmit: (values: CodeFormValues) => Promise<void>;
  onResend: () => void;
}

export default function CodeStep({
  email,
  codeState,
  resendRemaining,
  errorMessage,
  onSubmit,
  onResend,
}: CodeStepProps) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => getCodeSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const isVerifying = codeState === "verifying";
  const stateMessage =
    codeState === "wrongCode"
      ? t("auth.code.wrongCode")
      : codeState === "expired"
        ? t("auth.code.expired")
        : codeState === "error"
          ? (errorMessage ?? t("auth.errors.generic"))
          : null;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      {/* Confirms the code went somewhere, and to which address — the one
          thing to double-check before waiting on an inbox. */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary/10">
          <MailCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>

        {/* Changing the address is the back control in AuthFlow's header, so
            there is no second link for it here. */}
        <p className="text-sm leading-relaxed text-foreground/70">
          {t("auth.code.sentTo", { email })}
        </p>
      </div>

      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoComplete="one-time-code"
        autoFocus
        size="lg"
        // The letter-spacing is applied after the last digit too, which pushes
        // centred text visually off to one side; the matching indent cancels it.
        className="text-center font-serif tracking-[0.55em] indent-[0.55em]"
        label={t("auth.code.label")}
        placeholder={t("auth.code.placeholder")}
        error={errors.code?.message ?? stateMessage ?? undefined}
        {...register("code")}
      />

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isVerifying}
        >
          {t("auth.code.submit")}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          disabled={resendRemaining > 0}
          onClick={onResend}
        >
          {resendRemaining > 0
            ? t("auth.code.resendIn", { seconds: resendRemaining })
            : t("auth.code.resend")}
        </Button>
      </div>
    </form>
  );
}
