"use client";

import { CheckCircle2, Package, PauseCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import CountUp from "@/components/shared/CountUp";
import type { DashboardProductsCount } from "@/types/dashboard";

export default function StatCards({
  counts,
}: {
  counts: DashboardProductsCount;
}) {
  const { t } = useTranslation("common");

  const cards = [
    {
      key: "total",
      label: t("admin.overview.stats.total"),
      value: counts.total,
      icon: Package,
      tone: "text-primary",
    },
    {
      key: "active",
      label: t("admin.overview.stats.active"),
      value: counts.active,
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      key: "inactive",
      label: t("admin.overview.stats.inactive"),
      value: counts.inactive,
      icon: PauseCircle,
      tone: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(({ key, label, value, icon: Icon, tone }) => (
        <div
          key={key}
          className="flex items-center gap-4 rounded-3xl border border-primary/10 bg-background p-5 shadow-[0_1px_3px_-1px_rgba(29,6,52,0.08)]"
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 ${tone}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-primary/50">
              {label}
            </p>
            {/* CountUp takes a string and parses the number back out of it. */}
            <CountUp
              value={String(value)}
              className="font-serif text-2xl font-bold text-primary"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
