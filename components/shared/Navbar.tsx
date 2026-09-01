"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { NavigationOverlay } from "./NavbarOverlay";
import Button from "../ui/Button";
import { getLocalizedNavLinks } from "@/constants/nav";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";

// Pixels of net scroll movement (not distance from the page top) before
// visibility flips — filters jitter/momentum noise without gating on how
// far down the page you already are. That distance-from-top gate is what
// made a long section (e.g. Hero, formerly 200vh) feel unresponsive: past
// the first 60px the old threshold was permanently satisfied and stopped
// meaning anything, no matter how tiny the actual movement was.
const SCROLL_DELTA_THRESHOLD = 5;

type NavbarTheme = "light" | "dark";
const DEFAULT_THEME: NavbarTheme = "light";

const Navbar = () => {
  const { t, i18n } = useTranslation("common");
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState<NavbarTheme>(DEFAULT_THEME);
  const lastScrollY = useRef(0);

  const locale = i18n.language === "ar" ? "ar" : "en";
  const navLinks = getLocalizedNavLinks(locale, t);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const toggleLanguage = useLanguageToggle();

  // Hide on scroll down, show on scroll up — the reverse of either was a
  // bug, not a design choice.
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const update = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY <= 10;
      const delta = currentScrollY - lastScrollY.current;

      setIsAtTop(atTop);

      if (atTop) {
        setIsVisible(true);
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        setIsVisible(false);
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        setIsVisible(true);
      }
      // else: delta within the noise band — leave visibility as-is.

      lastScrollY.current = currentScrollY;
    };

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-navbar-theme]"),
    );
    if (sections.length === 0) return;

    const firstThemeAttr = sections[0].getAttribute(
      "data-navbar-theme",
    ) as NavbarTheme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (firstThemeAttr) setTheme(firstThemeAttr);

    const navbarHeight = headerEl.offsetHeight;

    // Thin detection line right under the navbar: only sections crossing
    // that exact line are considered "intersecting".
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        // If more than one matches (edge case), take the topmost one.
        const topmost = visible.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top
            ? entry
            : closest,
        );

        const nextTheme = topmost.target.getAttribute(
          "data-navbar-theme",
        ) as NavbarTheme | null;

        if (nextTheme) setTheme(nextTheme);
      },
      {
        rootMargin: `-${navbarHeight}px 0px -${
          window.innerHeight - navbarHeight - 1
        }px 0px`,
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  const showNavbar = isVisible || isOpen || isAtTop;
  const isLightText = theme === "light";
  const navTextClass = isLightText ? "text-second" : "text-primary";

  return (
    <>
      <header
        ref={headerRef}
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
          showNavbar ? "translate-y-0" : "-translate-y-full",
          isAtTop
            ? "bg-transparent shadow-none"
            : "bg-background/10 backdrop-blur-2xl backdrop-saturate-150  shadow-[0_1px_24px_-8px_rgba(29,6,52,0.12)]",
        ].join(" ")}
      >
        <nav className="site-container px-6 py-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg bg-transparent transition-all active:scale-95 md:hidden ${navTextClass}`}
              onClick={openMenu}
              aria-label={t("nav.openMenu")}
              aria-expanded={isOpen}
            >
              <Menu size={27} />
            </button>

            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 max-md:ml-3"
              aria-label={t("nav.home")}
            >
              <Image
                src={isLightText ? "/rgr.png" : "/erer.png"}
                alt="DUR logo"
                width={25}
                height={25}
                className="object-contain"
                priority
              />
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[19px] font-medium transition-colors duration-200 font-serif mr-3 ${navTextClass}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <Button
                href={`/${locale}#contact`}
                variant={isLightText ? "outline" : "secondary"}
              >
                {t("nav.contactUs")}
              </Button>
              <Button
                type="button"
                onClick={toggleLanguage}
                variant={isLightText ? "secondary" : "primary"}
              >
                {t("nav.languageToggle")}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <NavigationOverlay isOpen={isOpen} onClose={closeMenu} />
    </>
  );
};

export default Navbar;
