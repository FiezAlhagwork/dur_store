"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ApiError } from "@/lib/api/errors";

/**
 * The page this one sits between — /login — has a full brand treatment, and
 * landing on a bare centered sentence right after it reads as a broken step
 * rather than a step at all. So both states are dressed the same way the auth
 * pages are: cream field, the ornaments hanging off the corners, content in
 * the middle.
 *
 * The clipping layer is a sibling of the content column rather than its
 * parent, matching app/[locale]/(auth)/layout.tsx. Nothing here renders a
 * Turnstile iframe, so the `#clerk-captcha` restriction in CLAUDE.md does not
 * actually bind on this page — but keeping the same structure means the two
 * screens cannot drift apart visually, and nobody has to work out which of the
 * two patterns this one was allowed to use.
 */
function RedirectShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-second px-5 py-12 sm:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/eger.webp"
          alt=""
          aria-hidden="true"
          width={200}
          height={200}
          className="pointer-events-none absolute -left-8 -top-11 w-80 select-none sm:w-90 md:-left-12 md:-top-22 md:w-120"
        />
        <Image
          src="/eger.webp"
          alt=""
          aria-hidden="true"
          width={200}
          height={200}
          className="pointer-events-none absolute -bottom-8 -right-8 w-70 rotate-180 select-none sm:w-60 md:-bottom-12 md:-right-22 md:w-90"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}

/**
 * Role-check router page, per CLAUDE.md. Exactly 3 states:
 * 1. Loading - fetching role from Laravel.
 * 2. Success - redirect based on role (no UI of its own, just a redirect).
 * 3. Error (retries exhausted) - static screen with a manual "try again".
 *
 * 401 redirects straight back to sign-in with no retry; any other failure
 * gets a couple of quick retries (see hooks/useCurrentUser.ts) before
 * falling back to the error screen. Never assumes a default role on
 * failure, and the error screen never redirects on its own.
 */
export default function RedirectAfterLoginClient() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale === "en" ? "en" : "ar";

  const { data, error, isError, refetch } = useCurrentUser();
  const is401 =
    isError && error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (is401) router.replace(`/${locale}/login`);
  }, [is401, router, locale]);

  useEffect(() => {
    if (!data) return;
    router.replace(
      data.role === "admin" ? `/${locale}/dashboard` : `/${locale}`,
    );
  }, [data, router, locale]);

  if (isError && !is401) {
    return (
      <RedirectShell>
        {/* Same glass panel as `AuthCard`, so the failure looks like part of
            the flow the visitor was already in rather than a system page. */}
        <div className="rounded-[28px] border border-white/60 bg-background/90 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_24px_60px_-30px_rgba(29,6,52,0.35)] sm:p-8">
          <div className="mb-7 flex justify-center">
            <Image
              src="/erer.png"
              alt="DUR"
              width={48}
              height={48}
              priority
              className="object-contain"
            />
          </div>

          <h1 className="font-serif text-2xl font-bold text-primary sm:text-[1.7rem]">
            {t("auth.redirect.error.title")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            {t("auth.redirect.error.description")}
          </p>

          {/* The visitor gets the translated copy above; this shows the raw
              server response in development only, so a failing request can be
              diagnosed without digging through the network tab. */}
          {process.env.NODE_ENV === "development" && error && (
            <pre className="mt-5 max-w-full overflow-x-auto whitespace-pre-wrap rounded-2xl border border-primary/10 bg-primary/5 p-3 text-start text-xs leading-relaxed text-foreground/70">
              {error.message}
            </pre>
          )}

          <Button
            type="button"
            size="lg"
            className="mt-7 w-full"
            onClick={() => refetch()}
          >
            {t("auth.redirect.error.retry")}
          </Button>
        </div>
      </RedirectShell>
    );
  }

  return (
    <RedirectShell>
      {/*
        `role="status"` announces the wait once, to a screen reader that would
        otherwise be told nothing at all while the role is fetched. The ring is
        `aria-hidden` because the sentence under it already says this.
      */}
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-6 text-center"
      >
        <Image
          src="/erer.png"
          alt="DUR"
          width={52}
          height={52}
          priority
          className="object-contain"
        />

        {/* A ring rather than a bar: it holds its shape when the animation is
            switched off, so a reduced-motion visitor still sees a deliberate
            mark instead of an empty gap. */}
        <span
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-2 border-primary/15 border-t-primary motion-reduce:animate-none"
        />

        <p className="text-sm leading-relaxed text-foreground/60">
          {t("auth.redirect.loading")}
        </p>
      </div>
    </RedirectShell>
  );
}
