"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Announced to assistive tech alongside `title`; optional. */
  description?: string;
}

/**
 * The app's first general-purpose dialog — `AdminDrawer` exists but is
 * purpose-built for the mobile nav, not reusable for a form or a
 * confirmation. Closes on Escape and on a backdrop click, and locks page
 * scroll while open, matching the conventions `AdminDrawer` and
 * `NavbarOverlay` already established.
 *
 * Unlike the auth pages' `#clerk-captcha` card, nothing here renders a
 * third-party widget, so the `overflow-hidden`/`backdrop-filter` restriction
 * documented in CLAUDE.md for that flow does not apply — this panel blurs its
 * backdrop and clips its body the same way `ContactCTA`'s glass card does.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  const { t } = useTranslation("common");

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-primary/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/60 bg-background shadow-[0_24px_60px_-30px_rgba(29,6,52,0.45)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-primary/10 p-5 sm:p-6">
          <div>
            <h2
              id="modal-title"
              className="font-serif text-lg font-bold text-primary"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="mt-1 text-sm text-foreground/60"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/5 hover:text-primary"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
