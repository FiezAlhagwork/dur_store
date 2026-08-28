"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Lands here after the user completes the Google OAuth redirect started by
 * `AuthFlow`'s `signIn.sso()` / `signUp.sso()` call (see components/auth).
 * `AuthenticateWithRedirectCallback` finishes the flow and detects whether
 * it completed a sign-in or a sign-up, routing to the matching fallback URL
 * below — same signIn-vs-signUp destination rule as the email flow in
 * lib/auth/orchestration.ts (signUp -> home, signIn -> role check).
 *
 * Note: if the OAuth attempt cannot complete (e.g. the Clerk instance still
 * requires an attribute this flow never collects, such as a password), Clerk
 * redirects to the configured sign-in URL instead. That URL is set on
 * `<ClerkProvider>` in app/layout.tsx — without it Clerk falls back to its
 * hosted Account Portal, dropping the user out of our custom UI.
 */
export default function SSOCallbackPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === "en" ? "en" : "ar";
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-foreground/60">{t("auth.redirect.loading")}</p>

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={`/${locale}/redirect-after-login`}
        signUpFallbackRedirectUrl={`/${locale}`}
      />
    </div>
  );
}
