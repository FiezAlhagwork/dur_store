"use client";

import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import AuthError from "./AuthError";
import GoogleMark from "./GoogleMark";
import type { AuthMode } from "@/types";

interface MethodStepProps {
  mode: AuthMode;
  onContinueWithEmail: () => void;
  onGoogleClick: () => void;
  isGoogleLoading: boolean;
  errorMessage: string | null;
}

export default function MethodStep({
  onContinueWithEmail,
  onGoogleClick,
  isGoogleLoading,
  errorMessage,
}: MethodStepProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="surface"
        size="lg"
        className="w-full gap-2.5"
        onClick={onGoogleClick}
        isLoading={isGoogleLoading}
      >
        {!isGoogleLoading && <GoogleMark className="h-4.5 w-[18px]" />}
        {t("auth.method.google")}
      </Button>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-foreground/40">
        <span className="h-px flex-1 bg-linear-to-l from-primary/15 to-transparent" />
        {t("auth.method.or")}
        <span className="h-px flex-1 bg-linear-to-r from-primary/15 to-transparent" />
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full gap-2.5"
        onClick={onContinueWithEmail}
      >
        <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        {t("auth.method.email")}
      </Button>

      <AuthError message={errorMessage} />
    </div>
  );
}
