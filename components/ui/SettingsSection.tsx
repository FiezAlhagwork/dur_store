"use client";

import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  /** One line under the heading, for a section whose purpose is not obvious. */
  description?: string;
  children: ReactNode;
}

/**
 * The card a settings section sits in — used by both the account page and the
 * store page, which is why it lives in `ui/` rather than beside either of them.
 *
 * `DashboardSection` looks similar but is built around a list that can be
 * empty (`isEmpty` + `emptyMessage`); nothing here is a list, so reusing it
 * would mean passing an empty message that never renders.
 */
export default function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="rounded-3xl border border-primary/10 bg-background p-5 shadow-[0_1px_3px_-1px_rgba(29,6,52,0.08)] sm:p-6">
      <h2 className="font-serif text-base font-bold text-primary">{title}</h2>

      {description && (
        <p className="mt-1 text-sm leading-relaxed text-foreground/60">
          {description}
        </p>
      )}

      <div className="mt-5">{children}</div>
    </section>
  );
}
