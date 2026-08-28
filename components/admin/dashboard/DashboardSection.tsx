"use client";

import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  /** Shown instead of `children` when there is nothing to list. */
  emptyMessage: string;
  isEmpty: boolean;
  children: ReactNode;
  className?: string;
}

/** The card every panel on the overview sits in. */
export default function DashboardSection({
  title,
  emptyMessage,
  isEmpty,
  children,
  className = "",
}: DashboardSectionProps) {
  return (
    <section
      className={`rounded-3xl border border-primary/10 bg-background p-5 shadow-[0_1px_3px_-1px_rgba(29,6,52,0.08)] sm:p-6 ${className}`}
    >
      <h2 className="font-serif text-base font-bold text-primary">{title}</h2>

      <div className="mt-4">
        {isEmpty ? (
          <p className="py-6 text-center text-sm text-foreground/50">
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
