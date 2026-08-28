"use client";

import Link from "next/link";
import type { AdminNavItem } from "@/types";

interface AdminNavLinkProps {
  item: AdminNavItem;
  isCollapsed: boolean;
  /** Lets the mobile drawer close itself when a section is chosen. */
  onNavigate?: () => void;
}

export default function AdminNavLink({
  item,
  isCollapsed,
  onNavigate,
}: AdminNavLinkProps) {
  const { label, href, icon: Icon, isActive } = item;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      // The visible text is the only thing collapsing removes, so the label
      // has to survive both for assistive tech and as a hover hint.
      aria-label={label}
      title={isCollapsed ? label : undefined}
      className={[
        "flex items-center gap-3 rounded-2xl py-2.5 text-sm font-medium transition-colors duration-200",
        isCollapsed ? "justify-center px-0" : "px-3",
        isActive
          ? "bg-primary text-second"
          : "text-primary/70 hover:bg-primary/5 hover:text-primary",
      ].join(" ")}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
