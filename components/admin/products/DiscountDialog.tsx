"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useUpdateProduct } from "@/hooks/useProducts";
import { ApiError } from "@/lib/api/errors";
import { formatPrice, getLocalizedName } from "@/utils/helper";
import type { Product } from "@/types/product";

interface DiscountDialogProps {
  product: Product;
  locale: "ar" | "en";
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Puts a discount on one product, or takes it off, without opening the full
 * twelve-field form.
 *
 * Running a sale means touching one number across many products, and the
 * product form is built for editing a piece — not for a pass over the
 * catalogue. This is the exception the plan carved out to the "large forms get
 * their own route" rule: two fields belong in a dialog.
 *
 * It sends only `has_discount` and `discount_value`. In particular it never
 * sends `slug`, for the reason documented in types/product.ts — re-sending a
 * product's own slug risks a uniqueness 422 that has nothing to do with the
 * discount being set.
 */
export default function DiscountDialog({
  product,
  locale,
  isOpen,
  onClose,
}: DiscountDialogProps) {
  const { t } = useTranslation("common");
  const updateProduct = useUpdateProduct();

  /*
   * `has_discount` is what decides whether a discount exists — not whether
   * `discount_value` happens to hold a number.
   *
   * Removing a discount leaves the old value in the database (confirmed:
   * `has_discount: false` came back alongside `discount_value: 12`, with
   * `final_price` and `discount` both correctly cleared). That looks
   * deliberate — the server remembering the last value so it can be switched
   * back on — but it means reading the number on its own re-offers a discount
   * the admin already removed.
   */
  const [value, setValue] = useState(
    product.has_discount && product.discount_value != null
      ? String(product.discount_value)
      : "",
  );
  const [error, setError] = useState<string | null>(null);
  /**
   * The raw server response, shown in development only.
   *
   * This dialog used to swallow failures in a bare `catch {}` and show the
   * *delete a product* message, which is how a failed removal could look like
   * unrelated noise and go unnoticed while the discount stayed live. Every
   * other error surface in the dashboard prints the status and message in
   * development; the one screen whose write was actually failing was the only
   * one that said nothing.
   */
  const [debugError, setDebugError] = useState<string | null>(null);

  /** Same percentage formula as the product form, confirmed against the API. */
  const parsed = Number(value);
  const previewPrice =
    Number.isFinite(parsed) && parsed > 0 && parsed <= 100
      ? product.price * (1 - parsed / 100)
      : null;

  const save = async (hasDiscount: boolean) => {
    setError(null);
    setDebugError(null);

    if (hasDiscount && (!Number.isFinite(parsed) || parsed <= 0)) {
      setError(t("admin.products.form.errors.discountRequired"));
      return;
    }

    if (hasDiscount && parsed > 100) {
      setError(t("admin.products.form.errors.discountMax"));
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        payload: hasDiscount
          ? { has_discount: true, discount_value: parsed }
          : /*
             * Removing sends the flag alone, and deliberately does not force
             * `discount_value: 0`.
             *
             * The server keeps the old value when the flag goes false, while
             * correctly clearing `final_price` and `discount`. That reads as
             * remembering the last discount so it can be switched back on, so
             * overwriting it with zero would destroy something useful to fix a
             * problem that was never the server's: the stale number only ever
             * surfaced because this dialog read it without checking
             * `has_discount` first. It does now.
             */
            { has_discount: false },
      });

      onClose();
    } catch (caught) {
      setError(t("admin.products.discount.error"));

      if (caught instanceof ApiError) {
        /*
         * The status alone separates the possibilities that look identical
         * from the outside: `0` means no response ever came back (network,
         * CORS, timeout — see toApiError), `401` an expired token, `422` a
         * payload the server rejected. `errors` names which field, on a 422.
         */
        setDebugError(
          [
            `${caught.status} — ${caught.message}`,
            caught.errors ? JSON.stringify(caught.errors, null, 2) : null,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.products.discount.title")}
      description={getLocalizedName(product, locale)}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground/60">
          {getLocalizedName(product, locale)} —{" "}
          <span className="tabular-nums">
            {formatPrice(product.price, locale)}
          </span>
        </p>

        <Input
          type="number"
          step="0.01"
          min="0"
          max="100"
          label={t("admin.products.form.discountValue")}
          hint={t("admin.products.form.discountValueHint")}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />

        {previewPrice !== null && (
          <p className="text-sm text-foreground/60">
            {t("admin.products.form.finalPrice")}:{" "}
            <span className="font-semibold tabular-nums text-primary">
              {formatPrice(previewPrice, locale)}
            </span>
          </p>
        )}

        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}

        {/* The visitor gets the translated line above; this is the raw server
            response, in development only — same as ProductsManager. */}
        {process.env.NODE_ENV === "development" && debugError && (
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-3 text-start text-xs text-foreground/70">
            {debugError}
          </pre>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          {/* Only offered when there is something to remove. */}
          {product.has_discount && (
            <Button
              type="button"
              variant="ghost"
              isLoading={updateProduct.isPending}
              onClick={() => save(false)}
            >
              {t("admin.products.discount.remove")}
            </Button>
          )}
          <Button
            type="button"
            isLoading={updateProduct.isPending}
            onClick={() => save(true)}
          >
            {t("admin.products.discount.apply")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
