"use client";

import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";

interface SectionSaveBarProps {
  isPending: boolean;
  /** Disabled until something actually changed. */
  isDirty: boolean;
  isSaved: boolean;
  error: string | null;
}

/** The footer every card on the store page ends with. */
export default function SectionSaveBar({
  isPending,
  isDirty,
  isSaved,
  error,
}: SectionSaveBarProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-primary/10 pt-4">
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {/* Shown only while the form is untouched since the save, so it
            disappears the moment editing resumes rather than lingering next to
            unsaved changes. */}
        {isSaved && !isDirty && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {t("admin.site.saved")}
          </p>
        )}

        <Button type="submit" size="sm" isLoading={isPending} disabled={!isDirty}>
          {t("admin.site.save")}
        </Button>
      </div>
    </div>
  );
}
