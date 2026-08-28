"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useRevokeSession, type ClerkSession } from "@/hooks/useClerkSessions";
import {
  getClerkErrorMessage,
  isReverificationRequired,
} from "@/lib/clerk/user-error";

interface RevokeSessionDialogProps {
  session: ClerkSession;
  /** What the row calls this device, so the warning names the same thing. */
  deviceLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Ending a session signs that device out immediately and without warning to
 * whoever is holding it, so it is confirmed rather than done on one click —
 * the same reasoning as deleting a product image.
 */
export default function RevokeSessionDialog({
  session,
  deviceLabel,
  isOpen,
  onClose,
}: RevokeSessionDialogProps) {
  const { t } = useTranslation("common");
  const [error, setError] = useState<string | null>(null);
  const revokeSession = useRevokeSession();

  const handleConfirm = async () => {
    setError(null);
    try {
      await revokeSession.mutateAsync(session);
      onClose();
    } catch (caught) {
      setError(
        isReverificationRequired(caught)
          ? t("admin.settings.errors.reverification")
          : getClerkErrorMessage(caught, t("admin.settings.sessions.error")),
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.settings.sessions.revokeTitle")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-500/5 p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-primary/80">
            {t("admin.settings.sessions.revokeWarning", {
              device: deviceLabel,
            })}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("admin.categories.form.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={revokeSession.isPending}
            onClick={handleConfirm}
          >
            {t("admin.settings.sessions.revokeConfirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
