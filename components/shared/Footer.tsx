"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getLocalizedNavLinks } from "@/constants/nav";
import { getContactDetails, getSocialLinks } from "@/constants";
import { useSettings } from "@/hooks/useSettings";

export default function Footer() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const navLinks = getLocalizedNavLinks(locale, t);
  const { settings } = useSettings();
  const contactDetails = getContactDetails(settings, locale);
  const socialLinks = getSocialLinks(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-primary text-second">

      <Image
        src="/footer.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -left-30 -top-13 w-80 select-none sm:w-90 md:-left-12 md:-top-22 md:w-95"
      />
      <Image
        src="/footer.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -bottom-18 -right-8 w-70  rotate-180 select-none  sm:w-60 md:-bottom-20 md:-right-22 md:w-90"
      />
      <div className="site-container py-14 md:py-20 z-100">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div>
            <Image
              src="/rgr.png"
              alt="DUR logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-second/70">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-second/50">
              {t("footer.quickLinks")}
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-second/80 transition-colors duration-200 hover:text-second"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-second/50">
              {t("footer.getInTouch")}
            </p>
            <ul className="mt-4 space-y-3">
              {contactDetails.map(({ icon: Icon, labelKey, value, href }) => (
                <li key={labelKey} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-second/10 text-second">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm text-second/80 transition-colors duration-200 hover:text-second"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="text-sm text-second/80">{value}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-second/20 text-second transition-all duration-200 hover:border-second hover:bg-second hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/*
          Privacy and terms links used to point at `href="#"` — clickable but
          going nowhere. The settings API has no `legal` group yet (only
          brand/contact/social/home_hero exist today), so there is nothing
          real to link to. Removed rather than left as dead links; they come
          back on their own once `legal.privacy_url`/`terms_url` exist and this
          section is wired to read them.
        */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-second/10 pt-6 text-center text-xs text-second/60 sm:flex-row sm:justify-between sm:text-start">
          <p>
            © {year} DUR — {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
