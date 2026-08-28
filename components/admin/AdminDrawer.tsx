"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The sidebar's mobile form: an off-canvas panel over the content.
 *
 * Follows the same conventions as `NavbarOverlay` on the public site — dimmed
 * backdrop, Escape to close, page scroll locked while open — but slides in
 * from whichever edge the active language starts at, instead of being pinned
 * to `dir="rtl"` the way that component is.
 */
export default function AdminDrawer({
  isOpen,
  onClose,
  children,
}: AdminDrawerProps) {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  // Everything else here positions itself with logical properties, but CSS has
  // no logical `transform`, so the direction the panel slides from is the one
  // thing that has to branch in JS. That is the project's convention anyway —
  // Tailwind's `rtl:` variant is deliberately unused (see CLAUDE.md).
  const closedTransform = isArabic ? "translate-x-full" : "-translate-x-full";

  return (
    <div
      className={[
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "absolute inset-0 cursor-pointer bg-primary/50 transition-opacity duration-200 ease-out",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div
        role="dialog"
        aria-modal={isOpen}
        aria-label={t("admin.drawer.label")}
        className={[
          "absolute inset-y-0 inset-s-0 flex w-72 max-w-[85%] flex-col bg-background shadow-2xl",
          "transition-transform duration-300 ease-out will-change-transform",
          isOpen ? "translate-x-0" : closedTransform,
        ].join(" ")}
      >
        <div className="flex justify-end p-3">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("admin.drawer.close")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
