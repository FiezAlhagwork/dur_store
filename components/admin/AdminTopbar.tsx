"use client";

import { ChevronsLeft, ChevronsRight, Languages, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import LogoutButton from "@/components/auth/LogoutButton";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";

interface AdminTopbarProps {
  /** Label of the section currently open, shown as the page heading. */
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDrawer: () => void;
}

export default function AdminTopbar({
  title,
  isCollapsed,
  onToggleCollapse,
  onOpenDrawer,
}: AdminTopbarProps) {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";
  const toggleLanguage = useLanguageToggle();

  /*
   * The chevrons have to point at the edge the sidebar is heading for, which
   * flips with the language: collapsing moves it toward the start edge (left
   * in English, right in Arabic) and expanding moves it back.
   *
   * Both flips cancel out, so the icon is simply "left when the two flags
   * agree":
   *   English + expanded  -> collapsing, toward the left  -> ChevronsLeft
   *   English + collapsed -> expanding,  toward the right -> ChevronsRight
   *   Arabic  + expanded  -> collapsing, toward the right -> ChevronsRight
   *   Arabic  + collapsed -> expanding,  toward the left  -> ChevronsLeft
   */
  const CollapseIcon = isArabic === isCollapsed ? ChevronsLeft : ChevronsRight;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-primary/10 bg-background px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label={t("admin.drawer.open")}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/5 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={!isCollapsed}
        aria-label={
          isCollapsed ? t("admin.sidebar.expand") : t("admin.sidebar.collapse")
        }
        className="hidden h-10 w-10 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/5 lg:flex"
      >
        <CollapseIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      <h1 className="ms-1 truncate font-serif text-lg font-bold text-primary">
        {title}
      </h1>

      <div className="ms-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={t("nav.languageToggle")}
          className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <Languages className="h-4.5 w-4.5" aria-hidden="true" />
          <span className="hidden sm:inline">{t("nav.languageToggle")}</span>
        </button>

        <LogoutButton />
      </div>
    </header>
  );
}
