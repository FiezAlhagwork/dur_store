"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import { getLocalizedNavLinks } from "@/constants/nav";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { NavigationOverlayProps } from "@/types";


export function NavigationOverlay({ isOpen, onClose }: NavigationOverlayProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";

  const navLinks = getLocalizedNavLinks(locale, t);

  const switchLanguage = useLanguageToggle();

  const toggleLanguage = () => {
    switchLanguage();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={[
        "fixed inset-0 z-999 flex justify-start md:hidden",
        !isOpen ? "pointer-events-none" : "",
      ].join(" ")}
      dir="rtl"
      aria-hidden={!isOpen}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 cursor-pointer bg-black/70 transition-opacity duration-200 ease-out",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div
        role="dialog"
        aria-modal={isOpen}
        aria-label="قائمة التنقل"
        className={[
          "relative z-10 flex h-full w-full max-w-sm flex-col border-l border-[#1d0634]/10 bg-second p-8 shadow-2xl backdrop-blur-xl",
          "transition-transform duration-300 ease-out will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.closeMenu")}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1d0634]/10 bg-[#1d0634] text-[#ede8d5] shadow-md transition-transform active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-2 flex flex-1 flex-col items-start gap-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              style={{ transitionDelay: isOpen ? `${100 + i * 90}ms` : "0ms" }}
              className={[
                "inline-block w-full origin-right py-1 text-[1.8rem] font-bold tracking-[0.02em] text-primary font-serif transition-[opacity,transform] duration-500 ease-out will-change-transform hover:text-[#2c0c4a]",
                isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          style={{ transitionDelay: isOpen ? "180ms" : "0ms" }}
          className={[
            "mt-auto border-t border-white/10 pt-6 transition-[opacity,transform] duration-300 ease-out",
            isOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[15px] font-bold font-serif text-second transition-all duration-200 hover:scale-[1.03]"
              >
                {t("nav.languageToggle")}
              </button>
              <Button href={`/${locale}#contact`} className="">
                {t("nav.contactUs")}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}