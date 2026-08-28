"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { AuthMode } from "@/types";

interface AuthCardProps {
  mode: AuthMode;
  children: ReactNode;
}

/**
 * The glass card both auth pages sit in. Login and register differ only in
 * their copy and in which page they point at, so everything else lives here
 * rather than being repeated in each page.
 */
export default function AuthCard({ mode, children }: AuthCardProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const isLogin = mode === "login";

  return (
    <div className="w-full">
      {/* The brand panel is hidden below `lg`, so the mark is repeated here to
          keep the page branded on phones. */}
      <div className="mb-8 flex justify-center lg:hidden">
        <Image
          src="/erer.png"
          alt="DUR"
          width={48}
          height={48}
          priority
          className="object-contain"
        />
      </div>

      {/*
        Deliberately no `backdrop-blur` / `backdrop-saturate` here, unlike the
        similar card in ContactCTA.

        `backdrop-filter` makes the element a containing block and a stacking
        context, and Clerk's Smart CAPTCHA renders a Cloudflare Turnstile
        iframe inside this card (see the `#clerk-captcha` note in
        components/auth/AuthFlow.tsx). That iframe is the one thing on the
        page that must not be composited through a filtered ancestor. The
        opacity is raised to keep the same soft look without the filter.
      */}
      <div className="rounded-[28px] border border-white/60 bg-background/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_24px_60px_-30px_rgba(29,6,52,0.35)] sm:p-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-serif text-2xl font-bold text-primary sm:text-[1.7rem]">
            {isLogin ? t("auth.login.title") : t("auth.register.title")}
          </h1>
          <p className="text-sm leading-relaxed text-foreground/60">
            {isLogin ? t("auth.login.subtitle") : t("auth.register.subtitle")}
          </p>
        </div>

        <div className="mt-7">{children}</div>
      </div>

      {/*
        Each page is a dead end without this: the two pages do converge on their
        own (Clerk transfers a new email on /login into a sign-up, and a known
        one on /register into a sign-in), but someone who lands on the wrong
        one has no way to say so.
      */}
      <p className="mt-6 text-center text-sm text-foreground/60">
        {isLogin
          ? t("auth.switch.toRegisterPrompt")
          : t("auth.switch.toLoginPrompt")}{" "}
        <Link
          href={`/${locale}/${isLogin ? "register" : "login"}`}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        >
          {isLogin
            ? t("auth.switch.toRegisterAction")
            : t("auth.switch.toLoginAction")}
        </Link>
      </p>
    </div>
  );
}
