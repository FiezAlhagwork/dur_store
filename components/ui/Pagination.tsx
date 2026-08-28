"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  /** Disables both arrows while a page is in flight. */
  isDisabled?: boolean;
}

/**
 * Previous/next paging for Laravel's paginator.
 *
 * Lives in `ui/` rather than `admin/` because the public catalogue needs the
 * same control once it moves off mock data — `GET /api/products` is paginated
 * for everyone, not just the dashboard.
 *
 * Renders nothing for a single page: a pager that can never do anything is
 * just noise.
 */
export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  isDisabled = false,
}: PaginationProps) {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";

  if (lastPage <= 1) return null;

  // "Previous" points backwards along the reading direction, which flips with
  // the language — the same reasoning as the sidebar collapse chevron.
  const PreviousIcon = isArabic ? ChevronRight : ChevronLeft;
  const NextIcon = isArabic ? ChevronLeft : ChevronRight;

  const buttonClassName =
    "flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 text-primary transition-colors hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      className="flex items-center justify-center gap-4"
      aria-label={t("common.pagination.label")}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isDisabled || currentPage <= 1}
        aria-label={t("common.pagination.previous")}
        className={buttonClassName}
      >
        <PreviousIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      <span className="text-sm tabular-nums text-foreground/60">
        {t("common.pagination.status", {
          current: currentPage,
          total: lastPage,
        })}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isDisabled || currentPage >= lastPage}
        aria-label={t("common.pagination.next")}
        className={buttonClassName}
      >
        <NextIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
