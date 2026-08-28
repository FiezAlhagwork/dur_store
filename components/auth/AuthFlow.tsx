"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MethodStep from "./MethodStep";
import EmailStep from "./EmailStep";
import CodeStep from "./CodeStep";
import { useResendCountdown } from "@/hooks/useResendCountdown";
import {
  finalizeAuth,
  resendEmailCode,
  SESSION_EXISTS_ERROR_CODE,
  startEmailAuth,
  verifyEmailCode,
} from "@/lib/auth/orchestration";
import type { AuthMode, AuthPendingFlow, AuthStep, CodeState } from "@/types";
import type { EmailFormValues, CodeFormValues } from "@/schema/auth";

const RESEND_SECONDS = 30;

export default function AuthFlow({ mode }: { mode: AuthMode }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const router = useRouter();

  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const countdown = useResendCountdown(RESEND_SECONDS);

  const [step, setStep] = useState<AuthStep>("method");
  const [email, setEmail] = useState("");
  const [pendingFlow, setPendingFlow] = useState<AuthPendingFlow | null>(null);
  const [codeState, setCodeState] = useState<CodeState>("awaiting");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace(`/${locale}/redirect-after-login`);
    }
  }, [authLoaded, isSignedIn, router, locale]);

  const handleContinueWithEmail = useCallback(() => {
    setErrorMessage(null);
    setStep("email");
  }, []);

  const handleGoogleClick = useCallback(async () => {
    if (!signIn || !signUp) return;
    setErrorMessage(null);
    setIsGoogleLoading(true);

    // These two URLs are NOT interchangeable:
    //   redirectCallbackUrl -> only used when the OAuth attempt still needs
    //     something (e.g. it has to transfer between sign-in and sign-up), so
    //     it points at the /sso-callback handler page.
    //   redirectUrl -> used when a session was created and the flow is done,
    //     so it must be the real final destination. Pointing this at
    //     /sso-callback instead makes that page try to process an
    //     already-finished callback, find nothing to do, and bounce the user
    //     out to Clerk's hosted Account Portal.
    const origin = window.location.origin;
    const isLogin = mode === "login";
    const resource = isLogin ? signIn : signUp;

    // Same destination rule as the email flow (see finalizeAuth in
    // lib/auth/orchestration.ts): a completed sign-in needs the Laravel role
    // check, while a completed sign-up is always a brand-new `customer` whose
    // Laravel row may not exist yet, so it goes straight home. The transfer
    // cases resolve on the callback page instead, via its
    // signIn/signUpFallbackRedirectUrl props.
    const { error } = await resource.sso({
      strategy: "oauth_google",
      redirectUrl: `${origin}/${locale}${isLogin ? "/redirect-after-login" : ""}`,
      redirectCallbackUrl: `${origin}/${locale}/sso-callback`,
    });

    if (error) {
      if (error.code === SESSION_EXISTS_ERROR_CODE) {
        router.replace(`/${locale}/redirect-after-login`);
        return;
      }
      setErrorMessage(error.message);
      setIsGoogleLoading(false);
    }
  }, [mode, signIn, signUp, locale, router]);

  const handleEmailSubmit = useCallback(
    async (values: EmailFormValues) => {
      if (!signIn || !signUp) return;
      setErrorMessage(null);

      const result = await startEmailAuth({
        mode,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        signIn,
        signUp,
      });

      if ("error" in result) {
        if (result.code === SESSION_EXISTS_ERROR_CODE) {
          router.replace(`/${locale}/redirect-after-login`);
          return;
        }
        setErrorMessage(result.error);
        return;
      }

      setEmail(values.email);
      setPendingFlow(result.flow);
      setCodeState("awaiting");
      countdown.start();
      setStep("code");
    },
    [mode, signIn, signUp, countdown, router, locale],
  );

  const handleResend = useCallback(async () => {
    if (!signIn || !signUp || !pendingFlow || countdown.isActive) return;
    setErrorMessage(null);

    const result = await resendEmailCode({ flow: pendingFlow, signIn, signUp });
    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }
    countdown.start();
  }, [signIn, signUp, pendingFlow, countdown]);

  const handleCodeSubmit = useCallback(
    async (values: CodeFormValues) => {
      if (!signIn || !signUp || !pendingFlow) return;
      setErrorMessage(null);
      setCodeState("verifying");

      const result = await verifyEmailCode({
        flow: pendingFlow,
        code: values.code,
        signIn,
        signUp,
      });

      if (result.status === "wrongCode") {
        setCodeState("wrongCode");
        return;
      }
      if (result.status === "expired") {
        setCodeState("expired");
        return;
      }
      if (result.status === "error") {
        setCodeState("error");
        setErrorMessage(result.message);
        return;
      }

      const finalized = await finalizeAuth({
        flow: pendingFlow,
        signIn,
        signUp,
      });
      if ("error" in finalized) {
        setCodeState("error");
        // A `details` message means the sign-in/sign-up could not complete
        // because of how the Clerk instance is configured, not because of
        // anything the visitor typed. Log the specifics for us and let
        // CodeStep fall back to the generic translated copy for them.
        if (finalized.details) {
          console.error(`[auth] ${finalized.details}`);
          setErrorMessage(null);
          return;
        }
        setErrorMessage(finalized.error);
        return;
      }

      router.push(
        finalized.redirectTo === "home"
          ? `/${locale}`
          : `/${locale}/redirect-after-login`,
      );
    },
    [signIn, signUp, pendingFlow, router, locale],
  );

  /**
   * One step back: code -> email, email -> method. The code step also drops
   * its countdown and error state on the way out, so coming back to it later
   * starts clean instead of resuming a stale cooldown.
   */
  const handleBack = useCallback(() => {
    setErrorMessage(null);

    if (step === "code") {
      countdown.reset();
      setCodeState("awaiting");
      setStep("email");
      return;
    }

    setStep("method");
  }, [step, countdown]);

  // Already signed in: the effect above is redirecting, render nothing so
  // the form never flashes on screen just to error out on submit.
  if (!authLoaded || isSignedIn) {
    return null;
  }

  // The arrow has to point back along the reading direction, so it is picked
  // in JS rather than through Tailwind's `rtl:` variant — same convention as
  // the rest of the app.
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="w-full">

     {step !== "method" && (
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/60 transition-colors hover:text-primary"
        >
          <BackIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          {step === "code" ? t("auth.email.change") : t("auth.back.toMethods")}
        </button>
      )}

      <div key={step} className="auth-step-in flex w-full flex-col gap-6 ">
        {step === "method" && (
          <MethodStep
            mode={mode}
            onContinueWithEmail={handleContinueWithEmail}
            onGoogleClick={handleGoogleClick}
            isGoogleLoading={isGoogleLoading}
            errorMessage={errorMessage}
          />
        )}

        {step === "email" && (
          <EmailStep
            mode={mode}
            defaultEmail={email}
            onSubmit={handleEmailSubmit}
            errorMessage={errorMessage}
          />
        )}

        {step === "code" && pendingFlow && (
          <CodeStep
            email={email}
            codeState={codeState}
            resendRemaining={countdown.remaining}
            errorMessage={errorMessage}
            onSubmit={handleCodeSubmit}
            onResend={handleResend}
          />
        )}
      </div>

      {/*
        Clerk's Smart CAPTCHA (bot sign-up protection) renders into this
        element, and it must already be in the DOM by the time
        `signUp.create()` is called — which happens on both pages here: the
        register page calls it directly, and the login page reaches it via
        the `transfer: true` path (see lib/auth/orchestration.ts). So it
        stays mounted across every step rather than living inside one of
        them. Without it Clerk silently falls back to Invisible CAPTCHA,
        which blocks suspected bots outright instead of letting a
        false-positive human prove otherwise.

        It must never be `display: none` either. Cloudflare Turnstile (what
        Clerk renders here) cannot lay itself out inside a hidden element, so
        hiding the empty placeholder — as `empty:hidden` did — stalls the
        widget and makes sign-up hang for seconds before the challenge shows.
        It sits outside the flex container above instead, so an empty
        placeholder costs no `gap-6` slot while staying visible.
      */}
      <div id="clerk-captcha" />
    </div>
  );
}
